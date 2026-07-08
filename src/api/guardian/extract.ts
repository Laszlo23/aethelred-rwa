import type { ExtractedAssetFields, GuardianAuditResult } from "@/lib/types";
import {
  computeAssetTrustFactors,
  compositeAssetTrustScore,
} from "@/lib/trust/scoring";

function parseEuroAmount(text: string): number | null {
  const match = text.match(/€?\s*([\d.,]+)\s*(million|m|k)?/i);
  if (!match) return null;
  let num = parseFloat(match[1].replace(/,/g, ""));
  const unit = match[2]?.toLowerCase();
  if (unit === "million" || unit === "m") num *= 1_000_000;
  if (unit === "k") num *= 1_000;
  return Math.round(num * 100);
}

export function extractAssetFieldsHeuristic(
  naturalLanguage: string,
  assetType: string,
): ExtractedAssetFields {
  const lower = naturalLanguage.toLowerCase();
  const cities = [
    ["vienna", "Vienna, Austria"],
    ["berlin", "Berlin, Germany"],
    ["paris", "Paris, France"],
    ["milan", "Milan, Italy"],
    ["zurich", "Zürich, Switzerland"],
    ["lyon", "Lyon, France"],
    ["madrid", "Madrid, Spain"],
  ];
  let location = "Europe";
  for (const [key, loc] of cities) {
    if (lower.includes(key)) {
      location = loc;
      break;
    }
  }
  const valueCents = parseEuroAmount(naturalLanguage) ?? 2_000_000_00;
  const riskProfile =
    valueCents > 5_000_000_00 ? "institutional" : valueCents > 1_000_000_00 ? "standard" : "emerging";
  return {
    location,
    assetType,
    estimatedValueCents: valueCents,
    documentsNeeded: ["Ownership deed", "Valuation report", "Debt statement", "Insurance certificate"],
    riskProfile,
  };
}

export async function extractAssetFields(
  naturalLanguage: string,
  assetType: string,
): Promise<ExtractedAssetFields> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return extractAssetFieldsHeuristic(naturalLanguage, assetType);
  }
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Extract RWA asset fields from user text. Return JSON: location, assetType, estimatedValueCents (integer cents), documentsNeeded (string[]), riskProfile (string).",
          },
          { role: "user", content: `Asset type: ${assetType}\nDescription: ${naturalLanguage}` },
        ],
      }),
    });
    if (!res.ok) return extractAssetFieldsHeuristic(naturalLanguage, assetType);
    const json = await res.json();
    const parsed = JSON.parse(json.choices[0].message.content) as ExtractedAssetFields;
    return parsed;
  } catch {
    return extractAssetFieldsHeuristic(naturalLanguage, assetType);
  }
}

export function computeAuditResult(
  valueCents: number,
  debtCents: number,
  riskProfile: string,
  extras?: {
    occupancyBps?: number;
    hasAttestation?: boolean;
    navAgeDays?: number;
    reserveMatchBps?: number;
  },
): GuardianAuditResult & { trustFactors: ReturnType<typeof computeAssetTrustFactors> } {
  const factors = computeAssetTrustFactors({
    valueCents,
    debtCents,
    yieldBps: 750,
    occupancyBps: extras?.occupancyBps ?? 9000,
    hasAttestation: extras?.hasAttestation ?? true,
    navAgeDays: extras?.navAgeDays ?? 7,
    reserveMatchBps: extras?.reserveMatchBps ?? 9500,
  });

  let trustScore = compositeAssetTrustScore(factors);
  if (riskProfile === "institutional") trustScore = Math.min(100, trustScore + 3);
  if (riskProfile === "emerging") trustScore = Math.max(50, trustScore - 5);
  const ltv = debtCents / valueCents;
  if (ltv > 0.6) trustScore -= 8;
  if (ltv < 0.3) trustScore += 4;
  trustScore = Math.min(100, Math.max(50, trustScore));

  const guardianGrade =
    trustScore >= 95 ? "A+" : trustScore >= 90 ? "A" : trustScore >= 85 ? "B+" : trustScore >= 80 ? "B" : "C";
  const collateralRatio = 150;
  const liquidityEstimateCents = Math.max(0, Math.floor(valueCents / 1.5) - debtCents);
  return { trustScore, collateralRatio, guardianGrade, liquidityEstimateCents, riskProfile, trustFactors: factors };
}

export function signAttestation(payload: Record<string, unknown>): string {
  const secret = process.env.GUARDIAN_SIGNER_SECRET || "dev-guardian-key";
  const data = JSON.stringify(payload);
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data.charCodeAt(i);
    hash |= 0;
  }
  return `gdn_${Math.abs(hash).toString(16)}_${secret.slice(0, 8)}`;
}
