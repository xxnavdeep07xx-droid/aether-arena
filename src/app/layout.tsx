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
  metadataBase: new URL("https://aetherarena.com"),
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
    images: [{ url: '/logo-hero.webp', width: 1200, height: 630, alt: "Aether Arena - India's #1 Mobile Esports Tournament Platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aether Arena — Esports Tournaments",
    description: "Compete in mobile esports tournaments. Win real prizes.",
    images: ['/logo-hero.webp'],
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('aa-theme') || 'dark';
                  if (theme === 'system') {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
