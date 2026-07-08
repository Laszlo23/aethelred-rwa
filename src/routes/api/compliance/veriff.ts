import { createFileRoute } from "@tanstack/react-router";
import { setWalletVerified } from "@/api/compliance";

export const Route = createFileRoute("/api/compliance/veriff")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.VERIFF_WEBHOOK_SECRET;
        if (secret) {
          const sig = request.headers.get("x-hmac-signature");
          if (sig !== secret) {
            return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
          }
        }

        const body = (await request.json()) as {
          verification?: { status?: string; id?: string };
          person?: { id?: string };
          vendorData?: string;
        };

        const wallet = body.vendorData?.trim();
        if (!wallet) {
          return new Response(JSON.stringify({ error: "Missing wallet in vendorData" }), {
            status: 400,
          });
        }

        const status = body.verification?.status ?? "approved";
        if (status !== "approved") {
          return new Response(JSON.stringify({ ok: true, skipped: true }), {
            headers: { "Content-Type": "application/json" },
          });
        }

        const result = await setWalletVerified({
          data: {
            walletAddress: wallet,
            kycTier: "basic",
            externalRef: body.verification?.id,
          },
        });

        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
