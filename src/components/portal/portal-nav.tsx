"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PortalNav() {
  const pathname = usePathname();
  const active =
    pathname === "/portal" || pathname.startsWith("/portal/tickets");
  return (
    <nav aria-label="Portal" className="hidden sm:block">
      <Link
        href="/portal"
        aria-current={active ? "page" : undefined}
        className={cn(
          "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          active
            ? "bg-surface-2 text-fg"
            : "text-fg-muted hover:bg-surface-2 hover:text-fg",
        )}
      >
        My requests
      </Link>
    </nav>
  );
}

export function NewRequestButton() {
  return (
    <Link href="/portal/new" className={cn(buttonStyles(), "max-sm:px-2.5")}>
      <Plus className="size-4" />
      <span className="max-sm:sr-only">New request</span>
    </Link>
  );
}
