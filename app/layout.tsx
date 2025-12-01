import type { Metadata } from "next";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "KORA - Compliance Management",
  description: "AP Worker Compliance Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <nav className="bg-white border-b border-kora-grey shadow-kora-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link href="/dashboard" className="flex items-center gap-3">
                <Image 
                  src="/kora-logo.png" 
                  alt="KORA" 
                  width={40} 
                  height={40}
                  className="h-10 w-auto"
                />
                <span className="text-xl font-bold text-kora-deep-teal">KORA</span>
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
