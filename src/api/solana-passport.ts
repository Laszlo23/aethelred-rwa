import { createServerFn } from "@tanstack/react-start";

export const coSignPassportMint = createServerFn({ method: "POST" })
  .validator((data: { signedTxBase64: string }) => data)
  .handler(async ({ data }) => {
    const { coSignAndSendPassportMint } = await import("@/lib/solana/transactions");
    const signature = await coSignAndSendPassportMint(data.signedTxBase64);
    return { signature };
  });
