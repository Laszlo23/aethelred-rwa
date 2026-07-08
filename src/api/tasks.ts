import { prisma, ensureSeeded } from "@/lib/db";
import { mapTask } from "@/lib/db/mappers";
import { createServerFn } from "@tanstack/react-start";

// Future: POST /api/tasks/x-callback webhook for real X follow verification via OAuth/API tier.

export const listTasks = createServerFn({ method: "GET" })
  .validator((data: { walletAddress?: string; category?: string } | undefined) => data ?? {})
  .handler(async ({ data }) => {
    await ensureSeeded();
    const user = data.walletAddress
      ? await prisma.user.findUnique({ where: { walletAddress: data.walletAddress } })
      : null;
    const tasks = await prisma.task.findMany({
      where: {
        active: true,
        ...(data.category && data.category !== "ALL" ? { category: data.category as never } : {}),
      },
      orderBy: [{ category: "asc" }, { rewardPoints: "asc" }],
    });
    const completions = user
      ? await prisma.taskCompletion.findMany({ where: { userId: user.id } })
      : [];
    const completionMap = new Map(completions.map((c) => [c.taskId, c]));
    return tasks.map((t) => mapTask(t, completionMap.get(t.id) ?? null));
  });

export const startTask = createServerFn({ method: "POST" })
  .validator((data: { taskSlug: string; walletAddress: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const user = await prisma.user.upsert({
      where: { walletAddress: data.walletAddress },
      create: { walletAddress: data.walletAddress },
      update: {},
    });
    const task = await prisma.task.findUnique({ where: { slug: data.taskSlug } });
    if (!task) throw new Error("Task not found");
    const completion = await prisma.taskCompletion.upsert({
      where: { userId_taskId: { userId: user.id, taskId: task.id } },
      create: { userId: user.id, taskId: task.id, status: "STARTED" },
      update: {},
    });
    return { completionId: completion.id, status: completion.status };
  });

export const submitTaskProof = createServerFn({ method: "POST" })
  .validator((data: { taskSlug: string; walletAddress: string; proofUrl?: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const user = await prisma.user.findUnique({ where: { walletAddress: data.walletAddress } });
    if (!user) throw new Error("Connect wallet first");
    const task = await prisma.task.findUnique({ where: { slug: data.taskSlug } });
    if (!task) throw new Error("Task not found");

    let status: "SUBMITTED" | "CLAIMABLE" = "SUBMITTED";
    if (task.verificationType === "WALLET_CONNECT" || task.verificationType === "SOCIAL_FOLLOW") {
      status = "CLAIMABLE";
    }

    const completion = await prisma.taskCompletion.upsert({
      where: { userId_taskId: { userId: user.id, taskId: task.id } },
      create: {
        userId: user.id,
        taskId: task.id,
        status,
        proofUrl: data.proofUrl ?? null,
      },
      update: { status, proofUrl: data.proofUrl ?? null },
    });
    return { completionId: completion.id, status: completion.status };
  });

export const claimTaskReward = createServerFn({ method: "POST" })
  .validator((data: { taskSlug: string; walletAddress: string; txSignature: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const user = await prisma.user.findUnique({ where: { walletAddress: data.walletAddress } });
    if (!user) throw new Error("Connect wallet first");
    const task = await prisma.task.findUnique({ where: { slug: data.taskSlug } });
    if (!task) throw new Error("Task not found");
    const completion = await prisma.taskCompletion.findUnique({
      where: { userId_taskId: { userId: user.id, taskId: task.id } },
    });
    if (!completion || (completion.status !== "CLAIMABLE" && completion.status !== "VERIFIED")) {
      throw new Error("Reward not claimable");
    }
    await prisma.taskCompletion.update({
      where: { id: completion.id },
      data: { status: "CLAIMED", txSignature: data.txSignature },
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { pointsBalance: user.pointsBalance + task.rewardPoints },
    });
    return {
      pointsAwarded: task.rewardPoints,
      tokenAmount: task.rewardTokenAmount,
      newBalance: user.pointsBalance + task.rewardPoints,
    };
  });
