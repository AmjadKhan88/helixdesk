import { TICKET_PRIORITIES } from "@/lib/constants";
import { TICKET_VIEWS } from "@/lib/validations/ticket";

export type TicketView = (typeof TICKET_VIEWS)[number];
export type SortKey = "activity" | "newest" | "oldest";
export type ListParams = { view: TicketView; q: string; priority: string; category: string; sort: SortKey };

export function parseListParams(sp: { get(key: string): string | null }): ListParams {
  const view = sp.get("view") ?? "";
  const priority = sp.get("priority") ?? "";
  const sort = sp.get("sort");
  return {
    view: (TICKET_VIEWS as readonly string[]).includes(view) ? (view as TicketView) : "inbox",
    q: sp.get("q") ?? "",
    priority: (TICKET_PRIORITIES as readonly string[]).includes(priority) ? priority : "",
    category: sp.get("category") ?? "",
    sort: sort === "newest" || sort === "oldest" ? sort : "activity",
  };
}

/** "?view=urgent&q=…" with defaults omitted, or "" */
export function listQs(p: ListParams, patch: Partial<ListParams> = {}) {
  const n = { ...p, ...patch };
  const qs = new URLSearchParams();
  if (n.view !== "inbox") qs.set("view", n.view);
  if (n.q) qs.set("q", n.q);
  if (n.priority) qs.set("priority", n.priority);
  if (n.category) qs.set("category", n.category);
  if (n.sort !== "activity") qs.set("sort", n.sort);
  const s = qs.toString();
  return s ? `?${s}` : "";
}