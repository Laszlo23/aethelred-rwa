#!/usr/bin/env node
/**
 * Compress and resize large JPEG/PNG assets for web delivery.
 * Run: node scripts/optimize-images.mjs
 */
import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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

function formatMb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function optimizeFile(sharp, filePath) {
  const before = await stat(filePath);
  const name = path.basename(filePath);
  const meta = await sharp(filePath).metadata();
  const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
  const isHero = /hero/i.test(name);
  const maxEdge = isHero ? 2400 : 1920;

  let pipeline = sharp(filePath).rotate(); // respect EXIF orientation

  if (longest > maxEdge) {
    pipeline = pipeline.resize({
      width: meta.width >= (meta.height ?? 0) ? maxEdge : undefined,
      height: (meta.height ?? 0) > (meta.width ?? 0) ? maxEdge : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const ext = path.extname(filePath).toLowerCase();
  let output;
  if (ext === ".png") {
    output = await pipeline.png({ compressionLevel: 9, palette: true }).toBuffer();
  } else {
    output = await pipeline.jpeg({ quality: 82, mozjpeg: true, progressive: true }).toBuffer();
  }

  // Skip if savings are negligible and no resize happened
  if (output.length >= before.size * 0.95 && longest <= maxEdge) {
    return { name, before: before.size, after: before.size, skipped: true };
  }

  await writeFile(filePath, output);
  return { name, before: before.size, after: output.length, skipped: false };
}

async function optimizeDir(sharp, dir) {
  const entries = await readdir(dir);
  const results = [];
  for (const entry of entries) {
    if (!/\.(jpe?g|png)$/i.test(entry)) continue;
    results.push(await optimizeFile(sharp, path.join(dir, entry)));
  }
  return results;
}

async function main() {
  const sharp = await loadSharp();
  const dirs = [path.join(root, "public", "bc"), path.join(root, "src", "assets")];

  let totalBefore = 0;
  let totalAfter = 0;

  for (const dir of dirs) {
    console.log(`\n==> ${path.relative(root, dir)}`);
    const results = await optimizeDir(sharp, dir);
    for (const r of results) {
      totalBefore += r.before;
      totalAfter += r.after;
      const delta = ((1 - r.after / r.before) * 100).toFixed(0);
      if (r.skipped) {
        console.log(`  skip ${r.name} (${formatMb(r.before)})`);
      } else {
        console.log(`  ok   ${r.name}: ${formatMb(r.before)} -> ${formatMb(r.after)} (-${delta}%)`);
      }
    }
  }

  const saved = totalBefore - totalAfter;
  console.log(
    `\nTotal: ${formatMb(totalBefore)} -> ${formatMb(totalAfter)} (saved ${formatMb(saved)}, -${((saved / totalBefore) * 100).toFixed(0)}%)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
