import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlanBee - 歯科診療計画共有アプリ",
  description: "歯科医院における診療計画共有と患者とのコミュニケーションを支援するWebアプリ",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PlanBee",
  },
  formatDetection: {
    telephone: false,
  },
  keywords: ["歯科", "診療計画", "患者", "コミュニケーション", "はち歯科"],
  authors: [{ name: "PlanBee Team" }],
  category: "healthcare",
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#3B82F6',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
