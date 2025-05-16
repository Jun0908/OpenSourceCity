"use client";

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

export default function Page() {
  const wallet = useWallet();

  const [market,   setMarket]   = useState<PublicKey>();
  const [yesTotal, setYesTotal] = useState(0);
  const [noTotal,  setNoTotal]  = useState(0);
  const [loading,  setLoading]  = useState(false);

  /* ---------- read on-chain state ---------- */
  const refreshMarket = useCallback(async (m: PublicKey) => {
  const { program } = getWorkspace(wallet as AnchorWallet);
  const acct = await program.account.market.fetch(m);
  setYesTotal(Number(acct.totalYes) / 1e9);
  setNoTotal(Number(acct.totalNo)  / 1e9);
}, [wallet]);

  /* ---------- init state on wallet connect ---------- */
  useEffect(() => {
  if (wallet.publicKey) {
    const m = PDA.market(wallet.publicKey);
    setMarket(m);
    refreshMarket(m).catch(() => {});
  }
}, [wallet.publicKey, refreshMarket]);

  /* ---------- on-chain actions ---------- */
  const initialize = async () => {
    if (!wallet.publicKey) return;
    setLoading(true);

    const { program, connection } = getWorkspace(wallet as AnchorWallet);
    const marketPda = PDA.market(wallet.publicKey);

    try {
      const sig = await program.methods
        .initialize()
        .accounts({
          market: marketPda,
          owner:  wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      await connection.confirmTransaction(sig, "confirmed");
      setMarket(marketPda);
      await refreshMarket(marketPda);
      alert("Market initialized!");
    } catch (err: any) {
      alert("Initialize failed:\n" + (err.message ?? err));
    }
    setLoading(false);
  };

  const vote = async (yes: boolean) => {
    if (!wallet.publicKey || !market) return;
    setLoading(true);
    const { program, connection } = getWorkspace(wallet as AnchorWallet);
    const betPda = PDA.bet(market, wallet.publicKey);

    try {
      const sig = await program.methods
        .vote(yes, new anchor.BN(0.01 * 1e9)) // 0.01 SOL
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

  const resolve = async (yesWon: boolean) => {
    if (!wallet.publicKey || !market) return;
    setLoading(true);
    const { program, connection } = getWorkspace(wallet as AnchorWallet);

    try {
      const sig = await program.methods
        .resolve(yesWon)
        .accounts({ market, owner: wallet.publicKey })
        .rpc();

      await connection.confirmTransaction(sig, "confirmed");
      alert("Market resolved!");
    } catch (err: any) {
      alert("Resolve failed:\n" + (err.message ?? err));
    }
    setLoading(false);
  };

  const withdraw = async () => {
    if (!wallet.publicKey || !market) return;
    setLoading(true);
    const { program, connection } = getWorkspace(wallet as AnchorWallet);
    const betPda = PDA.bet(market, wallet.publicKey);

    try {
      const sig = await program.methods
        .withdraw()
        .accounts({ market, bet: betPda, bettor: wallet.publicKey })
        .rpc();

      await connection.confirmTransaction(sig, "confirmed");
      alert("Withdrawn!");
    } catch (err: any) {
      alert("Withdraw failed:\n" + (err.message ?? err));
    }
    setLoading(false);
  };

  /* ---------- UI ---------- */
  return (
    <div className="flex flex-col items-center gap-5 p-10">
      <h1 className="text-3xl font-bold">Solana Prediction Market</h1>

      {market && (
        <p className="text-lg font-medium">
          YES&nbsp;
          <span className="text-green-600">{yesTotal}</span>
          &nbsp;SOL&nbsp;|&nbsp;
          NO&nbsp;
          <span className="text-red-600">{noTotal}</span>
          &nbsp;SOL
        </p>
      )}

      {!wallet.connected && (
        <p className="text-red-500">Connect Phantom to begin.</p>
      )}

      {wallet.connected && (
        <>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={initialize}
            disabled={loading}
          >
            Initialize Market
          </button>

          <div className="flex gap-4">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded"
              onClick={() => vote(true)}
              disabled={loading}
            >
              Vote YES
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded"
              onClick={() => vote(false)}
              disabled={loading}
            >
              Vote NO
            </button>
          </div>

          <div className="flex gap-4">
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded"
              onClick={() => resolve(true)}
              disabled={loading}
            >
              Resolve YES
            </button>
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded"
              onClick={() => resolve(false)}
              disabled={loading}
            >
              Resolve NO
            </button>
          </div>

          <button
            className="px-4 py-2 bg-yellow-600 text-white rounded"
            onClick={withdraw}
            disabled={loading}
          >
            Withdraw
          </button>
        </>
      )}
    </div>
  );
}


