import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewRequestForm } from "@/components/portal/new-request-form";
import { PageHeader } from "@/components/ui/page-header";
import { getCategoryOptions } from "@/lib/queries/categories";
import { requirePageUser } from "@/lib/session";

export const metadata = { title: "New request" };

export default async function NewRequestPage() {
  await requirePageUser("customer");
  const categories = await getCategoryOptions();

  return (
    <>
      <Link
        href="/portal"
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" />
        All requests
      </Link>
      <PageHeader
        title="New request"
        description="Tell us what is going on. We will reply here, in this conversation."
      />
      <NewRequestForm categories={categories} />
    </>
  );
}
