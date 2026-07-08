import { createFileRoute } from "@tanstack/react-router";
import { prisma, ensureSeeded } from "@/lib/db";
import { mapGuardianAudit } from "@/lib/db/mappers";

export const Route = createFileRoute("/api/guardian/stream")({
  server: {
    handlers: {
      GET: async () => {
        await ensureSeeded();
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            const send = (data: unknown) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };
            send({ type: "connected" });
            const interval = setInterval(async () => {
              const audits = await prisma.guardianAudit.findMany({
                orderBy: { createdAt: "desc" },
                take: 1,
              });
              if (audits[0]) send({ type: "audit", audit: mapGuardianAudit(audits[0]) });
            }, 5000);
            setTimeout(() => {
              clearInterval(interval);
              controller.close();
            }, 120000);
          },
        });
        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
