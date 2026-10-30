"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch, ApiRequestError, errorMessage } from "@/lib/api-client";
import type { ListParams } from "@/lib/ticket-params";
import type { UpdateTicketInput } from "@/lib/validations/ticket";
import type {
  CategoryOption,
  MessageItem,
  StaffMember,
  TicketDetailData,
  TicketItem,
  TicketPage,
} from "@/types";

export const ticketKeys = {
  lists: ["tickets", "list"] as const,
  list: (p: ListParams) => ["tickets", "list", p] as const,
  detail: (n: number) => ["tickets", "detail", n] as const,
};

function listUrl(p: ListParams, page: number) {
  const sp = new URLSearchParams({
    view: p.view,
    sort: p.sort,
    page: String(page),
    limit: "20",
  });
  if (p.q) sp.set("q", p.q);
  if (p.priority) sp.set("priority", p.priority);
  if (p.category) sp.set("category", p.category);
  return `/api/tickets?${sp}`;
}

export function useTicketList(params: ListParams) {
  return useInfiniteQuery({
    queryKey: ticketKeys.list(params),
    queryFn: ({ pageParam }) =>
      apiFetch<TicketPage>(listUrl(params, pageParam)),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  });
}

export function useTicket(number: number) {
  return useQuery({
    queryKey: ticketKeys.detail(number),
    queryFn: () => apiFetch<TicketDetailData>(`/api/tickets/${number}`),
    refetchInterval: 15_000,
    retry: (count, err) =>
      !(err instanceof ApiRequestError && err.status === 404) && count < 1,
  });
}

// ---------- lookups ----------

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () =>
      (await apiFetch<{ items: CategoryOption[] }>("/api/categories")).items,
    staleTime: 5 * 60_000,
  });
}

export function useStaff() {
  return useQuery({
    queryKey: ["staff"],
    queryFn: () =>
      apiFetch<{ items: StaffMember[]; meId: string }>(
        "/api/users?role=staff&limit=50",
      ),
    staleTime: 5 * 60_000,
  });
}

export function useContactSuggestions(q: string) {
  return useQuery({
    queryKey: ["contacts", q],
    queryFn: async () =>
      (
        await apiFetch<{ items: StaffMember[] }>(
          `/api/users?role=customer&limit=8&q=${encodeURIComponent(q)}`,
        )
      ).items,
    enabled: q.length >= 2,
    staleTime: 60_000,
  });
}

// ---------- mutations ----------

type PatchVars = { patch: UpdateTicketInput; optimistic: Partial<TicketItem> };

/** Optimistic: the UI updates instantly and rolls back if the server says no. */
export function useUpdateTicket(number: number) {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ patch }: PatchVars) =>
      apiFetch<{ ticket: TicketItem }>(`/api/tickets/${number}`, {
        method: "PATCH",
        body: patch,
      }),

    onMutate: async ({ optimistic }) => {
      await qc.cancelQueries({ queryKey: ["tickets"] });
      const previous = qc.getQueryData<TicketDetailData>(
        ticketKeys.detail(number),
      );

      qc.setQueryData<TicketDetailData>(ticketKeys.detail(number), (d) =>
        d ? { ...d, ticket: { ...d.ticket, ...optimistic } } : d,
      );
      qc.setQueriesData<InfiniteData<TicketPage>>(
        { queryKey: ticketKeys.lists },
        (d) =>
          d && {
            ...d,
            pages: d.pages.map((p) => ({
              ...p,
              items: p.items.map((t) =>
                t.number === number ? { ...t, ...optimistic } : t,
              ),
            })),
          },
      );
      return { previous };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous)
        qc.setQueryData(ticketKeys.detail(number), ctx.previous);
      toast.error(errorMessage(err));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["tickets"] });
      router.refresh(); // refresh sidebar queue counts
    },
  });
}

export function useAddMessage(number: number) {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: {
      body: string;
      isInternal: boolean;
      attachments: string[];
    }) =>
      apiFetch<{ message: MessageItem }>(`/api/tickets/${number}/messages`, {
        method: "POST",
        body: input,
      }),
    onSuccess: ({ message }) => {
      qc.setQueryData<TicketDetailData>(ticketKeys.detail(number), (d) =>
        d && !d.messages.some((m) => m.id === message.id)
          ? { ...d, messages: [...d.messages, message] }
          : d,
      );
    },
    onError: (err) => toast.error(errorMessage(err)),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["tickets"] });
      router.refresh();
    },
  });
}

export type CreateTicketBody = {
  subject: string;
  body: string;
  priority: string;
  categoryId: string | null;
  assigneeId: string | null;
  requester: { email: string; name?: string };
};

export function useCreateTicket() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: CreateTicketBody) =>
      apiFetch<TicketDetailData>("/api/tickets", {
        method: "POST",
        body: input,
      }),
    onSuccess: (data) => {
      qc.setQueryData(ticketKeys.detail(data.ticket.number), data);
      qc.invalidateQueries({ queryKey: ["tickets"] });
      router.refresh();
    },
  });
}
