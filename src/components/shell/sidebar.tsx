"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ChartColumn,
  ChevronsUpDown,
  CircleDashed,
  Inbox,
  LayoutDashboard,
  LogOut,
  Settings,
  Siren,
  Tags,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Wordmark } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownSeparator,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { logoutAction } from "@/lib/actions/auth";
import type { Role } from "@/lib/constants";
import type { QueueCounts } from "@/lib/queries/queues";
import { cn } from "@/lib/utils";
import { useShell } from "./shell-context";

type SidebarUser = { name: string; email: string; role: Role };
type Props = { user: SidebarUser; counts: QueueCounts };

export function Sidebar(props: Props) {
  const { navOpen, setNavOpen } = useShell();
  const pathname = usePathname();

  // Close the drawer after navigating, and if the window grows past the mobile breakpoint
  useEffect(() => setNavOpen(false), [pathname, setNavOpen]);
  useEffect(() => {
    const mq = matchMedia("(min-width: 1024px)");
    const close = () => mq.matches && setNavOpen(false);
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, [setNavOpen]);

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-line bg-canvas lg:block">
        <SidebarBody {...props} />
      </aside>

      <Dialog.Root open={navOpen} onOpenChange={setNavOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 animate-[fade-in_0.15s_ease-out] bg-black/50 lg:hidden" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] animate-[drawer-in_0.22s_cubic-bezier(0.2,0.8,0.2,1)] border-r border-line bg-canvas shadow-2xl lg:hidden"
          >
            <Dialog.Title className="sr-only">Navigation</Dialog.Title>
            <SidebarBody {...props} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

function SidebarBody({ user, counts }: Props) {
  const pathname = usePathname();
  const view = useSearchParams().get("view") ?? "inbox";
  const onTickets = pathname === "/tickets";

  const queues = [
    { label: "Inbox", view: "inbox", icon: Inbox, count: counts.inbox },
    {
      label: "Assigned to me",
      view: "mine",
      icon: UserRound,
      count: counts.mine,
    },
    {
      label: "Unassigned",
      view: "unassigned",
      icon: CircleDashed,
      count: counts.unassigned,
    },
    {
      label: "Urgent",
      view: "urgent",
      icon: Siren,
      count: counts.urgent,
      danger: true,
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center px-4">
        <Wordmark />
      </div>

      <QueueHealth counts={counts} />

      <nav
        aria-label="Main"
        className="flex-1 space-y-6 overflow-y-auto px-3 py-5"
      >
        <NavGroup label="Queues">
          {queues.map((q) => (
            <NavLink
              key={q.view}
              href={`/tickets?view=${q.view}`}
              icon={q.icon}
              label={q.label}
              count={q.count}
              danger={q.danger}
              active={onTickets && view === q.view}
            />
          ))}
        </NavGroup>

        <NavGroup label="Workspace">
          <NavLink
            href="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            active={pathname === "/dashboard"}
          />
          <NavLink
            href="/reports"
            icon={ChartColumn}
            label="Reports"
            active={pathname.startsWith("/reports")}
          />
        </NavGroup>

        {user.role === "admin" && (
          <NavGroup label="Administration">
            <NavLink
              href="/admin/categories"
              icon={Tags}
              label="Categories"
              active={pathname.startsWith("/admin/categories")}
            />
            <NavLink
              href="/admin/team"
              icon={Users}
              label="Team"
              active={pathname.startsWith("/admin/team")}
            />
            <NavLink
              href="/admin/settings"
              icon={Settings}
              label="Settings"
              active={pathname.startsWith("/admin/settings")}
            />
          </NavGroup>
        )}
      </nav>

      <div className="shrink-0 border-t border-line p-3">
        <UserMenu user={user} />
      </div>
    </div>
  );
}

function QueueHealth({ counts }: { counts: QueueCounts }) {
  const { urgent, high, low } = counts.mix;
  const total = urgent + high + low;
  const segments = [
    { n: urgent, cls: "bg-danger" },
    { n: high, cls: "bg-warn" },
    { n: low, cls: "bg-line-strong" },
  ].filter((s) => s.n > 0);

  return (
    <div className="mx-3 rounded-lg border border-line bg-surface p-3">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-fg">{total} active</span>
        <span className="tabular-nums text-fg-subtle">{urgent} urgent</span>
      </div>
      <div
        role="img"
        aria-label={`Active tickets: ${urgent} urgent, ${high} high, ${low} low priority`}
        className="mt-2 flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-surface-2"
      >
        {segments.map((s) => (
          <span key={s.cls} className={s.cls} style={{ flex: `${s.n} 1 0` }} />
        ))}
      </div>
    </div>
  );
}

function NavGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 px-2.5 text-xs font-medium text-fg-subtle">
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  active,
  count,
  danger,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  count?: number;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors",
        active
          ? "bg-surface-2 font-medium text-fg"
          : "text-fg-muted hover:bg-surface-2/70 hover:text-fg",
      )}
    >
      {active && (
        <span
          aria-hidden
          className="absolute -left-3 top-2 h-5 w-[3px] rounded-r-full bg-brand"
        />
      )}
      <Icon
        strokeWidth={1.75}
        className={cn(
          "size-4 shrink-0",
          active ? "text-brand" : "text-fg-subtle group-hover:text-fg-muted",
        )}
      />
      <span className="truncate">{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            "ml-auto text-xs tabular-nums",
            danger && count > 0
              ? "rounded-full bg-danger-soft px-1.5 py-0.5 font-medium text-danger-ink"
              : "text-fg-subtle",
          )}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

function UserMenu({ user }: { user: SidebarUser }) {
  const [, startTransition] = useTransition();
  return (
    <DropdownMenu>
      <DropdownTrigger className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-surface-2 data-[state=open]:bg-surface-2">
        <Avatar name={user.name} />
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-medium text-fg">
            {user.name}
          </span>
          <span className="block text-xs capitalize text-fg-subtle">
            {user.role}
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-fg-subtle" />
      </DropdownTrigger>
      <DropdownContent side="top" align="start" className="w-60">
        <DropdownLabel>
          <p className="truncate text-sm font-medium text-fg">{user.name}</p>
          <p className="truncate text-xs text-fg-subtle">{user.email}</p>
        </DropdownLabel>
        <DropdownSeparator />
        <DropdownItem onSelect={() => startTransition(() => logoutAction())}>
          <LogOut className="size-4" />
          Sign out
        </DropdownItem>
      </DropdownContent>
    </DropdownMenu>
  );
}
