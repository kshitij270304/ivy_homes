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
            <nav className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100">
              <Link href="/listings" className="flex items-center tracking-tight">
                <span className="font-extrabold text-blue-800 text-2xl">Ivy</span>
                <span className="text-gray-800 text-2xl lowercase ml-1">homes</span>
              </Link>
              
              <div className="flex items-center gap-8">
                <div className="hidden md:flex items-center gap-6">
                  <Link href="/listings" className="text-[15px] font-medium text-gray-800 relative group">
                    Buy
                    <span className="absolute -bottom-4 left-0 w-full h-[4px] bg-blue-800 rounded-t-sm"></span>
                  </Link>
                  <Link href="/rentals" className="text-[15px] font-medium text-gray-500 hover:text-gray-800">Rent</Link>
                  <Link href="/projects" className="text-[15px] font-medium text-gray-500 hover:text-gray-800">Projects</Link>
                  <Link href="/saved" className="text-[15px] font-medium text-gray-500 hover:text-gray-800">Saved</Link>
                  <Link href="/insights" className="text-[15px] font-medium text-gray-500 hover:text-gray-800">Insights</Link>
                </div>
                <button className="p-1">
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
              </div>
            </nav>
            <main className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </SavedListingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
