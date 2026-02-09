import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Noto_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/contexts/auth-context";
import { QueryProvider } from "@/components/providers/query-provider";
import { WebSocketProvider } from "@/contexts/websocket-context";
// Hugeicons does not require a context provider

// Force dynamic rendering for all pages (icon migration in progress)
export const dynamic = 'force-dynamic';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Malaka ERP - Master Data Management",
  description: "Enterprise Resource Planning system for comprehensive business management",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${notoSans.variable} font-sans antialiased`}
      >
        <QueryProvider>
          <ThemeProvider
            defaultTheme="system"
            storageKey="malaka-ui-theme"
          >
            <AuthProvider>
              <ToastProvider>
                <WebSocketProvider>
                  {children}
                </WebSocketProvider>
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
