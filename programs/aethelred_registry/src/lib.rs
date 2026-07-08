use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

declare_id!("AQXb8Z29qSxco5h5qSWfUnwZd7DgSuFhxXjeB25FMtEU");

#[program]
pub mod aethelred_registry {
    use super::*;

    pub fn initialize_config(ctx: Context<InitializeConfig>, registry_authority: Pubkey) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.registry_authority = registry_authority;
        config.authority = ctx.accounts.authority.key();
        config.bump = ctx.bumps.config;
        Ok(())
    }

    pub fn register_asset(
        ctx: Context<RegisterAsset>,
        slug: String,
        nav_cents: u64,
        trust_score: u8,
    ) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.config.registry_authority,
            ErrorCode::UnauthorizedAuthority
        );
        let registry = &mut ctx.accounts.registry;
        registry.slug = slug;
        registry.mint = ctx.accounts.mint.key();
        registry.nav_cents = nav_cents;
        registry.trust_score = trust_score;
        registry.authority = ctx.accounts.authority.key();
        registry.bump = ctx.bumps.registry;
        Ok(())
    }

    pub fn update_nav(ctx: Context<UpdateNav>, nav_cents: u64) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        registry.nav_cents = nav_cents;
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
        space = 8 + RegistryConfig::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, RegistryConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(slug: String)]
pub struct RegisterAsset<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, RegistryConfig>,
    pub mint: Account<'info, Mint>,
    #[account(
        init,
        payer = authority,
        space = 8 + AssetRegistry::INIT_SPACE,
        seeds = [b"registry", slug.as_bytes()],
        bump
    )]
    pub registry: Account<'info, AssetRegistry>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateNav<'info> {
    pub authority: Signer<'info>,
    #[account(mut, has_one = authority)]
    pub registry: Account<'info, AssetRegistry>,
}

#[account]
#[derive(InitSpace)]
pub struct RegistryConfig {
    pub registry_authority: Pubkey,
    pub authority: Pubkey,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct AssetRegistry {
    #[max_len(64)]
    pub slug: String,
    pub mint: Pubkey,
    pub nav_cents: u64,
    pub trust_score: u8,
    pub authority: Pubkey,
    pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized registry authority")]
    UnauthorizedAuthority,
}
