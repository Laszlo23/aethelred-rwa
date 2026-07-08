use anchor_lang::prelude::*;

declare_id!("9wMCFvTTgyVuzB2yCNtC2G9ZcVDHrxpBmBnW2BSZoy1A");

#[program]
pub mod aethelred_passport {
    use super::*;

    pub fn initialize_config(ctx: Context<InitializeConfig>, guardian: Pubkey) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.guardian = guardian;
        config.authority = ctx.accounts.authority.key();
        config.bump = ctx.bumps.config;
        Ok(())
    }

    pub fn mint_passport(
        ctx: Context<MintPassport>,
        asset_id: String,
        trust_score: u8,
        guardian_grade: String,
        attestation_sig: String,
        nav_cents: u64,
    ) -> Result<()> {
        require!(
            ctx.accounts.guardian.key() == ctx.accounts.config.guardian,
            ErrorCode::UnauthorizedGuardian
        );
        let passport = &mut ctx.accounts.passport;
        passport.asset_id = asset_id;
        passport.trust_score = trust_score;
        passport.guardian_grade = guardian_grade;
        passport.attestation_sig = attestation_sig;
        passport.nav_cents = nav_cents;
        passport.owner = ctx.accounts.owner.key();
        passport.guardian = ctx.accounts.guardian.key();
        passport.bump = ctx.bumps.passport;
        passport.last_updated = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn update_attestation(
        ctx: Context<UpdateAttestation>,
        trust_score: u8,
        guardian_grade: String,
        attestation_sig: String,
        nav_cents: u64,
    ) -> Result<()> {
        let passport = &mut ctx.accounts.passport;
        passport.trust_score = trust_score;
        passport.guardian_grade = guardian_grade;
        passport.attestation_sig = attestation_sig;
        passport.nav_cents = nav_cents;
        passport.last_updated = Clock::get()?.unix_timestamp;
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
        space = 8 + ProtocolConfig::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, ProtocolConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(asset_id: String)]
pub struct MintPassport<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    pub guardian: Signer<'info>,
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, ProtocolConfig>,
    #[account(
        init,
        payer = owner,
        space = 8 + Passport::INIT_SPACE,
        seeds = [b"passport", asset_id.as_bytes()],
        bump
    )]
    pub passport: Account<'info, Passport>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateAttestation<'info> {
    pub guardian: Signer<'info>,
    #[account(mut, has_one = guardian @ ErrorCode::UnauthorizedGuardian)]
    pub passport: Account<'info, Passport>,
}

#[account]
#[derive(InitSpace)]
pub struct ProtocolConfig {
    pub guardian: Pubkey,
    pub authority: Pubkey,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Passport {
    #[max_len(64)]
    pub asset_id: String,
    pub trust_score: u8,
    #[max_len(4)]
    pub guardian_grade: String,
    #[max_len(128)]
    pub attestation_sig: String,
    pub nav_cents: u64,
    pub owner: Pubkey,
    pub guardian: Pubkey,
    pub last_updated: i64,
    pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized guardian signer")]
    UnauthorizedGuardian,
}
