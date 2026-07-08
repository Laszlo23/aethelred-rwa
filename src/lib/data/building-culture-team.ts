export interface TeamMemberLink {
  label: string;
  href: string;
}

export interface TeamMember {
  name: string;
  role: string;
  tagline: string;
  bio: string;
  links?: TeamMemberLink[];
}

/** Sourced from https://app.buildingcultureid.space/team */
export const BUILDING_CULTURE_TEAM: TeamMember[] = [
  {
    name: "Laszlo Bihary",
    role: "Co-founder & product",
    tagline: "Driving protocol integration and investor-facing product on Base and Solana.",
    bio: "In IT since 1996 — from creative direction and SEO at 8Limes to decentralized products at 4fans. Vienna-based; publishes essays as Leonardo.based on Paragraph and ships proof-first culture on Base so communities can actually use what we build.",
    links: [
      { label: "Paragraph", href: "https://paragraph.com/@leonardo.based" },
      { label: "TikTok", href: "https://www.tiktok.com/@nftdad33" },
      { label: "Building Culture profile", href: "https://app.buildingcultureid.space/team" },
    ],
  },
  {
    name: "Reinhard Stix",
    role: "Co-founder & real estate",
    tagline: "Physical assets, development, and the Building Culture property portfolio.",
    bio: "Reinhard has been active in real estate development in Vienna and in holiday regions of Austria since 1997. Since 2013, his own company has implemented projects with total investment costs of €1.3 billion. These projects include new construction, comprehensive renovations, and conversions — primarily residential, with offices, retail, and data centers.",
    links: [{ label: "Building Culture profile", href: "https://app.buildingcultureid.space/team" }],
  },
  {
    name: "Roman Horvath",
    role: "Accountant",
    tagline: "Financial reporting and compliance-oriented bookkeeping for the venture.",
    bio: "Financial reporting and compliance-oriented bookkeeping for Building Culture and Aethelred — keeping capital flows, asset records, and investor reporting audit-ready.",
    links: [{ label: "Building Culture profile", href: "https://app.buildingcultureid.space/team" }],
  },
];

export const BC_TEAM_SOURCE_URL = "https://app.buildingcultureid.space/team";
