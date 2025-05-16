import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { Test412 } from '../target/types/test412'

describe('test412', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Test412 as Program<Test412>

  const test412Keypair = Keypair.generate()

  it('Initialize Test412', async () => {
    await program.methods
      .initialize()
      .accounts({
        test412: test412Keypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([test412Keypair])
      .rpc()

    const currentCount = await program.account.test412.fetch(test412Keypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Test412', async () => {
    await program.methods.increment().accounts({ test412: test412Keypair.publicKey }).rpc()

    const currentCount = await program.account.test412.fetch(test412Keypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Test412 Again', async () => {
    await program.methods.increment().accounts({ test412: test412Keypair.publicKey }).rpc()

    const currentCount = await program.account.test412.fetch(test412Keypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Test412', async () => {
    await program.methods.decrement().accounts({ test412: test412Keypair.publicKey }).rpc()

    const currentCount = await program.account.test412.fetch(test412Keypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set test412 value', async () => {
    await program.methods.set(42).accounts({ test412: test412Keypair.publicKey }).rpc()

    const currentCount = await program.account.test412.fetch(test412Keypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the test412 account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        test412: test412Keypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.test412.fetchNullable(test412Keypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
