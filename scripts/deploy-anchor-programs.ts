/**
 * Deploy Anchor program IDs to devnet (requires anchor CLI + funded wallet).
 * Records program IDs in .env for the app.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

const ENV_MAP: Record<string, string[]> = {
  aethelred_passport: ["PASSPORT_PROGRAM_ID", "VITE_PASSPORT_PROGRAM_ID"],
  aethelred_registry: ["REGISTRY_PROGRAM_ID", "VITE_REGISTRY_PROGRAM_ID"],
  aethelred_names: ["NAMES_PROGRAM_ID", "VITE_NAMES_PROGRAM_ID"],
  aethelred_vault: ["VAULT_PROGRAM_ID", "VITE_VAULT_PROGRAM_ID"],
  aethelred_euro: ["EURO_PROGRAM_ID"],
  aethelred_rewards: ["REWARDS_PROGRAM_ID"],
};

function run(cmd: string) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: "inherit" });
}

function updateEnv(key: string, value: string) {
  const envPath = join(ROOT, ".env");
  const examplePath = join(ROOT, ".env.example");
  const target = existsSync(envPath) ? envPath : examplePath;
  let content = readFileSync(target, "utf8");
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(content)) {
    content = content.replace(re, `${key}="${value}"`);
  } else {
    content += `\n${key}="${value}"\n`;
  }
  writeFileSync(target, content);
  console.log(`Updated ${key} in ${target}`);
}

function parseDevnetProgramIds(toml: string): Record<string, string> {
  const programs: Record<string, string> = {};
  let inDevnet = false;
  for (const line of toml.split("\n")) {
    if (line.trim() === "[programs.devnet]") {
      inDevnet = true;
      continue;
    }
    if (inDevnet && line.startsWith("[")) break;
    if (!inDevnet) continue;
    const m = line.match(/^(\w+)\s*=\s*"([^"]+)"/);
    if (m) programs[m[1]] = m[2];
  }
  return programs;
}

try {
  run("anchor build --no-idl");
  run("anchor deploy --provider.cluster devnet");

  const anchorToml = readFileSync(join(ROOT, "Anchor.toml"), "utf8");
  const programs = parseDevnetProgramIds(anchorToml);
  if (Object.keys(programs).length === 0) {
    throw new Error("No program IDs found under [programs.devnet] in Anchor.toml");
  }

  for (const [prog, envKeys] of Object.entries(ENV_MAP)) {
    const id = programs[prog];
    if (!id) {
      console.warn(`Missing program id for ${prog}`);
      continue;
    }
    for (const envKey of envKeys) {
      updateEnv(envKey, id);
    }
  }

  updateEnv("VITE_SOLANA_NETWORK", "devnet");
  updateEnv("SOLANA_RPC_URL", process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com");
  updateEnv("VITE_SOLANA_RPC_URL", process.env.VITE_SOLANA_RPC_URL ?? "https://api.devnet.solana.com");

  console.log("Anchor programs deployed. Restart dev server to pick up new env vars.");
} catch (err) {
  console.error("Deploy failed:", err);
  process.exit(1);
}
