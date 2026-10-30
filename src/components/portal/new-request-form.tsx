"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, errorMessage } from "@/lib/api-client";

export function NewRequestForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const { ticket } = await apiFetch<{ ticket: { number: number } }>(
        "/api/tickets",
        {
          method: "POST",
          body: { subject, body, categoryId: categoryId || null },
        },
      );
      toast.success("Request sent");
      router.push(`/portal/tickets/${ticket.number}`);
    } catch (err) {
      setError(errorMessage(err));
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-xl border border-line bg-surface p-5 sm:p-6"
    >
      <div className="space-y-1.5">
        <label htmlFor="subject" className="text-[13px] font-medium text-fg">
          Subject
        </label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="A short summary of the problem"
          minLength={3}
          maxLength={200}
          required
          autoFocus
        />
      </div>

      {categories.length > 0 && (
        <div className="space-y-1.5">
          <label htmlFor="topic" className="text-[13px] font-medium text-fg">
            What is it about?{" "}
            <span className="font-normal text-fg-subtle">(optional)</span>
          </label>
          <Select
            id="topic"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Not sure</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="body" className="text-[13px] font-medium text-fg">
          Details
        </label>
        <Textarea
          id="body"
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What happened, what you expected, and anything you already tried"
          maxLength={10000}
          required
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

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={pending || subject.trim().length < 3 || !body.trim()}
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          Send request
        </Button>
      </div>
    </form>
  );
}
