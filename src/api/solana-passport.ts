import { createServerFn } from "@tanstack/react-start";
import { coSignAndSendPassportMint } from "@/lib/solana/transactions";

export const coSignPassportMint = createServerFn({ method: "POST" })
  .validator((data: { signedTxBase64: string }) => data)
  .handler(async ({ data }) => {
    const signature = await coSignAndSendPassportMint(data.signedTxBase64);
    return { signature };
  });
