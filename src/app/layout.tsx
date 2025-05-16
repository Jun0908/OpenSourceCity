"use client";

import AppWalletProvider from "../components/AppWalletProvider";
import "@/app/globals.css";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useState, useEffect } from "react";
import Image from "next/image"; // 追加

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <html lang="en">
      <body>
        <AppWalletProvider>
          <header className="p-4 bg-gray-800 text-white">
            <nav className="flex justify-between items-center">
              {/* ロゴ画像の追加 */}
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={150}
                  height={80}
                  className="rounded"
                />
              </Link>

              {/* ナビゲーションリンク */}
              <div className="flex items-center space-x-4">
                <Link href="/garalley" className="hover:underline">
                  Gallary
                </Link>
                <Link href="/token" className="hover:underline">
                  Token
                </Link>
                <Link href="/mint" className="hover:underline">
                  Mint
                </Link>
                
                <div className="ml-4">
                  <WalletMultiButton style={{}} />
                </div>
              </div>
            </nav>
          </header>
          {children}
        </AppWalletProvider>
      </body>
    </html>
  );
}
