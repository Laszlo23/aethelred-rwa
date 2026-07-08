#!/usr/bin/env node
/**
 * Push RWA campaign posts via Grove marketing APIs (app.buildingcultureid.space).
 *
 *   node scripts/grove-push-campaign.mjs
 *   node scripts/grove-push-campaign.mjs --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadDotenv(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const s = line.trim();
    if (!s || s.startsWith("#")) continue;
    const eq = s.indexOf("=");
    if (eq < 1) continue;
    const k = s.slice(0, eq).trim();
    let v = s.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

const env = { ...loadDotenv(path.join(root, ".env")), ...process.env };
const dryRun = process.argv.includes("--dry-run");

const origin = String(
  env.GROVE_TICK_URL || "https://app.buildingcultureid.space/api/marketing/grove/tick",
)
  .replace(/\/api\/marketing\/grove\/tick$/, "")
  .replace(/\/$/, "");
const secret = String(env.GROVE_MARKETING_ADMIN_SECRET || "").trim();
const rwaSite = String(env.VITE_SITE_URL || "https://rwa.buildingcultureid.space").replace(
  /\/$/,
  "",
);

const LINKS = {
  xAccount: "https://x.com/buildingcultu3",
  rwaPost: "https://x.com/buildingcultu3/status/2074869766225867136",
  stackPost: "https://x.com/buildingcultu3/status/2074296249377788348",
  farcaster: "https://farcaster.xyz/0xleonardo/0x5a65a970",
};

const CAMPAIGN = {
  xRwa: `Own a piece of the real world — verified buildings, land & water on Solana.\n\nExplore Aethelred:\n${rwaSite}\n\n${LINKS.rwaPost}`,
  xStack: `Building Culture on Base + Solana RWAs.\n\nSTACK XI Pepe squads:\nhttps://pepe.buildingcultureid.space\n\nRWA passports:\n${rwaSite}`,
  farcaster: `Everyone is tokenizing JPEGs. We tokenized reality.\n\n🏠 Buildings · 🌊 Water · 🌱 Land\nVerified by Guardian · Built on Solana\n\n${rwaSite}\n\n${LINKS.farcaster}`,
};

if (!secret) {
  console.error("Missing GROVE_MARKETING_ADMIN_SECRET in .env");
  process.exit(2);
}

async function grovePost(pathname, body) {
  const url = `${origin}${pathname}`;
  if (dryRun) {
    console.log(`[dry-run] POST ${url}`, body);
    return { ok: true, dryRun: true };
  }
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-grove-marketing-admin-secret": secret,
    },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    json = { raw };
  }
  if (!res.ok) {
    const err = new Error(`POST ${pathname} failed (${res.status}): ${JSON.stringify(json)}`);
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  return json;
}

async function main() {
  console.log("Grove RWA campaign push", dryRun ? "(dry-run)" : "(live)");
  console.log("Origin:", origin);

  const tickDry = await grovePost("/api/marketing/grove/tick", {
    dryRun: true,
    pillar: "rwa_proof",
  });
  console.log("\nTick preview:", JSON.stringify(tickDry.copy ?? tickDry, null, 2).slice(0, 600));

  if (!dryRun) {
    try {
      const tick = await grovePost("/api/marketing/grove/tick", { pillar: "rwa_proof" });
      console.log("\nTick result:", JSON.stringify(tick, null, 2));
    } catch (err) {
      console.warn(
        "\nTick skipped:",
        err.payload?.cooldownActive ? "cooldown_active" : err.message,
      );
    }
  }

  for (const [label, text] of [
    ["X RWA", CAMPAIGN.xRwa],
    ["X STACK", CAMPAIGN.xStack],
  ]) {
    try {
      const result = await grovePost("/api/marketing/grove/x-post", { text });
      console.log(`\n${label} post:`, JSON.stringify(result, null, 2));
    } catch (err) {
      console.warn(`\n${label} post failed:`, err.message);
    }
  }

  try {
    const fc = await grovePost("/api/marketing/grove/farcaster-post", { text: CAMPAIGN.farcaster });
    console.log("\nFarcaster post:", JSON.stringify(fc, null, 2));
  } catch (err) {
    console.warn("\nFarcaster post failed:", err.message);
  }

  console.log("\nDone. Community tasks on /tasks point users to:");
  console.log("  X:", LINKS.xAccount);
  console.log("  RWA post:", LINKS.rwaPost);
  console.log("  STACK post:", LINKS.stackPost);
  console.log("  Farcaster:", LINKS.farcaster);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
