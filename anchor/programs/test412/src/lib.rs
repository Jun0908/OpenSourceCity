#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod test412 {
    use super::*;

  pub fn close(_ctx: Context<CloseTest412>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.test412.count = ctx.accounts.test412.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.test412.count = ctx.accounts.test412.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeTest412>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.test412.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeTest412<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Test412::INIT_SPACE,
  payer = payer
  )]
  pub test412: Account<'info, Test412>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseTest412<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub test412: Account<'info, Test412>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub test412: Account<'info, Test412>,
}

#[account]
#[derive(InitSpace)]
pub struct Test412 {
  count: u8,
}
