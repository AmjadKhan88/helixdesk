"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, errorMessage } from "@/lib/api-client";
import type { CategoryRow } from "@/lib/queries/admin";

type Mode =
  | { kind: "create" }
  | { kind: "edit"; cat: CategoryRow }
  | { kind: "delete"; cat: CategoryRow }
  | null;

export function CategoriesManager({
  categories,
}: {
  categories: CategoryRow[];
}) {
  const [mode, setMode] = useState<Mode>(null);
  const router = useRouter();
  const qc = useQueryClient();

  const done = (message: string) => {
    setMode(null);
    toast.success(message);
    qc.invalidateQueries({ queryKey: ["categories"] }); // pickers and filters elsewhere update too
    qc.invalidateQueries({ queryKey: ["tickets"] });
    router.refresh();
  };

  const form = mode?.kind === "create" || mode?.kind === "edit" ? mode : null;
  const removing = mode?.kind === "delete" ? mode.cat : null;

  return (
    <>
      <PageHeader
        title="Categories"
        description="Group tickets by topic so they are easy to find and filter."
        actions={
          <Button onClick={() => setMode({ kind: "create" })}>
            <Plus className="size-4" />
            New category
          </Button>
        }
      />

      {categories.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface py-6">
          <EmptyState
            icon={Tags}
            title="No categories yet"
            body="Create the first one to start organizing tickets."
          />
        </div>
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-4 px-4 py-3.5 sm:px-5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg">{c.name}</p>
                <p className="truncate text-[13px] text-fg-muted">
                  {c.description || (
                    <span className="text-fg-subtle">No description</span>
                  )}
                </p>
              </div>
              <div className="shrink-0 text-right text-[13px] tabular-nums">
                <p className="text-fg">
                  {c.total} {c.total === 1 ? "ticket" : "tickets"}
                </p>
                <p className={c.active ? "text-brand-ink" : "text-fg-subtle"}>
                  {c.active} active
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${c.name}`}
                  onClick={() => setMode({ kind: "edit", cat: c })}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${c.name}`}
                  onClick={() => setMode({ kind: "delete", cat: c })}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={!!form} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent
          title={form?.kind === "edit" ? "Edit category" : "New category"}
          className="max-w-md"
        >
          {form && (
            <CategoryForm
              key={form.kind === "edit" ? form.cat.id : "new"}
              cat={form.kind === "edit" ? form.cat : undefined}
              onCancel={() => setMode(null)}
              onDone={done}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!removing} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent title="Delete category" className="max-w-md">
          {removing && (
            <DeleteForm
              cat={removing}
              others={categories.filter((c) => c.id !== removing.id)}
              onCancel={() => setMode(null)}
              onDone={done}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function CategoryForm({
  cat,
  onDone,
  onCancel,
}: {
  cat?: CategoryRow;
  onDone: (m: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(cat?.name ?? "");
  const [description, setDescription] = useState(cat?.description ?? "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      await apiFetch(cat ? `/api/categories/${cat.id}` : "/api/categories", {
        method: cat ? "PATCH" : "POST",
        body: { name, description },
      });
      onDone(cat ? "Category updated" : "Category created");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="cat-name" className="text-[13px] font-medium text-fg">
          Name
        </label>
        <Input
          id="cat-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          maxLength={40}
          required
        />
        {cat && (
          <p className="text-xs text-fg-subtle">
            Renaming also changes the category link used in filters.
          </p>
        )}
      </div>
      <div className="space-y-1.5">
        <label htmlFor="cat-desc" className="text-[13px] font-medium text-fg">
          Description{" "}
          <span className="font-normal text-fg-subtle">(optional)</span>
        </label>
        <Textarea
          id="cat-desc"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
        />
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-danger-soft px-3 py-2 text-[13px] font-medium text-danger-ink"
        >
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending || name.trim().length < 2}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {cat ? "Save changes" : "Create category"}
        </Button>
      </div>
    </form>
  );
}

function DeleteForm({
  cat,
  others,
  onDone,
  onCancel,
}: {
  cat: CategoryRow;
  others: CategoryRow[];
  onDone: (m: string) => void;
  onCancel: () => void;
}) {
  const [reassign, setReassign] = useState("none");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function remove() {
    setPending(true);
    setError("");
    try {
      const qs = cat.total > 0 ? `?reassignTo=${reassign}` : "";
      await apiFetch(`/api/categories/${cat.id}${qs}`, { method: "DELETE" });
      onDone(
        cat.total > 0
          ? `Category deleted, ${cat.total} ticket${cat.total === 1 ? "" : "s"} moved`
          : "Category deleted",
      );
    } catch (err) {
      setError(errorMessage(err));
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      {cat.total === 0 ? (
        <p className="text-sm text-fg-muted">
          Delete <span className="font-medium text-fg">{cat.name}</span>? No
          tickets use it. This cannot be undone.
        </p>
      ) : (
        <>
          <p className="text-sm text-fg-muted">
            <span className="font-medium text-fg">
              {cat.total} {cat.total === 1 ? "ticket uses" : "tickets use"}
            </span>{" "}
            {cat.name}
            {cat.active > 0 && <>, {cat.active} still active</>}. Choose where
            they should go.
          </p>
          <div className="space-y-1.5">
            <label
              htmlFor="reassign"
              className="text-[13px] font-medium text-fg"
            >
              Move tickets to
            </label>
            <Select
              id="reassign"
              value={reassign}
              onChange={(e) => setReassign(e.target.value)}
            >
              <option value="none">No category</option>
              {others.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Select>
          </div>
        </>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-danger-soft px-3 py-2 text-[13px] font-medium text-danger-ink"
        >
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={remove} disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Delete category
        </Button>
      </div>
    </div>
  );
}
