"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Inbox,
  SearchX,
  SlidersHorizontal,
  X,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { TICKET_PRIORITIES } from "@/lib/constants";
import { PRIORITY_META, VIEWS } from "@/lib/ticket-meta";
import { listQs, parseListParams, type SortKey } from "@/lib/ticket-params";
import { cn } from "@/lib/utils";
import { useCategories, useTicketList } from "@/hooks/use-tickets";
import { ListSkeleton } from "./skeletons";
import { TicketRow } from "./ticket-row";

export function TicketListPane() {
  const router = useRouter();
  const params = parseListParams(useSearchParams());
  const selected = Number(useParams<{ number?: string }>().number) || null;
  const base = selected ? `/tickets/${selected}` : "/tickets";

  const query = useTicketList(params);
  const categories = useCategories();
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  const total = query.data?.pages.at(-1)?.total ?? 0;
  const view = VIEWS.find((v) => v.value === params.view)!;
  const hasFilters = Boolean(params.q || params.priority || params.category);

  const go = (patch: Partial<typeof params>) =>
    router.replace(`${base}${listQs(params, patch)}`, { scroll: false });

  // ---- debounced search, kept in sync with the URL (the top bar search writes ?q= too) ----
  const [text, setText] = useState(params.q);
  const lastPushed = useRef(params.q);
  useEffect(() => {
    if (params.q !== lastPushed.current) {
      lastPushed.current = params.q;
      setText(params.q);
    }
  }, [params.q]);

  const target = `${base}${listQs(params, { q: text.trim() })}`;
  const current = `${base}${listQs(params)}`;
  useEffect(() => {
    if (target === current) return;
    const t = setTimeout(() => {
      lastPushed.current = text.trim();
      router.replace(target, { scroll: false });
    }, 300);
    return () => clearTimeout(t);
  }, [target, current, text, router]);

  const [showFilters, setShowFilters] = useState(
    Boolean(params.priority || params.category || params.sort !== "activity"),
  );
  const activeFilters = [
    params.priority,
    params.category,
    params.sort !== "activity" ? "sort" : "",
  ].filter(Boolean).length;

  return (
    <>
      {/* Header */}
      <div className="shrink-0 border-b border-line">
        <div className="flex items-baseline justify-between px-4 pb-2 pt-4">
          <h2 className="text-[15px] font-semibold text-fg">{view.title}</h2>
          <span
            aria-live="polite"
            className="text-xs tabular-nums text-fg-subtle"
          >
            {query.data ? `${total} ${total === 1 ? "ticket" : "tickets"}` : ""}
          </span>
        </div>

        <nav
          aria-label="Ticket views"
          className="flex gap-1 overflow-x-auto px-3 pb-2"
        >
          {VIEWS.map((v) => (
            <Link
              key={v.value}
              href={`${base}${listQs(params, { view: v.value })}`}
              aria-current={v.value === params.view ? "page" : undefined}
              className={cn(
                "h-8 shrink-0 rounded-lg px-3 text-[13px] font-medium leading-8 transition-colors",
                v.value === params.view
                  ? "bg-brand-soft text-brand-ink"
                  : "text-fg-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              {v.tab}
            </Link>
          ))}
        </nav>

        <div className="flex gap-2 px-3 pb-3">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-label="Search in this list"
              placeholder="Subject, ticket number, or person"
              className="h-9 w-full rounded-lg border border-line-strong bg-surface pl-9 pr-8 text-sm text-fg placeholder:text-fg-subtle focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
            />
            {text && (
              <button
                onClick={() => setText("")}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-fg-subtle hover:bg-surface-2 hover:text-fg"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Filters"
            aria-expanded={showFilters}
            onClick={() => setShowFilters((s) => !s)}
            className="relative"
          >
            <SlidersHorizontal className="size-4" />
            {activeFilters > 0 && (
              <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-brand text-[10px] font-semibold text-on-brand">
                {activeFilters}
              </span>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 px-3 pb-3">
            <div className="min-w-28 flex-1">
              <Select
                aria-label="Priority"
                className="text-[13px]"
                value={params.priority}
                onChange={(e) => go({ priority: e.target.value })}
              >
                <option value="">All priorities</option>
                {TICKET_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_META[p].label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="min-w-28 flex-1">
              <Select
                aria-label="Category"
                className="text-[13px]"
                value={params.category}
                onChange={(e) => go({ category: e.target.value })}
              >
                <option value="">All categories</option>
                {categories.data?.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="min-w-28 flex-1">
              <Select
                aria-label="Sort"
                className="text-[13px]"
                value={params.sort}
                onChange={(e) => go({ sort: e.target.value as SortKey })}
              >
                <option value="activity">Latest activity</option>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {query.isPending ? (
          <ListSkeleton />
        ) : query.isError ? (
          <EmptyState
            icon={AlertCircle}
            title="Could not load tickets"
            body="Check your connection and try again."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => query.refetch()}
              >
                Try again
              </Button>
            }
          />
        ) : items.length === 0 ? (
          hasFilters ? (
            <EmptyState
              icon={SearchX}
              title="No tickets match"
              body={
                params.q
                  ? `Nothing found for “${params.q}”. Try other words or clear the filters.`
                  : "Try clearing the filters."
              }
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setText("");
                    router.replace(
                      `${base}${listQs({ ...params, q: "", priority: "", category: "", sort: "activity" })}`,
                      { scroll: false },
                    );
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Inbox}
              title={view.emptyTitle}
              body={view.emptyBody}
            />
          )
        ) : (
          <>
            <ul
              className={cn(
                "transition-opacity",
                query.isPlaceholderData && "opacity-60",
              )}
            >
              {items.map((t) => (
                <TicketRow
                  key={t.id}
                  ticket={t}
                  href={`/tickets/${t.number}${listQs(params)}`}
                  active={t.number === selected}
                />
              ))}
            </ul>
            {query.hasNextPage && (
              <div className="p-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  disabled={query.isFetchingNextPage}
                  onClick={() => query.fetchNextPage()}
                >
                  {query.isFetchingNextPage ? "Loading…" : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
