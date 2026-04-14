import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import LeagueSidebar from "../components/LeagueSidebar";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinalTime - Live Football Scores",
  description: "Live football scores, standings, and match details",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--bg-primary)]">
        <Navbar />
        <div className="flex-1 flex w-full">
          <LeagueSidebar />
          <main className="flex-1 min-w-0 px-4 lg:px-8 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
