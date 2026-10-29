import type { TicketPriority, TicketStatus } from "@/lib/constants";
import type { TicketView } from "./ticket-params";

export const STATUS_META: Record<TicketStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-brand-soft text-brand-ink" },
  in_progress: { label: "In progress", className: "border border-brand/40 text-brand-ink" },
  resolved: { label: "Resolved", className: "bg-ok-soft text-ok-ink" },
};

export const PRIORITY_META: Record<TicketPriority, { label: string; badge: string; dot: string }> = {
  urgent: { label: "Urgent", badge: "bg-danger-soft text-danger-ink", dot: "bg-danger" },
  high: { label: "High", badge: "bg-warn-soft text-warn-ink", dot: "bg-warn" },
  low: { label: "Low", badge: "bg-surface-2 text-fg-muted", dot: "bg-fg-subtle" },
};

export const VIEWS: { value: TicketView; tab: string; title: string; emptyTitle: string; emptyBody: string }[] = [
  { value: "inbox", tab: "Inbox", title: "Inbox", emptyTitle: "Inbox is clear", emptyBody: "No open tickets. New ones appear here as they arrive." },
  { value: "mine", tab: "Mine", title: "Assigned to me", emptyTitle: "Nothing assigned to you", emptyBody: "Tickets you take on will show up here." },
  { value: "unassigned", tab: "Unassigned", title: "Unassigned", emptyTitle: "Everything has an owner", emptyBody: "Tickets without an assignee will land here." },
  { value: "urgent", tab: "Urgent", title: "Urgent", emptyTitle: "No urgent tickets", emptyBody: "Urgent tickets that need attention will show up here." },
  { value: "resolved", tab: "Resolved", title: "Resolved", emptyTitle: "No resolved tickets yet", emptyBody: "Resolved tickets will be listed here." },
  { value: "all", tab: "All", title: "All tickets", emptyTitle: "No tickets yet", emptyBody: "Create the first one with New ticket." },
];