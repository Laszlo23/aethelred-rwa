import { createFileRoute } from "@tanstack/react-router";
import { TaskBoard } from "@/components/task-board";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/tasks")({
  ssr: false,
  head: () =>
    pageSeo({
      title: "Community",
      description:
        "Complete Building Culture tasks, earn BCT rewards and points, and grow the Aethelred ecosystem.",
      path: "/tasks",
    }),
  component: TasksPage,
});

function TasksPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
      <header className="mb-14">
        <p className="eyebrow">Building Culture × Aethelred</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Task Board
        </h1>
        <p className="mt-4 text-muted-foreground">
          Pick a contribution. Complete it. Get rewarded instantly — on-chain BCT and points.
        </p>
      </header>
      <TaskBoard />
    </div>
  );
}
