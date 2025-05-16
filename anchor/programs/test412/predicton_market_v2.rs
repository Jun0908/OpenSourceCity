use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkgMQYDKbFgNo"); // Playground では自動で上書き

/* ───── ステート ─────────────────────────────────────── */

#[account]
pub struct Market {
    pub owner: Pubkey,     // 32
    pub total_yes: u64,    // 8
    pub total_no: u64,     // 8
    pub resolved: bool,    // 1
    pub outcome_yes: bool, // 1
    pub bump: u8,          // 1
}                          // 51 (+8 discriminator)

#[account]
pub struct Bet {
    pub bettor: Pubkey,    // 32
    pub amount: u64,       // 8
    pub vote_yes: bool,    // 1
}                          // 41 (+8)

/* ───── プログラム ───────────────────────────────────── */

#[program]
pub mod prediction_market {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let market = &mut ctx.accounts.market;
        market.owner        = ctx.accounts.owner.key();
        market.total_yes    = 0;
        market.total_no     = 0;
        market.resolved     = false;
        market.outcome_yes  = false;
        market.bump         = ctx.bumps.market;
        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, vote_yes: bool, amount: u64) -> Result<()> {
        require!(amount > 0, CustomError::ZeroStake);
        let market = &mut ctx.accounts.market;
        let bet    = &mut ctx.accounts.bet;

        require!(!market.resolved, CustomError::AlreadyResolved);
        require!(bet.amount == 0,  CustomError::AlreadyVoted);

        bet.bettor   = ctx.accounts.bettor.key();
        bet.amount   = amount;
        bet.vote_yes = vote_yes;

        if vote_yes {
            market.total_yes = market.total_yes.checked_add(amount).unwrap();
        } else {
            market.total_no  = market.total_no.checked_add(amount).unwrap();
        }

        /* ---- 安全な lamports 転送（SystemProgram CPI）---- */
        let cpi_accounts = anchor_lang::system_program::Transfer {
            from: ctx.accounts.bettor.to_account_info(),
            to:   ctx.accounts.market.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.system_program.to_account_info(), cpi_accounts);
        anchor_lang::system_program::transfer(cpi_ctx, amount)?;
        /* --------------------------------------------------- */

        Ok(())
    }

    pub fn resolve(ctx: Context<Resolve>, outcome_yes: bool) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(!market.resolved, CustomError::AlreadyResolved);
        market.resolved    = true;
        market.outcome_yes = outcome_yes;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let bet    = &mut ctx.accounts.bet;
        require!(market.resolved, CustomError::NotResolved);

        let eligible = (market.outcome_yes && bet.vote_yes)
            || (!market.outcome_yes && !bet.vote_yes);
        require!(eligible, CustomError::NotWinner);

        let side_pool = if market.outcome_yes { market.total_yes } else { market.total_no };
        let payout = (bet.amount as u128)
            .checked_mul(market.to_account_info().lamports() as u128)
            .unwrap()
            / side_pool as u128;
        let payout = payout as u64;
        require!(payout > 0, CustomError::NothingToWithdraw);

        **market.to_account_info().try_borrow_mut_lamports()? -= payout;
        **ctx.accounts.bettor.to_account_info().try_borrow_mut_lamports()? += payout;

        bet.close(ctx.accounts.bettor.to_account_info())?;
        Ok(())
    }
}

/* ───── アカウントコンテキスト ───────────────────────── */

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = owner,
        seeds = [b"market", owner.key().as_ref()],
        bump,
        space = 8 + 51
    )]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut, seeds = [b"market", market.owner.as_ref()], bump = market.bump)]
    pub market: Account<'info, Market>,
    #[account(
        init,
        payer = bettor,
        seeds = [b"bet", market.key().as_ref(), bettor.key().as_ref()],
        bump,
        space = 8 + 49
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
        bump
    )]
    pub bet: Account<'info, Bet>,
    #[account(mut)]
    pub bettor: Signer<'info>,
}

/* ───── エラーコード ────────────────────────────────── */

#[error_code]
pub enum CustomError {
    AlreadyResolved,
    NotResolved,
    AlreadyVoted,
    ZeroStake,
    NotWinner,
    NothingToWithdraw,
}
