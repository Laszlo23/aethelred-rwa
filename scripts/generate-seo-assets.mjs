#!/usr/bin/env node
/**
 * Generates raster SEO assets from public/favicon.svg and public/og-image.svg.
 * Run: node scripts/generate-seo-assets.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");

async function loadSharp() {
  try {
    const mod = await import("sharp");
    return mod.default;
  } catch {
    const { execSync } = await import("node:child_process");
    execSync("npm install --no-save sharp@0.34.3", { cwd: root, stdio: "inherit" });
    const mod = await import("sharp");
    return mod.default;
  }
}

async function main() {
  const sharp = await loadSharp();
  const faviconSvg = await readFile(path.join(publicDir, "favicon.svg"));
  const ogSvg = await readFile(path.join(publicDir, "og-image.svg"));

  const sizes = [
    ["apple-touch-icon.png", faviconSvg, 180],
    ["icon-192.png", faviconSvg, 192],
    ["icon-512.png", faviconSvg, 512],
  ];

  for (const [name, input, size] of sizes) {
    const out = path.join(publicDir, name);
    await sharp(input).resize(size, size).png().toFile(out);
    console.log(`wrote ${name}`);
  }

  await sharp(ogSvg)
    .resize(1200, 630)
    .jpeg({ quality: 90 })
    .toFile(path.join(publicDir, "og-image.jpg"));
  console.log("wrote og-image.jpg");

  const favicon32 = await sharp(faviconSvg).resize(32, 32).png().toBuffer();
  await writeFile(path.join(publicDir, "favicon-32.png"), favicon32);
  console.log("wrote favicon-32.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
