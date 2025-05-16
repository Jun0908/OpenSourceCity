// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import Test412IDL from '../target/idl/test412.json'
import type { Test412 } from '../target/types/test412'

// Re-export the generated IDL and type
export { Test412, Test412IDL }

// The programId is imported from the program IDL.
export const TEST412_PROGRAM_ID = new PublicKey(Test412IDL.address)

// This is a helper function to get the Test412 Anchor program.
export function getTest412Program(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...Test412IDL, address: address ? address.toBase58() : Test412IDL.address } as Test412, provider)
}

// This is a helper function to get the program ID for the Test412 program depending on the cluster.
export function getTest412ProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Test412 program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return TEST412_PROGRAM_ID
  }
}
