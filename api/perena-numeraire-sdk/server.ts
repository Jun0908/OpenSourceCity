// server.ts
import express from "express";
import { PublicKey } from "@solana/web3.js";
import { init } from "./src/utils"; // 必要に応じて正しいパスに変更
import { swapExactIn } from "./src/instructions/user_ix";
import { loadKeypairFromFile } from "./src/utils";
import path from "path";

// 初期設定
const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());

const payer = loadKeypairFromFile(path.resolve("keypair.json"));

// ✅ SDK 初期化
const connection = require("@solana/web3.js").clusterApiUrl("mainnet-beta"); // devnetにするなら変更
init({
  payer,
  connection,
  applyD: false,
});

// ✅ エンドポイント：スワップ処理
app.post("/api/swap", async (req, res) => {
  try {
    const { pool, inIndex, outIndex, exactAmountIn, minAmountOut } = req.body;

    const { call } = await swapExactIn({
      pool: new PublicKey(pool),
      in: inIndex,
      out: outIndex,
      exactAmountIn,
      minAmountOut,
    });

    const txHash = await call.rpc();
    res.json({ txHash });
  } catch (err) {
    console.error("Swap error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ サーバー起動
app.listen(PORT, () => {
  console.log(`Numeraire server is running at http://localhost:${PORT}`);
});
