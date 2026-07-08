import { SOCIAL_LINKS } from "@/lib/data/seed";

const X_HANDLE = "buildingcultu3";
const TWEET_IDS = {
  rwaLaunch: "2074869766225867136",
  stackXi: "2074296249377788348",
} as const;

const TASK_REF = "aethelred_tasks";

export type SocialAction =
  | "follow"
  | "like"
  | "repost"
  | "comment"
  | "farcaster"
  | "telegram"
  | "share"
  | "open";

export interface TaskActionConfig {
  action?: SocialAction;
  actionUrl?: string;
  intentUrl?: string;
  actionLabel?: string;
  requiresProof?: boolean;
  proofHint?: string;
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

export const GROK_SHARE_URL = buildXShareIntent(
  `Everyone is tokenizing JPEGs. We tokenized reality.\n\nVerified buildings, land & water on Solana — explore Aethelred:\n${SOCIAL_LINKS.rwaSite}\n\n@${X_HANDLE}`,
);
