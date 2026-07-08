/**
 * Building Culture portfolio — sourced from xrpbaby/b3/apps/places/data/property-catalog.json
 * and packages/places-portfolio presentations.
 * On-chain reference: Base mainnet (8453). Solana mint deployed via deployBuildingCultureMints.
 */
export const BC_PLACES_ORIGIN = "https://places.buildingcultureid.space";
export const BC_RWA_ORIGIN = "https://rwa.buildingcultureid.space";
export const BC_REFERENCE_YIELD_BAND = "7–10%";

export type CultureSegment = "city" | "land" | "water";

export interface BuildingCultureAssetSeed {
  slug: string;
  placesPropertyId: number;
  symbol: string;
  externalRef: string;
  name: string;
  location: string;
  jurisdiction: string;
  cultureSegment: CultureSegment;
  acquisitionEur: number;
  annualRentEur: number;
  yieldBps: number;
  evmShareToken: string;
  imageUrl: string;
  galleryUrls: string[];
  tagline: string;
  description: string;
  propertyClass: "apartment" | "residential" | "hotel" | "commercial";
  units: number | null;
  unitCountLabel: string;
  propertyType: string;
  badge: string;
  highlights: string[];
  tokensSoldBps: number;
  documentIds: string[];
}

export const BUILDING_CULTURE_ASSETS: BuildingCultureAssetSeed[] = [
  {
    slug: "berggasse-35",
    placesPropertyId: 1,
    symbol: "OG1",
    externalRef: "STIX-AT-berggasse-35",
    name: "Building Culture City Berggasse",
    location: "Vienna · Servitenviertel",
    jurisdiction: "AT",
    cultureSegment: "city",
    acquisitionEur: 15_917_000,
    annualRentEur: 250_000,
    yieldBps: 750,
    evmShareToken: "0x88a42bc87A31321639dE7e8021B92cE766661f5A",
    imageUrl: "/bc/berggasse-hero.jpg",
    galleryUrls: ["/bc/berggasse-hero.jpg", "/bc/berggasse-02.jpg"],
    tagline: "19th-century Viennese ensemble — heritage stewardship opening to a global community.",
    description:
      "Berggasse sits where Gründerzeit fabric meets everyday Vienna: courtyards, rooflines, and rental homes woven into the 9th district. Servitenviertel heritage on-chain — REOC v1 metadata with permissioned share token OG1 on Base; Solana settlement layer for Aethelred.",
    propertyClass: "residential",
    units: 3,
    unitCountLabel: "3 apartments",
    propertyType: "Historic residential",
    badge: "Flagship",
    highlights: [
      "Servitenviertel Gründerzeit — heritage stewardship",
      "Partner reference €15.9M acquisition · €250k p.a. rent",
      "REOC v1 + OG1 share token (Base) · Solana mirror mint",
    ],
    tokensSoldBps: 2800,
    documentIds: ["berggasse-brochure-en"],
  },
  {
    slug: "jagdschlossgasse-81",
    placesPropertyId: 2,
    symbol: "OG2",
    externalRef: "STIX-AT-jagdschlossgasse-81",
    name: "Building Culture City Jagdschlossgasse 81",
    location: "Vienna · opposite Werkbundsiedlung",
    jurisdiction: "AT",
    cultureSegment: "city",
    acquisitionEur: 8_300_000,
    annualRentEur: 187_000,
    yieldBps: 680,
    evmShareToken: "0x0431C3d979a6f1556c815F5d8E48eF3e1Ce8c58f",
    imageUrl: "/bc/jagdschloss-hero.jpg",
    galleryUrls: ["/bc/jagdschloss-hero.jpg", "/bc/jagdschloss-02.jpg"],
    tagline: "Nine homes opposite the Werkbundsiedlung — modernist heritage in conversation.",
    description:
      "Sited opposite the Werkbundsiedlung, the architecture advances daylight, proportion, and landscape relationship. Cubist forms, generous glazing, terraces — heat pump and solar for operating cost discipline.",
    propertyClass: "apartment",
    units: 9,
    unitCountLabel: "9 apartments",
    propertyType: "Multi-family residential",
    badge: "Stable Income",
    highlights: [
      "Cubist forms, generous glazing, terraces for all units",
      "Heat pump + solar — operating cost discipline",
      "Partner reference €8.3M · €187k p.a. rent",
    ],
    tokensSoldBps: 1900,
    documentIds: ["bau-land-kultur-20201113"],
  },
  {
    slug: "whalewatching-reference",
    placesPropertyId: 3,
    symbol: "OG3",
    externalRef: "STIX-CA-whalewatching-reference",
    name: "BuildingCultureLand – Whalewatching",
    location: "Canada · Pacific reference site",
    jurisdiction: "CA",
    cultureSegment: "land",
    acquisitionEur: 2_900_000,
    annualRentEur: 203_000,
    yieldBps: 700,
    evmShareToken: "0x6Fa4db0e6317D6ED2347e39802b86EeA507F7DE5",
    imageUrl: "/bc/whale-hero.jpg",
    galleryUrls: ["/bc/whale-hero.jpg"],
    tagline: "Pacific coast land reference — culture and ecology as investable real estate.",
    description:
      "A Building Culture Land reference asset pairing ecological stewardship with community capital. Verify economics in issuer data room; token OG3 represents programmed economic exposure per offering documents.",
    propertyClass: "commercial",
    units: null,
    unitCountLabel: "Reference land parcel",
    propertyType: "Land & experience",
    badge: "Land",
    highlights: [
      "Building Culture Land catalogue reference",
      "Cross-border jurisdiction (CA)",
      "OG3 permissioned share on Base",
    ],
    tokensSoldBps: 1200,
    documentIds: ["teaser-biberstrasse-4-1010-wien"],
  },
  {
    slug: "water-side-keutschach",
    placesPropertyId: 4,
    symbol: "OG4",
    externalRef: "STIX-AT-water-side-keutschach",
    name: "Water Side — Keutschach am See",
    location: "Keutschach am See, Carinthia",
    jurisdiction: "AT",
    cultureSegment: "water",
    acquisitionEur: 10_500_000,
    annualRentEur: 250_000,
    yieldBps: 840,
    evmShareToken: "0xeaeA7594011b4331bCdAe974C7Aa9138C175c004",
    imageUrl: "/bc/keutschach-hero.jpg",
    galleryUrls: [
      "/bc/keutschach-hero.jpg",
      "/bc/keutschach-02.jpg",
      "/bc/keutschach-03.jpg",
    ],
    tagline: "Timber façades and full-height glazing on the Carinthian lakeside.",
    description:
      "Water Side gathers thirty-four apartments across six buildings into a single landscape idea: horizontality, warmth of wood, and glass that dissolves the boundary between interior and panorama. Private lake access with jetty and bathhouse.",
    propertyClass: "residential",
    units: 34,
    unitCountLabel: "34 apartments · 6 buildings",
    propertyType: "Lakeside residential",
    badge: "High Yield",
    highlights: [
      "Private lake access with jetty and bathhouse",
      "Six buildings · thirty-four apartments",
      "Partner reference €10.5M · €250k p.a. rent",
    ],
    tokensSoldBps: 3400,
    documentIds: ["water-side-keutschach-20220112"],
  },
  {
    slug: "landmark-bernhardsthal",
    placesPropertyId: 5,
    symbol: "OG5",
    externalRef: "STIX-AT-landmark-bernhardsthal",
    name: "BuildingCultureLand – LandMark",
    location: "Bernhardsthal · Weinviertel",
    jurisdiction: "AT",
    cultureSegment: "land",
    acquisitionEur: 10_900_000,
    annualRentEur: 350_000,
    yieldBps: 720,
    evmShareToken: "0xbf83F4ECAA25c0883aC81549A659C10BE7A9bEC1",
    imageUrl: "/bc/landmark-hero.jpg",
    galleryUrls: ["/bc/landmark-hero.jpg", "/bc/landmark-02.jpg", "/bc/landmark-03.jpg"],
    tagline: "Granary converted into a village landmark — adaptive reuse in the Weinviertel.",
    description:
      "LandMark converts a granary into modern living with historic agricultural charm. Twenty-four apartments, four terraced houses, three commercial units — geothermal and PV integrated.",
    propertyClass: "commercial",
    units: 31,
    unitCountLabel: "31 units",
    propertyType: "Mixed-use",
    badge: "Adaptive Reuse",
    highlights: [
      "Grain-storage conversion · geothermal + PV",
      "24 apartments · 4 terraced houses · 3 commercial",
      "Partner reference €10.9M · €350k p.a. rent",
    ],
    tokensSoldBps: 2600,
    documentIds: ["land-mark-bernhardsthal-20210625", "bernhardsthal-plans"],
  },
  {
    slug: "altes-presshaus-katzelsdorf",
    placesPropertyId: 6,
    symbol: "OG6",
    externalRef: "STIX-AT-altes-presshaus-katzelsdorf",
    name: "BuildingCultureLand – Altes Presshaus",
    location: "Katzelsdorf, Lower Austria",
    jurisdiction: "AT",
    cultureSegment: "land",
    acquisitionEur: 950_000,
    annualRentEur: 66_500,
    yieldBps: 700,
    evmShareToken: "0x8D4b0291bE4a8177F9baB0F4004E7B370a41D413",
    imageUrl: "/bc/presshaus-hero.jpg",
    galleryUrls: ["/bc/presshaus-hero.jpg"],
    tagline: "Historic press house — rural culture asset with reinvention potential.",
    description:
      "Altes Presshaus in Katzelsdorf represents Building Culture's land programme: compact heritage structures with clear reinvention paths. Verify operator and capex plans in issuer diligence.",
    propertyClass: "commercial",
    units: null,
    unitCountLabel: "Heritage structure",
    propertyType: "Adaptive reuse",
    badge: "Land",
    highlights: [
      "Katzelsdorf heritage press house",
      "Building Culture Land programme",
      "OG6 on Base mainnet",
    ],
    tokensSoldBps: 800,
    documentIds: ["katzelsdorf-studie-auswechslung", "katzelsdorf-studie-encoded"],
  },
  {
    slug: "department-store-bernhardsthal",
    placesPropertyId: 7,
    symbol: "OG7",
    externalRef: "STIX-AT-department-store-bernhardsthal",
    name: "BuildingCultureLand – Former department store",
    location: "Bernhardsthal · Weinviertel",
    jurisdiction: "AT",
    cultureSegment: "land",
    acquisitionEur: 850_000,
    annualRentEur: 59_500,
    yieldBps: 700,
    evmShareToken: "0x1d4d06A05E2d67e63df936141bD14948A13D3C30",
    imageUrl: "/bc/dept-store-hero.jpg",
    galleryUrls: ["/bc/dept-store-hero.jpg"],
    tagline: "Former department store — commercial shell with village activation potential.",
    description:
      "A former department store anchoring Bernhardsthal's commercial strip. Mixed retail and community activation potential under issuer SPV structure.",
    propertyClass: "commercial",
    units: null,
    unitCountLabel: "Commercial building",
    propertyType: "Retail / mixed",
    badge: "Land",
    highlights: [
      "Former department store — ground-floor activation",
      "Bernhardsthal village context",
      "OG7 share token on Base",
    ],
    tokensSoldBps: 600,
    documentIds: ["altes-kaufhaus-prater", "bernhardsthal-plans"],
  },
  {
    slug: "alter-stadl-katzelsdorf",
    placesPropertyId: 8,
    symbol: "OG8",
    externalRef: "STIX-AT-alter-stadl-katzelsdorf",
    name: "BuildingCultureLand – Alter Stadl",
    location: "Katzelsdorf, Lower Austria",
    jurisdiction: "AT",
    cultureSegment: "land",
    acquisitionEur: 650_000,
    annualRentEur: 45_500,
    yieldBps: 700,
    evmShareToken: "0x7F806Be5f1BdD3Fc04570690875F314c2aBd6EC2",
    imageUrl: "/bc/stadl-hero.jpg",
    galleryUrls: ["/bc/stadl-hero.jpg"],
    tagline: "Historic barn — rural landmark with culture-led redevelopment path.",
    description:
      "Alter Stadl completes the Katzelsdorf cluster in Building Culture's land catalogue. Barn structure with documented studies for adaptive reuse.",
    propertyClass: "commercial",
    units: null,
    unitCountLabel: "Historic barn",
    propertyType: "Adaptive reuse",
    badge: "Land",
    highlights: [
      "Historic barn — Katzelsdorf",
      "Documented conversion studies",
      "OG8 on Base mainnet",
    ],
    tokensSoldBps: 500,
    documentIds: ["katzelsdorf-studie-auswechslung"],
  },
];

export const BC_FEATURED_SLUGS = [
  "berggasse-35",
  "water-side-keutschach",
  "landmark-bernhardsthal",
] as const;

export const BC_PERKS = [
  {
    slug: "berggasse-35",
    perks: [
      { perkType: "RENT_SHARE", title: "Pro-rata rent", description: "Quarterly rent distributions when declared by issuer SPV.", minShareBps: 50, sortOrder: 0 },
      { perkType: "GOVERNANCE", title: "Heritage votes", description: "Vote on facade and courtyard stewardship.", minShareBps: 100, sortOrder: 1 },
      { perkType: "STAY", title: "Servitenviertel stays", description: "Priority booking in portfolio units when vacant.", minShareBps: 300, sortOrder: 2 },
    ],
  },
  {
    slug: "water-side-keutschach",
    perks: [
      { perkType: "STAY", title: "Lake access weeks", description: "Holder stays with lake and bathhouse access per offering.", minShareBps: 250, sortOrder: 0 },
      { perkType: "RENT_SHARE", title: "Lakeside rent share", description: "Pro-rata share of net rental income.", minShareBps: 50, sortOrder: 1 },
      { perkType: "PRIORITY_ACCESS", title: "Season priority", description: "Early booking for peak summer weeks.", minShareBps: 400, sortOrder: 2 },
    ],
  },
  {
    slug: "landmark-bernhardsthal",
    perks: [
      { perkType: "GOVERNANCE", title: "Mixed-use votes", description: "Shape ground-floor activation and tenant mix.", minShareBps: 150, sortOrder: 0 },
      { perkType: "RENT_SHARE", title: "Mixed rent flows", description: "Revenue split by lease type per disclosure.", minShareBps: 50, sortOrder: 1 },
    ],
  },
] as const;

export const BC_TREASURY_SHARES = BUILDING_CULTURE_ASSETS.map((a) => ({
  slug: a.slug,
  shareBps: a.tokensSoldBps,
}));
