import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Load SA — Nationwide delivery marketplace",
  description:
    "Book bakkies, trucks and empty-return loads across South Africa. Verified drivers, customers and freight nationwide.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-ZA"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
          Load SA · Serving all 9 provinces · Prices in ZAR
        </footer>
      </body>
    </html>
  );
}
