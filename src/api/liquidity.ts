import { prisma, ensureSeeded } from "@/lib/db";
import { mapLiquidityPool } from "@/lib/db/mappers";
import { createServerFn } from "@tanstack/react-start";

export const getPoolStats = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeeded();
  const pool = await prisma.liquidityPool.findUnique({ where: { id: "singleton" } });
  if (!pool) throw new Error("Liquidity pool not initialized");
  return mapLiquidityPool(pool);
});
