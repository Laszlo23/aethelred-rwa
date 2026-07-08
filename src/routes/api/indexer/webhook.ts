import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/indexer/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.HELIUS_WEBHOOK_SECRET;
        if (secret) {
          const auth = request.headers.get("authorization");
          if (auth !== `Bearer ${secret}`) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
          }
        }

        const payload = await request.json();
        const { handleHeliusWebhook } = await import("@/workers/chain-indexer");
        const result = await handleHeliusWebhook(payload);
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
