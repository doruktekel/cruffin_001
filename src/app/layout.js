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

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${marcellus.variable} ${nunito.variable} ${shadowsIntoLight.variable} ${playfairDisplay.variable}  `}
      suppressHydrationWarning
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
