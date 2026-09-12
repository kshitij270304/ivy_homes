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
                <span className="font-extrabold text-blue-800 text-2xl lowercase">ivy</span>
                <span className="text-gray-800 text-2xl lowercase ml-1">homes</span>
              </Link>
              
              <div className="flex items-center gap-8">
                <button className="hidden md:flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.573-.187-.981-.342-1.714-.652-2.823-2.413-2.909-2.531-.086-.118-.696-.927-.696-1.765 0-.838.435-1.25.59-1.424.154-.174.336-.217.449-.217.112 0 .224 0 .319.005.101.005.238-.039.373.287.142.344.484 1.186.527 1.272.043.086.071.187.014.301-.057.114-.086.187-.172.287-.086.101-.18.225-.257.307-.086.094-.176.195-.075.369.101.174.453.749.972 1.209.67.595 1.233.784 1.407.87.174.086.275.072.376-.043.101-.115.435-.506.551-.681.116-.174.232-.145.391-.087.159.058 1.002.473 1.176.56.174.086.29.143.332.223.042.08.042.463-.102.868z"/></svg>
                  Get in touch
                </button>
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
