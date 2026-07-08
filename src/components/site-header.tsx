import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Menu,
  ChevronDown,
  Compass,
  Plus,
  Briefcase,
  Shield,
  Cpu,
  Users,
  Scale,
  Repeat2,
  Wallet,
  AtSign,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { WalletButton } from "@/components/wallet-button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mainNav: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/create", label: "Create", icon: Plus },
  { to: "/portfolio", label: "My Assets", icon: Briefcase },
  { to: "/profile", label: "Profile", icon: UserRound },
];

const moreNav: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/guardian", label: "Guardian", icon: Shield },
  { to: "/markets", label: "Markets", icon: Repeat2 },
  { to: "/funds", label: "Funds", icon: Wallet },
  { to: "/names", label: "Names", icon: AtSign },
  { to: "/technology", label: "Technology", icon: Cpu },
  { to: "/tasks", label: "Community", icon: Users },
  { to: "/governance", label: "Governance", icon: Scale },
  { to: "/admin", label: "Admin · KYC", icon: ShieldCheck },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-block h-5 w-5 rounded-sm bg-gradient-to-br from-accent to-accent/40 ring-1 ring-inset ring-white/20" />
          <span className="text-sm font-semibold tracking-tight">
            AETHELRED
            <span className="ml-1.5 text-muted-foreground/70">/ rwa</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{
                className: "inline-flex items-center gap-2 text-sm font-medium text-foreground",
              }}
            >
              <item.icon className="h-4 w-4 opacity-70" strokeWidth={1.75} />
              {item.label}
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              <Menu className="h-4 w-4 opacity-70" strokeWidth={1.75} />
              More
              <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border bg-surface">
              {moreNav.map((item) => (
                <DropdownMenuItem key={item.to} asChild>
                  <Link to={item.to} className="flex cursor-pointer items-center gap-2">
                    <item.icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <button className="rounded-md border border-border p-2" aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="border-border bg-background">
              <nav className="mt-8 flex flex-col gap-4">
                {mainNav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center gap-3 text-lg font-medium text-muted-foreground hover:text-foreground"
                    activeProps={{
                      className: "inline-flex items-center gap-3 text-lg font-medium text-accent",
                    }}
                  >
                    <item.icon className="h-5 w-5" strokeWidth={1.75} />
                    {item.label}
                  </Link>
                ))}
                <div className="my-2 border-t border-border" />
                <p className="eyebrow !text-[10px]">More</p>
                {moreNav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center gap-3 text-base font-medium text-muted-foreground hover:text-foreground"
                  >
                    <item.icon className="h-4 w-4" strokeWidth={1.75} />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <WalletButton />
        </div>
      </div>
    </header>
  );
}
