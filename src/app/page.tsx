"use client";
import Image from "next/image";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { useEffect, useState } from "react";
import { getWorkspace, PROGRAM_ID } from "@/lib/prediction/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { useCallback } from 'react';

/* ---------- PDA helpers ---------- */
const PDA = {
  market: (owner: PublicKey) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from("market"), owner.toBuffer()],
      PROGRAM_ID
    )[0],
  bet: (market: PublicKey, bettor: PublicKey) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from("bet"), market.toBuffer(), bettor.toBuffer()],
      PROGRAM_ID
    )[0],
};

export default function HomePage() {
  const wallet = useWallet();

  const [market, setMarket] = useState<PublicKey>();
  const [yesTotal, setYesTotal] = useState(0); // Modern Shopping Mall
  const [noTotal, setNoTotal] = useState(0);  // Traditional Marketplace
  const [loading, setLoading] = useState(false);

  /* ---------- read on-chain state ---------- */
  const refreshMarket = useCallback(async (m: PublicKey) => {
  const { program } = getWorkspace(wallet as AnchorWallet);
  const acct = await program.account.market.fetch(m);
  setYesTotal(Number(acct.totalYes) / 1e9);
  setNoTotal(Number(acct.totalNo) / 1e9);
  }, [wallet]);

  /* ---------- init state on wallet connect ---------- */
  useEffect(() => {
  if (wallet.publicKey) {
    const m = PDA.market(wallet.publicKey);
    setMarket(m);
    refreshMarket(m).catch(() => {});
  }
}, [wallet.publicKey, refreshMarket]);

  /* ---------- voting action (only part adopted from bottom snippet) ---------- */
  const vote = async (yes: boolean) => {
    if (!wallet.publicKey || !market) return;
    setLoading(true);
    const { program, connection } = getWorkspace(wallet as AnchorWallet);
    const betPda = PDA.bet(market, wallet.publicKey);

    try {
      const sig = await program.methods
        .vote(yes, new anchor.BN(0.01 * 1e9)) // 0.01 SOL per vote
        .accounts({
          market,
          bet: betPda,
          bettor: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      await connection.confirmTransaction(sig, "confirmed");
      await refreshMarket(market);
      alert("Vote sent!");
    } catch (err: any) {
      alert("Vote failed:\n" + (err.message ?? err));
    }
    setLoading(false);
  };

  /* ---------- derived values ---------- */
  const total = yesTotal + noTotal;
  const yesPercent = total ? (yesTotal / total) * 100 : 0;
  const noPercent = total ? (noTotal / total) * 100 : 0;

  /* ---------- UI ---------- */
  return (
    <main className="min-h-screen bg-gray-900 p-10 text-white text-[150%]">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">Visitor Prediction Market</h1>
        <p className="text-gray-300 mb-6 text-xl">
          Predict which space design will attract more visitors
        </p>

        {!wallet.connected && (
          <p className="text-red-500 mb-6 text-xl">Connect Phantom to begin.</p>
        )}

        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-2">
            Modern Shopping Mall vs Traditional Marketplace
          </h2>
          <p className="text-lg text-gray-400 mb-2">
            Which space design will attract more visitors in the next 7 days?
          </p>
          <p className="text-sm text-gray-500 mb-6">
            🕒 Ends: May 15, 2025, 11:59 PM
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Modern Shopping Mall */}
            <div className="bg-gray-700 rounded-2xl overflow-hidden border border-gray-600 shadow-xl flex flex-col">
              <Link href="/viewer/shopping_mall" className="block">
              <Image
                src="/mall.png"
                alt="Modern Shopping Mall"
                width={640}
                height={160}
                className="w-full h-60 object-cover hover:opacity-90 transition"
              />
            </Link>
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-lg text-gray-400 mb-1">Creator: MetaDesign Studio</p>
                <h3 className="text-xl font-bold mb-3 text-white">Modern Shopping Mall</h3>
                <div className="flex justify-between text-lg text-gray-300 mb-2">
                  <span>Current Price</span>
                  <span>{total ? `OPC${yesPercent.toFixed(2)}` : "—"}</span>
                </div>
                <div className="h-3 bg-gray-600 rounded-full">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${yesPercent}%` }} />
                </div>
                <p className="text-sm text-gray-400 mt-2">{yesPercent.toFixed(0)}%</p>

                {wallet.connected && (
                  <button
                    className="mt-5 w-full px-6 py-3 bg-green-600 text-white rounded-xl text-lg"
                    onClick={() => vote(true)}
                    disabled={loading}
                  >
                    Vote Modern Mall (YES)
                  </button>
                )}
              </div>
            </div>

            {/* Traditional Marketplace */}
            <div className="bg-gray-700 rounded-2xl overflow-hidden border border-gray-600 shadow-xl flex flex-col">
              <Link href="/viewer/traditional_market" className="block">
              <Image
                src="/market.png"
                alt="Traditional Marketplace"
                width={640}
                height={160}
                className="w-full h-60 object-cover hover:opacity-90 transition"
              />
            </Link>
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-lg text-gray-400 mb-1">Creator: VirtualArch</p>
                <h3 className="text-xl font-bold mb-3 text-white">Traditional Marketplace</h3>
                <div className="flex justify-between text-lg text-gray-300 mb-2">
                  <span>Current Price</span>
                  <span>{total ? `OPC${noPercent.toFixed(2)}` : "—"}</span>
                </div>
                <div className="h-3 bg-gray-600 rounded-full">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${noPercent}%` }} />
                </div>
                <p className="text-sm text-gray-400 mt-2">{noPercent.toFixed(0)}%</p>

                {wallet.connected && (
                  <button
                    className="mt-5 w-full px-6 py-3 bg-red-600 text-white rounded-xl text-lg"
                    onClick={() => vote(false)}
                    disabled={loading}
                  >
                    Vote Traditional (NO)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
