import {
  Marcellus,
  Nunito,
  Shadows_Into_Light,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";

const marcellus = Marcellus({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-marcellus",
});

const nunito = Nunito({
  weight: ["200", "400", "600", "800"],
  subsets: ["latin"],
  variable: "--font-nunito",
});

const shadowsIntoLight = Shadows_Into_Light({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-shadows",
});

const playfairDisplay = Playfair_Display({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-playfair",
});

// Metadata Configuration
export const metadata = {
  title: "Cruffin Bakery - Premium Lezzetler ve Özel Menü",
  description:
    "Cruffin Bakery'de eşsiz lezzetleri keşfedin. Fresh malzemelerle hazırlanan özel menümüz, vegan ve vejetaryen seçeneklerimizle unutulmaz bir yemek deneyimi sunuyor. Rezervasyon için hemen arayın!",
  keywords:
    "cruffin, restaurant, lezzetli yemek, vegan yemek, vejetaryen menü, özel tatlar, kaliteli restoran, fresh malzeme",
  author: "Cruffin Bakery",
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",

  // icons: {
  //   icon: "/favicon16.png",
  //   shortcut: "/favicon16.png",
  //   apple: "/apple-touch-icon.png", // Eğer varsa
  // },

  // Open Graph (Social Media)
  openGraph: {
    title: "Cruffin Bakery - Premium Lezzetler ve Özel Menü",
    description:
      "Eşsiz lezzetleri keşfedin. Fresh malzemelerle hazırlanan özel menümüz ile unutulmaz yemek deneyimi.",
    type: "website",
    locale: "tr_TR",
    url: "https://cruffin-001.vercel.app/", // Gerçek domain'inizi yazın
    siteName: "Cruffin Bakery",
  },

  // Additional Meta Tags
  other: {
    "theme-color": "#d97706", // Amber-600 color code
    "msapplication-TileColor": "#d97706",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="tr" // Türkçe içerik için 'tr' yapıldı
      className={`${marcellus.variable} ${nunito.variable} ${shadowsIntoLight.variable} ${playfairDisplay.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Additional meta tags if needed */}

        <link rel="icon" href="/favicon16.png" sizes="16x16" />
        <link rel="icon" href="/favicon32.png" sizes="32x32" />

        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
