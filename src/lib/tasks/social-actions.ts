import type { TaskDTO } from "@/lib/types";
import { SOCIAL_LINKS } from "@/lib/data/seed";

const X_HANDLE = "buildingcultu3";
const TWEET_IDS = {
  rwaLaunch: "2074869766225867136",
  stackXi: "2074296249377788348",
} as const;

export const TASK_FLOW_VERSION = 2;
const TASK_REF = "aethelred_tasks";

export type SocialAction =
  "follow" | "like" | "repost" | "comment" | "farcaster" | "telegram" | "share" | "open";

export interface TaskActionConfig {
  action?: SocialAction;
  actionUrl?: string;
  intentUrl?: string;
  actionLabel?: string;
  requiresProof?: boolean;
  proofHint?: string;
  flowVersion?: number;
}

export const TASK_SLUG_DEFAULTS: Record<string, TaskActionConfig> = {
  "follow-bc-x": {
    action: "follow",
    intentUrl: "https://x.com/intent/follow?screen_name=buildingcultu3",
    actionLabel: "Follow on X",
    requiresProof: false,
    flowVersion: TASK_FLOW_VERSION,
  },
  "join-telegram": {
    action: "telegram",
    actionUrl: SOCIAL_LINKS.telegram,
    actionLabel: "Join Telegram",
    requiresProof: false,
    flowVersion: TASK_FLOW_VERSION,
  },
  "like-launch-post": {
    action: "like",
    actionUrl: SOCIAL_LINKS.rwaLaunchPost,
    actionLabel: "Like on X",
    requiresProof: false,
    flowVersion: TASK_FLOW_VERSION,
  },
  "repost-announcement": {
    action: "repost",
    intentUrl: `https://x.com/intent/retweet?tweet_id=${TWEET_IDS.rwaLaunch}`,
    actionLabel: "Repost on X",
    requiresProof: false,
    flowVersion: TASK_FLOW_VERSION,
  },
  "repost-stack-xi": {
    action: "repost",
    intentUrl: `https://x.com/intent/retweet?tweet_id=${TWEET_IDS.stackXi}`,
    actionLabel: "Repost on X",
    requiresProof: false,
    flowVersion: TASK_FLOW_VERSION,
  },
  "engage-farcaster-rwa": {
    action: "farcaster",
    actionUrl: SOCIAL_LINKS.farcasterRwaCast,
    actionLabel: "Open on Farcaster",
    requiresProof: false,
    flowVersion: TASK_FLOW_VERSION,
  },
  "comment-opinion": {
    action: "comment",
    intentUrl:
      "https://x.com/intent/tweet?in_reply_to=2074869766225867136&text=Tokenized%20real%20assets%20with%20transparent%20debt%20and%20Guardian%20verification.",
    actionLabel: "Comment on X",
    requiresProof: false,
    flowVersion: TASK_FLOW_VERSION,
  },
  "share-on-x": {
    action: "share",
    intentUrl:
      "https://x.com/intent/tweet?text=Own%20a%20piece%20of%20the%20real%20world%20%E2%80%94%20verified%20buildings%2C%20land%20%26%20water%20on%20Solana.%0A%0Ahttps%3A%2F%2Frwa.buildingcultureid.space%0A%0A%40buildingcultu3",
    actionLabel: "Share on X",
    requiresProof: false,
    flowVersion: TASK_FLOW_VERSION,
  },
};

export interface EnrichedTaskAction extends TaskActionConfig {
  openUrl?: string;
  label: string;
}

export function enrichTaskAction(task: TaskDTO): EnrichedTaskAction {
  const defaults = TASK_SLUG_DEFAULTS[task.slug] ?? {};
  const merged: TaskActionConfig = {
    action: task.action ?? defaults.action,
    actionUrl: task.actionUrl ?? defaults.actionUrl,
    intentUrl: task.intentUrl ?? defaults.intentUrl,
    actionLabel: task.actionLabel ?? defaults.actionLabel,
    requiresProof: task.requiresProof ?? defaults.requiresProof,
    proofHint: task.proofHint ?? defaults.proofHint,
    flowVersion: task.flowVersion ?? defaults.flowVersion,
  };
  const openUrl = resolveTaskActionUrl(merged);
  return {
    ...merged,
    openUrl,
    label: defaultActionLabel(merged),
  };
}

export function isQuickSocialTask(task: TaskDTO): boolean {
  if (task.verificationType !== "SOCIAL_FOLLOW") return false;
  if (task.category === "EASY") return true;
  const enriched = enrichTaskAction(task);
  return enriched.requiresProof !== true;
}

export function buildXFollowIntent(screenName = X_HANDLE): string {
  return `https://x.com/intent/follow?screen_name=${encodeURIComponent(screenName)}`;
}

export function buildXRetweetIntent(tweetId: string): string {
  return `https://x.com/intent/retweet?tweet_id=${encodeURIComponent(tweetId)}`;
}

export function buildXReplyIntent(tweetId: string, prefilled?: string): string {
  const params = new URLSearchParams({ in_reply_to: tweetId });
  if (prefilled) params.set("text", prefilled);
  return `https://x.com/intent/tweet?${params.toString()}`;
}

export function buildXShareIntent(text: string): string {
  return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function withTaskRef(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("ref_src", TASK_REF);
    return parsed.toString();
  } catch {
    return url;
  }
}

export function resolveTaskActionUrl(config: TaskActionConfig): string | undefined {
  if (config.intentUrl) return config.intentUrl;
  if (config.actionUrl) return config.actionUrl;

  switch (config.action) {
    case "follow":
      return buildXFollowIntent();
    case "repost":
      return buildXRetweetIntent(TWEET_IDS.rwaLaunch);
    case "comment":
      return buildXReplyIntent(
        TWEET_IDS.rwaLaunch,
        "Tokenized real assets with transparent debt and Guardian verification — this is the future of RWAs.",
      );
    case "like":
      return withTaskRef(SOCIAL_LINKS.rwaLaunchPost);
    case "farcaster":
      return SOCIAL_LINKS.farcasterRwaCast;
    case "telegram":
      return SOCIAL_LINKS.telegram;
    case "share":
      return buildXShareIntent(
        `Own a piece of the real world — verified buildings, land & water on Solana.\n\n${SOCIAL_LINKS.rwaSite}\n\n@${X_HANDLE}`,
      );
    default:
      return undefined;
  }
}

export function defaultActionLabel(config: TaskActionConfig): string {
  if (config.actionLabel) return config.actionLabel;
  switch (config.action) {
    case "follow":
      return "Follow on X";
    case "like":
      return "Like on X";
    case "repost":
      return "Repost on X";
    case "comment":
      return "Comment on X";
    case "farcaster":
      return "Open on Farcaster";
    case "telegram":
      return "Join Telegram";
    case "share":
      return "Share on X";
    default:
      return "Start task";
  }
}

export function platformLabel(task: TaskDTO): string {
  const action = enrichTaskAction(task).action;
  if (action === "farcaster") return "Farcaster";
  if (action === "telegram") return "Telegram";
  return "X";
}

export const GROK_SHARE_URL = buildXShareIntent(
  `Everyone is tokenizing JPEGs. We tokenized reality.\n\nVerified buildings, land & water on Solana — explore Aethelred:\n${SOCIAL_LINKS.rwaSite}\n\n@${X_HANDLE}`,
);
