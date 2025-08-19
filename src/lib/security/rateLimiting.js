// lib/security/rateLimiting.js
import { NextResponse } from "next/server";
import crypto from "crypto";

// İstek sayılarını tutmak için bellek-içi depolama
// Önemli Not: Production ortamında Redis kullanmanız önerilir!
const requestCounts = new Map();
const suspiciousIPs = new Map(); // Şüpheli IP'lerin takibi için ayrı depolama

/**
 * IP adresini hash'leyerek gizliliği korur
 * @param {string} ip - IP adresi
 * @returns {string} Hash'lenmiş IP
 */
function hashIP(ip) {
  // Zaman damgası ve IP'yi birleştirerek benzersiz bir değer oluştur
  const timestamp = Math.floor(Date.now() / (1000 * 60 * 60)); // Her saat değişir
  const salt = process.env.RATE_LIMIT_SALT || timestamp.toString();
  return crypto
    .createHash("sha256")
    .update(ip + salt)
    .digest("hex")
    .substring(0, 16); // İlk 16 karakteri al
}

/**
 * Client IP adresini güvenli şekilde alır
 * @param {Request} req - Next.js request objesi
 * @returns {string} IP adresi
 */
function getClientIP(req) {
  // Çoklu proxy durumları için daha güvenli parsing
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp && isValidIP(cfConnectingIp)) {
    return cfConnectingIp;
  }

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // İlk IP'yi al, ancak private IP'leri filtrele
    const ips = forwarded.split(",").map((ip) => ip.trim());
    for (const ip of ips) {
      if (isValidIP(ip) && !isPrivateIP(ip)) {
        return ip;
      }
    }
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp && isValidIP(realIp) && !isPrivateIP(realIp)) {
    return realIp;
  }

  // Fallback - daha spesifik
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/**
 * IP validasyonu
 * @param {string} ip
 * @returns {boolean}
 */
function isValidIP(ip) {
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Private IP kontrolü
 * @param {string} ip
 * @returns {boolean}
 */
function isPrivateIP(ip) {
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^127\./,
    /^169\.254\./,
    /^::1$/,
    /^fe80:/,
    /^fc00:/,
    /^fd00:/,
  ];
  return privateRanges.some((range) => range.test(ip));
}

/**
 * Rate limiting kontrolü - Gelişmiş sliding window
 * @param {string} identifier - Unique identifier
 * @param {number} limit - Maksimum istek sayısı
 * @param {number} windowMs - Zaman penceresi
 * @param {object} options - Ek seçenekler
 * @returns {object} Rate limit sonucu
 */
function checkRateLimit(identifier, limit, windowMs, options = {}) {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Hash'lenmiş identifier kullan
  const hashedId = hashIP(identifier);

  // Mevcut istekleri al
  const requests = requestCounts.get(hashedId) || [];

  // Sliding window - eski istekleri temizle
  const recentRequests = requests.filter((req) => req.timestamp > windowStart);

  // Suspicious activity detection
  const suspiciousActivity = detectSuspiciousActivity(
    hashedId,
    recentRequests,
    options
  );

  if (suspiciousActivity.isSuspicious) {
    // Şüpheli aktivite tespit edildi - daha sıkı limit
    const suspiciousLimit = Math.floor(limit * 0.1); // %10'una düşür

    if (recentRequests.length >= suspiciousLimit) {
      // Şüpheli IP'yi kaydet
      suspiciousIPs.set(hashedId, {
        detectedAt: now,
        reason: suspiciousActivity.reason,
        requestCount: recentRequests.length,
      });

      return {
        success: false,
        remaining: 0,
        resetTime:
          Math.min(...recentRequests.map((r) => r.timestamp)) + windowMs,
        limit: suspiciousLimit,
        current: recentRequests.length,
        suspicious: true,
        reason: suspiciousActivity.reason,
      };
    }
  }

  // Normal limit kontrolü
  if (recentRequests.length >= limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: Math.min(...recentRequests.map((r) => r.timestamp)) + windowMs,
      limit,
      current: recentRequests.length,
      suspicious: false,
    };
  }

  // Yeni isteği ekle - metadata ile birlikte
  const requestInfo = {
    timestamp: now,
    userAgent: options.userAgent || "unknown",
    endpoint: options.endpoint || "unknown",
  };

  recentRequests.push(requestInfo);
  requestCounts.set(hashedId, recentRequests);

  return {
    success: true,
    remaining: limit - recentRequests.length,
    resetTime: now + windowMs,
    limit,
    current: recentRequests.length,
    suspicious: false,
  };
}

/**
 * Şüpheli aktivite tespiti
 * @param {string} hashedId
 * @param {Array} requests
 * @param {object} options
 * @returns {object}
 */
function detectSuspiciousActivity(hashedId, requests, options) {
  if (requests.length < 5) return { isSuspicious: false };

  const now = Date.now();
  const recentRequests = requests.filter((r) => r.timestamp > now - 60000); // Son 1 dakika

  // 1. Çok hızlı istekler (bot pattern)
  if (recentRequests.length >= 20) {
    const intervals = [];
    for (let i = 1; i < recentRequests.length; i++) {
      intervals.push(
        recentRequests[i].timestamp - recentRequests[i - 1].timestamp
      );
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    if (avgInterval < 50) {
      // 50ms'den hızlı
      return {
        isSuspicious: true,
        reason: "bot-like-pattern",
        details: `Average interval: ${avgInterval}ms`,
      };
    }
  }

  // 2. Şüpheli IP zaten kayıtlı mı?
  const suspiciousRecord = suspiciousIPs.get(hashedId);
  if (
    suspiciousRecord &&
    now - suspiciousRecord.detectedAt < 24 * 60 * 60 * 1000
  ) {
    return {
      isSuspicious: true,
      reason: "previously-flagged",
      details: `Flagged at: ${new Date(
        suspiciousRecord.detectedAt
      ).toISOString()}`,
    };
  }

  // 3. Aynı User-Agent ile çok fazla istek
  if (options.userAgent) {
    const sameUserAgentCount = requests.filter(
      (r) => r.userAgent === options.userAgent
    ).length;
    if (sameUserAgentCount > 50) {
      return {
        isSuspicious: true,
        reason: "suspicious-user-agent",
        details: `Same UA count: ${sameUserAgentCount}`,
      };
    }
  }

  return { isSuspicious: false };
}

/**
 * Adaptive rate limiting - endpoint'e göre dinamik limitler
 * @param {string} endpoint
 * @param {string} method
 * @returns {object}
 */
function getAdaptiveLimits(endpoint, method) {
  const baseLimits = {
    POST: { limit: 10, windowMs: 60 * 1000 }, // POST daha sıkı
    GET: { limit: 100, windowMs: 60 * 1000 },
    PUT: { limit: 5, windowMs: 60 * 1000 },
    DELETE: { limit: 5, windowMs: 60 * 1000 },
  };

  // Kritik endpoint'ler için özel limitler
  const criticalEndpoints = {
    login: { limit: 5, windowMs: 15 * 60 * 1000 },
    register: { limit: 3, windowMs: 60 * 60 * 1000 },
    "reset-password": { limit: 3, windowMs: 60 * 60 * 1000 },
    upload: { limit: 10, windowMs: 10 * 60 * 1000 },
  };

  return criticalEndpoints[endpoint] || baseLimits[method] || baseLimits["GET"];
}

/**
 * Security headers oluşturur
 */
function createSecurityHeaders(rateLimitResult) {
  const headers = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-DNS-Prefetch-Control": "off",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  };

  if (rateLimitResult) {
    headers["X-RateLimit-Limit"] = rateLimitResult.limit.toString();
    headers["X-RateLimit-Remaining"] = rateLimitResult.remaining.toString();
    headers["X-RateLimit-Reset"] = new Date(
      rateLimitResult.resetTime
    ).toISOString();

    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil(
        (rateLimitResult.resetTime - Date.now()) / 1000
      );
      headers["Retry-After"] = retryAfter.toString();

      if (rateLimitResult.suspicious) {
        headers["X-Rate-Limit-Reason"] = rateLimitResult.reason;
      }
    }
  }

  return headers;
}

/**
 * Memory temizlik fonksiyonu
 */
function cleanupMemory() {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 saat

  // Rate limit kayıtlarını temizle
  for (const [key, requests] of requestCounts.entries()) {
    const recentRequests = requests.filter(
      (req) => req.timestamp > now - maxAge
    );
    if (recentRequests.length === 0) {
      requestCounts.delete(key);
    } else {
      requestCounts.set(key, recentRequests);
    }
  }

  // Şüpheli IP kayıtlarını temizle
  for (const [key, record] of suspiciousIPs.entries()) {
    if (now - record.detectedAt > maxAge) {
      suspiciousIPs.delete(key);
    }
  }

  console.log(
    `Rate limit cleanup: ${requestCounts.size} keys, ${suspiciousIPs.size} suspicious IPs`
  );
}

/**
 * Enhanced withSecurity middleware
 */
export function withSecurity(options = {}) {
  const {
    rateLimit: customRateLimit,
    allowedMethods = ["POST", "GET"],
    requireAuth = false,
    skipRateLimit = false,
    endpoint = "api",
    adaptiveRateLimit = true,
  } = options;

  return function securityMiddleware(handler) {
    return async function securedHandler(req, ...args) {
      try {
        // 1. Method kontrolü
        if (!allowedMethods.includes(req.method)) {
          return NextResponse.json(
            {
              error: "Method not allowed",
              message: `${req.method} metodu bu endpoint için desteklenmiyor.`,
            },
            {
              status: 405,
              headers: {
                Allow: allowedMethods.join(", "),
                ...createSecurityHeaders(),
              },
            }
          );
        }

        let rateLimitResult = null;

        // 2. Rate limiting kontrolü
        if (!skipRateLimit) {
          const clientIP = getClientIP(req);
          const userAgent = req.headers.get("user-agent") || "unknown";

          // Adaptive rate limiting
          const limits = adaptiveRateLimit
            ? getAdaptiveLimits(endpoint, req.method)
            : customRateLimit || { limit: 100, windowMs: 15 * 60 * 1000 };

          const rateLimitKey = `${endpoint}:${clientIP}`;

          rateLimitResult = checkRateLimit(
            rateLimitKey,
            limits.limit,
            limits.windowMs,
            {
              userAgent,
              endpoint,
            }
          );

          // Rate limit aşıldı mı?
          if (!rateLimitResult.success) {
            const retryAfter = Math.ceil(
              (rateLimitResult.resetTime - Date.now()) / 1000
            );

            let message = `Çok fazla istek gönderiyorsunuz. ${retryAfter} saniye sonra tekrar deneyin.`;
            let status = 429;

            if (rateLimitResult.suspicious) {
              message = `Şüpheli aktivite tespit edildi. Lütfen daha sonra tekrar deneyin.`;
              status = 429; // Suspicious için de 429 kullan, bilgi verme

              // Log suspicious activity (production'da proper logging kullan)
              console.warn(`Suspicious activity detected:`, {
                endpoint,
                reason: rateLimitResult.reason,
                timestamp: new Date().toISOString(),
              });
            }

            return NextResponse.json(
              {
                error: "Too many requests",
                message,
                retryAfter,
              },
              {
                status,
                headers: createSecurityHeaders(rateLimitResult),
              }
            );
          }
        }

        // 3. Auth kontrolü
        if (requireAuth) {
          const authHeader = req.headers.get("authorization");
          const cookieToken = req.cookies?.get("token")?.value;

          if (!authHeader && !cookieToken) {
            return NextResponse.json(
              {
                error: "Authentication required",
                message: "Bu işlem için giriş yapmanız gerekiyor.",
              },
              {
                status: 401,
                headers: createSecurityHeaders(rateLimitResult),
              }
            );
          }
        }

        // 4. Handler'ı çalıştır
        const response = await handler(req, ...args);

        // 5. Security headers ekle
        if (response instanceof NextResponse) {
          const securityHeaders = createSecurityHeaders(rateLimitResult);
          Object.entries(securityHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        }

        return response;
      } catch (error) {
        console.error("Security middleware error:", error);

        return NextResponse.json(
          {
            error: "Internal server error",
            message: "Sunucu hatası oluştu. Lütfen tekrar deneyiniz.",
          },
          {
            status: 500,
            headers: createSecurityHeaders(),
          }
        );
      }
    };
  };
}

// Otomatik temizlik
if (typeof setInterval !== "undefined") {
  setInterval(cleanupMemory, 60 * 60 * 1000); // Her saat
}

// Debug ve monitoring fonksiyonları
export function getRateLimitStatus() {
  if (process.env.NODE_ENV === "development") {
    return {
      totalKeys: requestCounts.size,
      suspiciousIPs: suspiciousIPs.size,
      memoryUsage: process.memoryUsage?.() || "N/A",
      topEndpoints: getTopEndpoints(),
    };
  }
  return null;
}

function getTopEndpoints() {
  const endpointStats = {};
  for (const [key, requests] of requestCounts.entries()) {
    const endpoint = key.split(":")[0];
    endpointStats[endpoint] = (endpointStats[endpoint] || 0) + requests.length;
  }
  return Object.entries(endpointStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
}

export { cleanupMemory };
