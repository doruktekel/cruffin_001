/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mevcut resim ayarların
  images: {
    // UNUTMA DONT FORGET TO REMOVE UNSPLASH
    domains: ["images.unsplash.com", "res.cloudinary.com"],
  },

  // Güvenlik için powered-by header'ını kaldır
  poweredByHeader: false,

  // Güvenlik header'ları
  async headers() {
    return [
      {
        // Tüm sayfalara güvenlik header'ları uygula
        source: "/(.*)",
        headers: [
          // Clickjacking koruması - iframe'de gösterilmeyi engeller
          {
            key: "X-Frame-Options",
            value: "DENY",
          },

          // MIME type sniffing'i engeller
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          // Referrer bilgisi kontrolü - dış sitelere minimum bilgi gönder
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          // Eski browser'larda XSS koruması
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },

          // Ana güvenlik politikası - Cloudinary için optimize edilmiş
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // ✅ Cloudinary ve Unsplash için img-src
              "img-src 'self' data: https: blob: https://res.cloudinary.com https://images.unsplash.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              // ✅ Cloudinary API çağrıları için
              "connect-src 'self' https://api.cloudinary.com https://res.cloudinary.com",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },

          // HTTPS zorunluluğu (Production'da aktif olacak)
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains; preload",
                },
              ]
            : []),

          // Browser API'larına erişimi kısıtla
          {
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=()",
              "geolocation=()",
              "usb=()",
              "bluetooth=()",
              "payment=()",
              "accelerometer=()",
              "gyroscope=()",
              "magnetometer=()",
            ].join(", "),
          },

          // Cross-Origin kaynak paylaşımını kontrol et
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },

          // Cross-Origin açılış politikası
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },

          // Cross-Origin kaynak politikası
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
        ],
      },

      // API routes için özel header'lar
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },

      // Static dosyalar için cache ayarları
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value:
              process.env.NODE_ENV === "production"
                ? "public, max-age=31536000, immutable"
                : "no-store, no-cache, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
