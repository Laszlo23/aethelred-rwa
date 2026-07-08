// Browser polyfill for Node's Buffer, required by @solana/spl-token and
// @solana/web3.js when their modules are evaluated in the browser. On the
// server (SSR) Buffer already exists, so this is a no-op there.
import { Buffer } from "buffer";

declare global {
  interface Window {
    Buffer?: typeof Buffer;
    global?: typeof globalThis;
  }
}

if (typeof globalThis !== "undefined") {
  const g = globalThis as unknown as { Buffer?: typeof Buffer; global?: typeof globalThis };
  if (!g.Buffer) g.Buffer = Buffer;
  if (!g.global) g.global = globalThis;
}
