use anchor_lang::prelude::*;

// NOTE: in Solana Playground this value is overwritten at deploy time,
// so any valid 32-byte Base58 string is fine.
declare_id!("BRxAvQG9dgaiUZStgSrZFdYhRY4pHsMhTfYneaMvdN9y");

#[account]
pub struct Market {
    pub owner: Pubkey,   // 32
    pub total_yes: u64,  // 8
    pub total_no: u64,   // 8
    pub resolved: bool,  // 1
    pub outcome_yes: bool, // 1
    pub bump: u8,        // 1
}                       // = 51 bytes (+8 discriminator when initialized)

#[account]
pub struct Bet {
    pub bettor: Pubkey,  // 32
    pub amount: u64,     // 8
    pub vote_yes: bool,  // 1
}                       // 41 (+8) = 49 bytes

#[program]
pub mod prediction_market { /* ... your existing impl stays unchanged ... */ }

// ─── Account Contexts ───────────────────────────

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = owner,
        seeds = [b"market", owner.key().as_ref()],
        bump,
        // 8 discriminator + 51 struct = 59
        space = 8 + 51
    )]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut,
        seeds = [b"market", market.owner.as_ref()],
        bump = market.bump)]
    pub market: Account<'info, Market>,
    #[account(
        init,
        payer = bettor,
        seeds = [b"bet", market.key().as_ref(), bettor.key().as_ref()],
        bump,
        space = 8 + 49   // 8 discriminator + 49 Bet struct
    )]
    pub bet: Account<'info, Bet>,
    #[account(mut)]
    pub bettor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Resolve<'info> {
    #[account(mut, seeds = [b"market", market.owner.as_ref()], bump = market.bump)]
    pub market: Account<'info, Market>,
    #[account(mut, address = market.owner)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut, seeds = [b"market", market.owner.as_ref()], bump = market.bump)]
    pub market: Account<'info, Market>,
    #[account(
        mut,
        close = bettor,
        seeds = [b"bet", market.key().as_ref(), bettor.key().as_ref()],
        bump)]
    pub bet: Account<'info, Bet>,
    #[account(mut)]
    pub bettor: Signer<'info>,
}

// ─── Errors ─────────────────────────────────────

#[error_code]
pub enum CustomError {
    AlreadyResolved,
    NotResolved,
    AlreadyVoted,
    ZeroStake,
    NotWinner,
    NothingToWithdraw,
}
