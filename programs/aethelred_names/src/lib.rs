use anchor_lang::prelude::*;

declare_id!("APU7238FpwdCWTrx5jSKpQYnkrrHiT1HgQgtPPRY3aDd");

#[program]
pub mod aethelred_names {
    use super::*;

    pub fn register_name(ctx: Context<RegisterName>, handle: String) -> Result<()> {
        let record = &mut ctx.accounts.name_record;
        record.handle = handle;
        record.owner = ctx.accounts.owner.key();
        record.expires_at = Clock::get()?.unix_timestamp + 365 * 24 * 60 * 60;
        record.bump = ctx.bumps.name_record;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(handle: String)]
pub struct RegisterName<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        init,
        payer = owner,
        space = 8 + NameRecord::INIT_SPACE,
        seeds = [b"name", handle.as_bytes()],
        bump
    )]
    pub name_record: Account<'info, NameRecord>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct NameRecord {
    #[max_len(32)]
    pub handle: String,
    pub owner: Pubkey,
    pub expires_at: i64,
    pub bump: u8,
}
