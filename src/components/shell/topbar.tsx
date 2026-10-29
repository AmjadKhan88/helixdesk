"use client";

import Link from "next/link";
import { Menu, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button, buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "./global-search";
import { useShell } from "./shell-context";

export function Topbar() {
  const { setNavOpen } = useShell();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-canvas/85 px-4 backdrop-blur sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="-ml-2 lg:hidden"
        aria-label="Open navigation"
        onClick={() => setNavOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      <GlobalSearch />

      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />
        <Link
          href="/tickets?new=1"
          className={cn(buttonStyles(), "hidden sm:inline-flex")}
        >
          <Plus className="size-4" />
          New ticket
        </Link>
        <Link
          href="/tickets?new=1"
          aria-label="New ticket"
          className={cn(buttonStyles({ size: "icon" }), "sm:hidden")}
        >
          <Plus className="size-5" />
        </Link>
      </div>
    </header>
  );
}
