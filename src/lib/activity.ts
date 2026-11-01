import { PRIORITY_META, STATUS_META } from "@/lib/ticket-meta";
import type { ActivityItem } from "@/types";

const status = (v: string | null) =>
  v && v in STATUS_META
    ? STATUS_META[v as keyof typeof STATUS_META].label
    : (v ?? "none");
const priority = (v: string | null) =>
  v && v in PRIORITY_META
    ? PRIORITY_META[v as keyof typeof PRIORITY_META].label
    : (v ?? "none");

/** The sentence after the person's name, e.g. "assigned this ticket to themselves" */
export function describeActivity(a: ActivityItem): string {
  switch (a.type) {
    case "created":
      return "opened this ticket";
    case "status":
      if (a.from === "resolved" && a.to === "open")
        return "reopened this ticket";
      if (a.to === "resolved") return "marked this ticket as resolved";
      return `changed status from ${status(a.from)} to ${status(a.to)}`;
    case "priority":
      return `changed priority from ${priority(a.from)} to ${priority(a.to)}`;
    case "assignee":
      if (!a.to)
        return a.fromLabel
          ? `unassigned this ticket (was ${a.fromLabel})`
          : "unassigned this ticket";
      if (a.to === a.actor?.id) return "assigned this ticket to themselves";
      return `assigned this ticket to ${a.toLabel ?? "someone"}`;
    case "category":
      if (!a.to)
        return a.fromLabel
          ? `removed the category (was ${a.fromLabel})`
          : "removed the category";
      if (!a.from) return `set the category to ${a.toLabel ?? "a category"}`;
      return `changed category from ${a.fromLabel ?? "none"} to ${a.toLabel ?? "none"}`;
    case "subject":
      return "renamed this ticket";
  }
}
