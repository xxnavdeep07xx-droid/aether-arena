import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Aether Arena — India's #1 Mobile Esports Tournament Platform",
    template: "%s | Aether Arena",
  },
  description: "Compete in mobile esports tournaments — Free Fire, BGMI, COD Mobile, Minecraft & more. Win real prizes, climb the leaderboard, and rise through the ranks.",
  keywords: ["esports", "tournament", "mobile gaming", "free fire", "bgmi", "cod mobile", "competitive gaming", "prize pool", "india esports"],
  authors: [{ name: "Aether Arena" }],
  creator: "Aether Arena",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://aetherarena.com",
    siteName: "Aether Arena",
    title: "Aether Arena — India's #1 Mobile Esports Tournament Platform",
    description: "Compete in mobile esports tournaments. Win real prizes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aether Arena — Esports Tournaments",
    description: "Compete in mobile esports tournaments. Win real prizes.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0f0f1a" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
