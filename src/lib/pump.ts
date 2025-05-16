"use server";

import { Connection, Keypair, LAMPORTS_PER_SOL, Transaction, VersionedTransaction } from "@solana/web3.js";
import { PumpFunSDK } from "pumpdotfun-sdk";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import fs from "fs";
import path from "path";

export async function createToken() {
  // Solana RPC接続
  const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!, "confirmed");

  // User用Keypair作成
  const userKeypair = Keypair.generate();

  // FeePayer用Keypair作成（今回は仮で）
  const feePayerKeypair = Keypair.generate();

  // Wallet定義（TransactionとVersionedTransaction両対応）
  const wallet: Wallet & { payer: Keypair } = {
    signTransaction: async (tx) => {
      if (tx instanceof Transaction) {
        tx.partialSign(userKeypair);
        return tx;
      } else if (tx instanceof VersionedTransaction) {
        tx.sign([userKeypair]);
        return tx;
      }
      throw new Error("Unknown transaction type");
    },
    signAllTransactions: async (txs) => {
      return txs.map((tx) => {
        if (tx instanceof Transaction) {
          tx.partialSign(userKeypair);
          return tx;
        } else if (tx instanceof VersionedTransaction) {
          tx.sign([userKeypair]);
          return tx;
        }
        throw new Error("Unknown transaction type");
      });
    },
    publicKey: userKeypair.publicKey,
    payer: userKeypair,
  };

  // Anchor Provider作成
  const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });

  // Pump.fun SDK初期化
  const sdk = new PumpFunSDK(provider);

  // アイコンファイル読み込み
  const filePath = path.resolve("./public/icon.png");
  const fileBuffer = fs.readFileSync(filePath);
  const fileBlob = new Blob([fileBuffer], { type: "image/png" });

  // Metadata定義
  const metadata = {
    name: "MyToken",
    symbol: "MTK",
    description: "My first pump.fun token",
    file: fileBlob,
  };

  // トークン作成 + 購入
  const result = await sdk.createAndBuy(
    userKeypair,
    feePayerKeypair,
    metadata,
    BigInt(Math.floor(0.0001 * LAMPORTS_PER_SOL)), // 購入金額
    BigInt(100), // 数量
    {
      unitLimit: 250000,
      unitPrice: 250000,
    }
  );

  return {
    mint: userKeypair.publicKey.toBase58(),
    transaction: result, // もし必要なら
  };
}

