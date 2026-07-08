import { createFileRoute } from "@tanstack/react-router";
import { TradingTerminal } from "@/components/markets/trading-terminal";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/markets/$symbol")({
  ssr: false,
  head: ({ params }) =>
    pageSeo({
      title: `${params.symbol} Markets`,
      description: `Trade ${params.symbol} perpetuals and RWA-linked markets on Aethelred.`,
      path: `/markets/${params.symbol}`,
    }),
  component: MarketTerminalPage,
});

function MarketTerminalPage() {
  const { symbol } = Route.useParams();
  return <TradingTerminal symbol={symbol} />;
}
