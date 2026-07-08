import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionLinkProps {
  to: string;
  icon: LucideIcon;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "hero-primary" | "hero-secondary";
  className?: string;
}

export function ActionLink({
  to,
  icon: Icon,
  children,
  variant = "primary",
  className,
}: ActionLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-all",
        variant === "primary" &&
          "rounded-md bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground",
        variant === "secondary" &&
          "rounded-md border border-border-strong bg-transparent text-foreground hover:bg-white/5",
        variant === "hero-primary" &&
          "btn-hero-primary hover:brightness-110",
        variant === "hero-secondary" &&
          "btn-hero-secondary hover:bg-white/10",
        className,
      )}
    >
      <Icon
        className="h-4 w-4 shrink-0"
        strokeWidth={
          variant === "hero-primary" || variant === "hero-secondary" ? 2.25 : 2
        }
      />
      {children}
    </Link>
  );
}

interface ActionButtonProps {
  onClick?: () => void;
  icon: LucideIcon;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}

export function ActionButton({
  onClick,
  icon: Icon,
  children,
  variant = "primary",
  disabled,
  type = "button",
  className,
}: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-6 py-3.5 text-sm font-semibold transition-all disabled:opacity-50",
        variant === "primary" &&
          "bg-accent text-accent-foreground hover:brightness-110",
        variant === "secondary" &&
          "border border-border-strong bg-transparent text-foreground hover:bg-white/5",
        className,
      )}
    >
      {children}
      <Icon className="h-4 w-4" strokeWidth={2} />
    </button>
  );
}
