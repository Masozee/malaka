import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Malaka ERP Mobile",
    template: "%s | Malaka ERP Mobile",
  },
  description: "Malaka ERP Mobile Progressive Web Application for employee operations",
  keywords: ["ERP", "Mobile", "HR", "Inventory", "Attendance", "PWA"],
  authors: [{ name: "Malaka ERP Team" }],
  creator: "Malaka ERP",
  publisher: "Malaka ERP",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Malaka ERP Mobile",
  },
  openGraph: {
    type: "website",
    siteName: "Malaka ERP Mobile",
    title: "Malaka ERP Mobile",
    description: "Mobile access to Malaka ERP system",
  },
  twitter: {
    card: "summary",
    title: "Malaka ERP Mobile",
    description: "Mobile access to Malaka ERP system",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1d4ed8" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        <meta name="application-name" content="Malaka ERP Mobile" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Malaka ERP Mobile" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#2563eb" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://yourdomain.com" />
        <meta name="twitter:title" content="Malaka ERP Mobile" />
        <meta name="twitter:description" content="Mobile access to Malaka ERP system" />
        <meta name="twitter:image" content="/icons/icon-192x192.png" />
        <meta name="twitter:creator" content="@malaka_erp" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Malaka ERP Mobile" />
        <meta property="og:description" content="Mobile access to Malaka ERP system" />
        <meta property="og:site_name" content="Malaka ERP Mobile" />
        <meta property="og:url" content="https://yourdomain.com" />
        <meta property="og:image" content="/icons/icon-192x192.png" />
      </head>
      <body className={`font-sans antialiased bg-gray-50 text-gray-900`}>
        <div id="root" className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
