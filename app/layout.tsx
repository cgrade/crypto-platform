import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import ClientErrorBoundary from "@/components/ui/ClientErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CryptPro | Trade Cryptocurrencies",
  description: "A modern crypto trading platform with portfolio management and real-time tracking",
  icons: {
    icon: [
      { url: "/images/logo.png" }
    ],
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased bg-dark-300 text-white min-h-screen" suppressHydrationWarning>
        <Providers>
          <ClientErrorBoundary>
            {children}
          </ClientErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
