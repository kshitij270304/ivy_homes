import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SavedListingsProvider } from "@/contexts/SavedListingsContext";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ivy Homes",
  description: "Ivy Homes Property Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}>
        <AuthProvider>
          <SavedListingsProvider>
            <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl text-blue-600">Ivy Homes</Link>
            <div className="flex gap-4">
              <Link href="/listings" className="text-sm font-medium hover:text-blue-600">Listings</Link>
              <Link href="/rentals" className="text-sm font-medium hover:text-blue-600">Rentals</Link>
              <Link href="/projects" className="text-sm font-medium hover:text-blue-600">Projects</Link>
              <Link href="/saved" className="text-sm font-medium hover:text-blue-600">Saved</Link>
              <Link href="/insights" className="text-sm font-medium hover:text-blue-600">Insights</Link>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
          </SavedListingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
