"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  useCategories,
  useContactSuggestions,
  useCreateTicket,
  useStaff,
} from "@/hooks/use-tickets";
import { errorMessage } from "@/lib/api-client";
import { TICKET_PRIORITIES } from "@/lib/constants";
import { PRIORITY_META } from "@/lib/ticket-meta";

const formSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  name: z.string().trim().max(100),
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(200),
  body: z.string().trim().min(1, "Describe the issue"),
  priority: z.enum(TICKET_PRIORITIES),
  categoryId: z.string(),
  assigneeId: z.string(),
});
type FormValues = z.infer<typeof formSchema>;

/** Opens whenever the URL has ?new=1, so the top bar button works from every page. */
export function NewTicketDialog() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const open = sp.get("new") === "1";

  const close = () => {
    const next = new URLSearchParams(sp.toString());
    next.delete("new");
    const qs = next.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) close();
      }}
    >
      <DialogContent
        title="New ticket"
        description="Log a request on behalf of a customer."
      >
        <NewTicketForm
          onCancel={close}
          onCreated={(n) => router.push(`/tickets/${n}`)}
        />
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-medium text-fg">{label}</label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-danger-ink">
          {error}
        </p>
      )}
    </div>
  );
}

function NewTicketForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (number: number) => void;
}) {
  const create = useCreateTicket();
  const staff = useStaff();
  const categories = useCategories();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      subject: "",
      body: "",
      priority: "low",
      categoryId: "",
      assigneeId: "",
    },
  });

  const email = useDebouncedValue(watch("email"));
  const contacts = useContactSuggestions(email.trim());

  const onSubmit = (v: FormValues) =>
    create.mutate(
      {
        subject: v.subject,
        body: v.body,
        priority: v.priority,
        categoryId: v.categoryId || null,
        assigneeId: v.assigneeId || null,
        requester: { email: v.email, name: v.name || undefined },
      },
      {
        onSuccess: ({ ticket }) => {
          toast.success(`${ticket.code} created`);
          onCreated(ticket.number);
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Customer email" error={errors.email?.message}>
          <Input
            type="email"
            list="contact-suggestions"
            autoComplete="off"
            placeholder="customer@company.com"
            {...register("email")}
          />
          <datalist id="contact-suggestions">
            {contacts.data?.map((c) => (
              <option key={c.id} value={c.email}>
                {c.name}
              </option>
            ))}
          </datalist>
        </Field>
        <Field label="Name (for new contacts)" error={errors.name?.message}>
          <Input placeholder="Optional" {...register("name")} />
        </Field>
      </div>

      <Field label="Subject" error={errors.subject?.message}>
        <Input placeholder="What is the issue?" {...register("subject")} />
      </Field>

      <Field label="Description" error={errors.body?.message}>
        <Textarea
          rows={5}
          placeholder="What the customer reported, and anything already tried"
          {...register("body")}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Priority">
          <Select {...register("priority")}>
            {TICKET_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_META[p].label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Category">
          <Select {...register("categoryId")}>
            <option value="">None</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Assignee">
          <Select {...register("assigneeId")}>
            <option value="">Unassigned</option>
            {staff.data?.items.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id === staff.data.meId ? `${s.name} (you)` : s.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={create.isPending}>
          {create.isPending && <Loader2 className="size-4 animate-spin" />}
          Create ticket
        </Button>
      </div>
    </form>
  );
}
