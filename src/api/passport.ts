import { prisma, ensureSeeded } from "@/lib/db";
import { mapGuardianAudit, mapPassport } from "@/lib/db/mappers";
import { createServerFn } from "@tanstack/react-start";

export const getPassport = createServerFn({ method: "GET" })
  .validator((data: { assetId: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const passport = await prisma.assetPassport.findUnique({
      where: { assetId: data.assetId },
      include: { asset: true },
    });
    if (!passport) return null;
    return { passport: mapPassport(passport), assetName: passport.asset.name };
  });

export const listPassports = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeeded();
  const passports = await prisma.assetPassport.findMany({
    include: { asset: true },
    orderBy: { lastAuditAt: "desc" },
    take: 12,
  });
  return passports.map((p) => ({
    passport: mapPassport(p),
    asset: {
      slug: p.asset.slug,
      name: p.asset.name,
      location: p.asset.location,
      imageUrl: p.asset.imageUrl,
      valueCents: p.asset.valueCents,
      debtCents: p.asset.debtCents,
    },
  }));
});
