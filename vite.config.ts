// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "node-server",
    traceDeps: [
      "!@coral-xyz/anchor",
      "!@drift-labs/sdk",
      "!@solana/web3.js",
      "!@solana/spl-token",
    ],
  },
  vite: {
    ssr: {
      external: [
        "@prisma/client",
        "@coral-xyz/anchor",
        "@solana/spl-token",
        "@solana/web3.js",
        "@solana/wallet-adapter-react",
        "@solana/wallet-adapter-react-ui",
        "@solana/wallet-adapter-phantom",
        "@solana/wallet-adapter-solflare",
        "@solana/wallet-adapter-base",
        "@drift-labs/sdk",
        "lightweight-charts",
        "bs58",
        "tweetnacl",
        "buffer",
        "bn.js",
      ],
      noExternal: [],
    },
    optimizeDeps: {
      include: ["buffer"],
      exclude: ["@drift-labs/sdk"],
    },
  },
});
