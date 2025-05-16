import { Connection, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";

// 🔧 Program config
export const PROGRAM_ID = new PublicKey(
  "DMStNBL5mqqdzscVnFXnZKia1Bd1sE8mB1sjvRkKipBD"
);
const CLUSTER_URL = "https://api.devnet.solana.com";

// static-import the IDL JSON (tsconfig ⇒ resolveJsonModule)
import IDL from "./prediction_market.json";

export const getWorkspace = (wallet: AnchorWallet) => {
  // connection & provider
  const connection = new Connection(CLUSTER_URL, "confirmed");
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  // Anchor program object
  const program = new anchor.Program(
    IDL as anchor.Idl,
    PROGRAM_ID,
    provider
  );

  return { connection, provider, program };
};
