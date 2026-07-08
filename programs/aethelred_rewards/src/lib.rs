use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};

declare_id!("4j6QfsG5mbZ6RaYZpdnzpk5zYfiJJWex2YA6TjsBhnhE");

#[program]
pub mod aethelred_rewards {
    use super::*;

    pub fn initialize_config(ctx: Context<InitializeConfig>, minter: Pubkey) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.minter = minter;
        config.authority = ctx.accounts.authority.key();
        config.bump = ctx.bumps.config;
        Ok(())
    }

    pub fn claim_reward(ctx: Context<ClaimReward>, amount: u64) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.config.minter,
            ErrorCode::UnauthorizedMinter
        );
        require!(amount <= 1_000_000_000_000, ErrorCode::AmountTooLarge);
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.destination.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        token::mint_to(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
            amount,
        )?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + MinterConfig::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, MinterConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, MinterConfig>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct MinterConfig {
    pub minter: Pubkey,
    pub authority: Pubkey,
    pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized minter")]
    UnauthorizedMinter,
    #[msg("Mint amount exceeds devnet cap")]
    AmountTooLarge,
}
