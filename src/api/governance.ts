import { prisma, ensureSeeded } from "@/lib/db";
import { mapProposal } from "@/lib/db/mappers";
import { createServerFn } from "@tanstack/react-start";

export const listProposals = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeeded();
  const proposals = await prisma.proposal.findMany({ orderBy: { createdAt: "desc" } });
  return proposals.map(mapProposal);
});

export const voteProposal = createServerFn({ method: "POST" })
  .validator((data: { proposalId: string; walletAddress: string; support: boolean }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const user = await prisma.user.findUnique({ where: { walletAddress: data.walletAddress } });
    if (!user) throw new Error("Connect wallet first");
    await prisma.vote.upsert({
      where: { proposalId_userId: { proposalId: data.proposalId, userId: user.id } },
      create: { proposalId: data.proposalId, userId: user.id, support: data.support },
      update: { support: data.support },
    });
    const votes = await prisma.vote.findMany({ where: { proposalId: data.proposalId } });
    const votesFor = votes.filter((v) => v.support).length;
    const votesAgainst = votes.filter((v) => !v.support).length;
    await prisma.proposal.update({
      where: { id: data.proposalId },
      data: { votesFor, votesAgainst },
    });
    return { votesFor, votesAgainst };
  });
