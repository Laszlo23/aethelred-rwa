import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/markets/")({
  beforeLoad: () => {
    throw redirect({ to: "/markets/$symbol", params: { symbol: "OG1-PERP" } });
  },
});
