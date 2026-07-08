import { ASSET_IMAGES } from "@/lib/assets";

export const DEMO_INVESTOR_WALLET = "InvestorDemoWallet123456789012345678901234";
export const COMMUNITY_TREASURY_WALLET = "AethelredCommunityTreasury111111111111111";

export const SEED_PROPERTIES = [
  {
    slug: "apartment-complex-vi-09",
    tagline: "Forty-two units in Vienna's 9th district — income-producing, bank-encumbered, community-bound.",
    description:
      "A meticulously maintained apartment block steps from the Danube canal. Erste Bank holds the title today. We're raising community capital to retire the lien and place ownership in token holders' hands — with verified rent flows, Guardian oversight, and holder stays built in.",
    galleryUrls: [ASSET_IMAGES.vienna, ASSET_IMAGES.hero, ASSET_IMAGES.vienna],
    propertyClass: "apartment",
    sqm: 4200,
    units: 42,
    beds: 84,
    yearBuilt: 1968,
    occupancyBps: 9400,
    bankHolder: "Erste Bank",
    communityRaiseTargetCents: 50_000_000,
    tokensSoldBps: 6200,
  },
  {
    slug: "zurich-residential-ix",
    tagline: "Alpine-edge residential — quiet luxury, institutional debt, opening to co-owners.",
    description:
      "Nine-storey residential asset in Zürich with long-term tenants and a guest suite reserved for token holders. UBS holds the mortgage. Tokenize your slice, earn rent share, and book priority stays in the building's owner lounge.",
    galleryUrls: [ASSET_IMAGES.vienna, ASSET_IMAGES.hero],
    propertyClass: "residential",
    sqm: 6800,
    units: 36,
    beds: 52,
    yearBuilt: 2004,
    occupancyBps: 9700,
    bankHolder: "UBS",
    communityRaiseTargetCents: 230_000_000,
    tokensSoldBps: 4100,
  },
  {
    slug: "vienna-commercial-hub",
    tagline: "Mixed-use commercial hub — retail, hotel rooms, and restaurant concessions under one roof.",
    description:
      "A landmark commercial property anchoring a Vienna business district. Bank Austria holds title on the underlying deed. Community raise targets retiring senior debt and fractionalizing hospitality cash flows — hotel nights, dining credits, and governance over capex.",
    galleryUrls: [ASSET_IMAGES.vienna, ASSET_IMAGES.industrial, ASSET_IMAGES.hero],
    propertyClass: "hotel",
    sqm: 12400,
    units: 18,
    beds: 120,
    yearBuilt: 1995,
    occupancyBps: 8800,
    bankHolder: "Bank Austria",
    communityRaiseTargetCents: 142_000_000,
    tokensSoldBps: 5500,
  },
] as const;

export const SEED_PERKS = [
  {
    slug: "apartment-complex-vi-09",
    perks: [
      { perkType: "STAY", title: "One week per year", description: "Book a complimentary week in any vacant portfolio unit — your home in Vienna.", minShareBps: 250, sortOrder: 0 },
      { perkType: "GOVERNANCE", title: "Renovation votes", description: "Vote on facade, lobby, and energy upgrades for the building.", minShareBps: 100, sortOrder: 1 },
      { perkType: "RENT_SHARE", title: "Pro-rata rent", description: "Receive your share of net rental income from occupied units quarterly.", minShareBps: 50, sortOrder: 2 },
      { perkType: "PRIORITY_ACCESS", title: "Early unit access", description: "First right to newly vacated units at holder rates.", minShareBps: 500, sortOrder: 3 },
    ],
  },
  {
    slug: "zurich-residential-ix",
    perks: [
      { perkType: "STAY", title: "Guest suite priority", description: "Priority booking in the building's owner guest suite, 14 nights/year.", minShareBps: 300, sortOrder: 0 },
      { perkType: "LOUNGE", title: "Owner lounge access", description: "Private lounge, concierge, and co-working on the penthouse level.", minShareBps: 200, sortOrder: 1 },
      { perkType: "RENT_SHARE", title: "Rent dividend tier", description: "Enhanced rent distribution at 5%+ holding — paid in USDC.", minShareBps: 500, sortOrder: 2 },
      { perkType: "GOVERNANCE", title: "Tenant policy votes", description: "Shape lease terms, amenities, and building standards.", minShareBps: 100, sortOrder: 3 },
    ],
  },
  {
    slug: "vienna-commercial-hub",
    perks: [
      { perkType: "STAY", title: "Hotel night credits", description: "12 hotel room nights per year at partner rates within the hub.", minShareBps: 400, sortOrder: 0 },
      { perkType: "DINING", title: "Restaurant allowance", description: "€500 quarterly dining credit across hub restaurants.", minShareBps: 250, sortOrder: 1 },
      { perkType: "GOVERNANCE", title: "Capex governance", description: "Vote on lobby, signage, and tenant mix for the commercial core.", minShareBps: 150, sortOrder: 2 },
      { perkType: "RENT_SHARE", title: "Hospitality revenue share", description: "Pro-rata share of hotel, retail, and F&B net operating income.", minShareBps: 100, sortOrder: 3 },
    ],
  },
] as const;

export const SEED_SHARES = [
  { slug: "apartment-complex-vi-09", holderWallet: COMMUNITY_TREASURY_WALLET, shareBps: 3800 },
  { slug: "apartment-complex-vi-09", holderWallet: DEMO_INVESTOR_WALLET, shareBps: 1200 },
  { slug: "zurich-residential-ix", holderWallet: COMMUNITY_TREASURY_WALLET, shareBps: 2500 },
  { slug: "zurich-residential-ix", holderWallet: DEMO_INVESTOR_WALLET, shareBps: 800 },
  { slug: "vienna-commercial-hub", holderWallet: COMMUNITY_TREASURY_WALLET, shareBps: 3200 },
  { slug: "vienna-commercial-hub", holderWallet: DEMO_INVESTOR_WALLET, shareBps: 1500 },
] as const;

export const SEED_DISTRIBUTIONS = [
  {
    slug: "apartment-complex-vi-09",
    distributions: [
      { periodLabel: "Q1 2026 Rent", totalCents: 420_000, source: "rent", daysAgo: 60 },
      { periodLabel: "Q4 2025 Rent", totalCents: 385_000, source: "rent", daysAgo: 150 },
      { periodLabel: "Q3 2025 Rent", totalCents: 390_000, source: "rent", daysAgo: 240 },
    ],
  },
  {
    slug: "zurich-residential-ix",
    distributions: [
      { periodLabel: "Q1 2026 Rent", totalCents: 890_000, source: "rent", daysAgo: 55 },
      { periodLabel: "Q4 2025 Rent", totalCents: 860_000, source: "rent", daysAgo: 145 },
    ],
  },
  {
    slug: "vienna-commercial-hub",
    distributions: [
      { periodLabel: "Q1 2026 Hospitality", totalCents: 1_240_000, source: "operations", daysAgo: 50 },
      { periodLabel: "Q4 2025 Hospitality", totalCents: 1_180_000, source: "operations", daysAgo: 140 },
      { periodLabel: "Lending yield share", totalCents: 95_000, source: "lending", daysAgo: 30 },
    ],
  },
] as const;
