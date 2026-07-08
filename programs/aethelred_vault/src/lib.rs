use anchor_lang::prelude::*;

declare_id!("4tzFUjGPaiENbHR3vZE9bLEdjrMSbewZqizkwP5m5t9X");

#[program]
pub mod aethelred_vault {
    use super::*;

    pub fn deposit_collateral(ctx: Context<DepositCollateral>, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.collateral_amount = vault
            .collateral_amount
            .checked_add(amount)
            .ok_or(VaultError::Overflow)?;
        vault.owner = ctx.accounts.owner.key();
        Ok(())
    }

    pub fn compute_max_mint(ctx: Context<ComputeMaxMint>) -> Result<u64> {
        let vault = &ctx.accounts.vault;
        Ok(vault
            .collateral_amount
            .checked_mul(100)
            .and_then(|v| v.checked_div(150))
            .ok_or(VaultError::Overflow)?)
    }
}

#[derive(Accounts)]
pub struct DepositCollateral<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(init_if_needed, payer = owner, space = 8 + Vault::INIT_SPACE, seeds = [b"vault", owner.key().as_ref()], bump)]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ComputeMaxMint<'info> {
    pub vault: Account<'info, Vault>,
}

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub collateral_amount: u64,
    pub debt_amount: u64,
    pub owner: Pubkey,
}

#[error_code]
pub enum VaultError {
    #[msg("Arithmetic overflow")]
    Overflow,
}
