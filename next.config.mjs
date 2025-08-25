// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // Mevcut resim ayarların
//   images: {
//     domains: ["res.cloudinary.com"],
//   },

//   // Güvenlik için powered-by header'ını kaldır
//   poweredByHeader: false,

//   // Güvenlik header'ları
//   async headers() {
//     return [
//       {
//         // Tüm sayfalara güvenlik header'ları uygula
//         source: "/(.*)",
//         headers: [
//           // Clickjacking koruması - iframe'de gösterilmeyi engeller
//           {
//             key: "X-Frame-Options",
//             value: "DENY",
//           },

//           // MIME type sniffing'i engeller
//           {
//             key: "X-Content-Type-Options",
//             value: "nosniff",
//           },

//           // Referrer bilgisi kontrolü - dış sitelere minimum bilgi gönder
//           {
//             key: "Referrer-Policy",
//             value: "strict-origin-when-cross-origin",
//           },

//           // Eski browser'larda XSS koruması
//           {
//             key: "X-XSS-Protection",
//             value: "1; mode=block",
//           },

//           // Ana güvenlik politikası - API çağrıları için düzeltilmiş
//           {
//             key: "Content-Security-Policy",
//             value: [
//               "default-src 'self'",
//               "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com",
//               "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
//               // ✅ Cloudinary ve Unsplash için img-src
//               "img-src 'self' data: https: blob: https://res.cloudinary.com ",
//               "font-src 'self' https://fonts.gstatic.com data:",
//               // ✅ DÜZELTME: Kendi API'leriniz için connect-src - 'self' yeterli
//               "connect-src 'self' https://api.cloudinary.com https://res.cloudinary.com",
//               "frame-src 'none'",
//               "object-src 'none'",
//               "base-uri 'self'",
//               "form-action 'self'",
//               "upgrade-insecure-requests",
//             ].join("; "),
//           },

//           // HTTPS zorunluluğu (Production'da aktif olacak)
//           ...(process.env.NODE_ENV === "production"
//             ? [
//                 {
//                   key: "Strict-Transport-Security",
//                   value: "max-age=31536000; includeSubDomains; preload",
//                 },
//               ]
//             : []),

//           // Browser API'larına erişimi kısıtla
//           {
//             key: "Permissions-Policy",
//             value: [
//               "camera=()",
//               "microphone=()",
//               "geolocation=()",
//               "usb=()",
//               "bluetooth=()",
//               "payment=()",
//               "accelerometer=()",
//               "gyroscope=()",
//               "magnetometer=()",
//             ].join(", "),
//           },

//           // ✅ DÜZELTME: Cross-Origin politikalarını gevşet
//           {
//             key: "Cross-Origin-Embedder-Policy",
//             value: "unsafe-none", // require-corp'dan değiştirildi
//           },

//           // Cross-Origin açılış politikası
//           {
//             key: "Cross-Origin-Opener-Policy",
//             value: "same-origin",
//           },

//           // ✅ DÜZELTME: Cross-Origin kaynak politikası gevşetildi
//           {
//             key: "Cross-Origin-Resource-Policy",
//             value: "cross-origin", // same-origin'dan değiştirildi
//           },
//         ],
//       },

//       // API routes için özel header'lar
//       {
//         source: "/api/(.*)",
//         headers: [
//           {
//             key: "Cache-Control",
//             value: "no-store, no-cache, must-revalidate",
//           },
//           {
//             key: "X-Robots-Tag",
//             value: "noindex, nofollow",
//           },
//           // ✅ API routes için CORS header'ları ekle
//           {
//             key: "Access-Control-Allow-Origin",
//             value:
//               process.env.NODE_ENV === "production"
//                 ? "https://cruffin-001.vercel.app/" /////////////// Kendi domain'inizi yazın
//                 : "*",
//           },
//           {
//             key: "Access-Control-Allow-Methods",
//             value: "GET, POST, PUT, DELETE, OPTIONS",
//           },
//           {
//             key: "Access-Control-Allow-Headers",
//             value: "Content-Type, Authorization, X-Requested-With",
//           },
//         ],
//       },

//       // Static dosyalar için cache ayarları
//       {
//         source: "/_next/static/(.*)",
//         headers: [
//           {
//             key: "Cache-Control",
//             value:
//               process.env.NODE_ENV === "production"
//                 ? "public, max-age=31536000, immutable"
//                 : "no-store, no-cache, must-revalidate",
//           },
//         ],
//       },
//     ];
//   },
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mevcut resim ayarlarınız
  images: {
    domains: ["res.cloudinary.com"],
  },

  // Güvenlik için powered-by header'ını kaldır
  poweredByHeader: false,

  // ✅ CACHE SORUNUNU ÇÖZECEK AYARLAR - GÜÇLENDİRİLDİ
  experimental: {
    staleTimes: {
      dynamic: 0, // Dynamic sayfalar cache'lenmesin
      static: 0, // Static sayfalar cache'lenmesin
    },
    serverActions: true, // ✅ EKLE
  },

  // ✅ YENİ: Force no cache için
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/dashboard/:path*",
          destination: "/dashboard/:path*",
          has: [
            {
              type: "header",
              key: "cache-control",
              value: "no-cache",
            },
          ],
        },
      ],
    };
  },

  // Güvenlik header'ları
  async headers() {
    return [
      {
        // Tüm sayfalara güvenlik header'ları uygula
        source: "/(.*)",
        headers: [
          // Clickjacking koruması
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob: https://res.cloudinary.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "connect-src 'self' https://api.cloudinary.com https://res.cloudinary.com",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains; preload",
                },
              ]
            : []),
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
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "unsafe-none",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "cross-origin",
          },
        ],
      },

      // ✅ GÜÇLENDİRİLMİŞ CACHE KONTROLÜ
      {
        source: "/dashboard/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },

      {
        source: "/menu/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },

      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value:
              "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },

      // ✅ API ROUTES İÇİN GÜÇLENDİRİLMİŞ HEADER'LAR
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value:
              "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
          {
            key: "Access-Control-Allow-Origin",
            value:
              process.env.NODE_ENV === "production"
                ? "https://cruffin-001.vercel.app"
                : "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With",
          },
        ],
      },

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
