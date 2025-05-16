"use client";

import { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";

declare global {
  interface Window {
    solana?: any;
  }
}

export default function Home() {
  const [balance, setBalance] = useState<number | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getWalletBalance = async () => {
      try {
        const provider = window.solana;

        if (!provider?.isPhantom) {
          alert("Phantom Wallet is not installed.");
          setLoading(false);
          return;
        }

        const resp = await provider.connect();
        const pubKey = new PublicKey(resp.publicKey.toString());
        setPublicKey(pubKey.toBase58());

        // ✅ Helius RPC エンドポイント（ここを自分のAPIキーに置き換える）
        const heliusUrl = "https://mainnet.helius-rpc.com/?api-key=32ce7024-335d-4ffd-9d8e-2008cf29614f";
        const connection = new Connection(heliusUrl, "confirmed");

        const lamports = await connection.getBalance(pubKey);
        setBalance(lamports / 1e9);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      } finally {
        setLoading(false);
      }
    };

    getWalletBalance();
  }, []);

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Phantom Wallet Balance</h1>

      {loading ? (
        <p>Connecting to wallet...</p>
      ) : publicKey ? (
        <div className="p-4 rounded-xl shadow-lg border">
          <p className="text-lg font-medium break-all">Wallet: {publicKey}</p>
          <p className="text-xl mt-2 font-semibold">Balance: {balance?.toFixed(4)} SOL</p>
        </div>
      ) : (
        <p>Could not connect to Phantom Wallet.</p>
      )}
    </main>
  );
}



