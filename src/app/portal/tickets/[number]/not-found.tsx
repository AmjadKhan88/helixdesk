import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="rounded-xl border border-line bg-surface py-6">
      <EmptyState
        icon={SearchX}
        title="Request not found"
        body="It may not exist, or it belongs to a different account."
        action={
          <Link
            href="/portal"
            className={buttonStyles({ variant: "secondary" })}
          >
            Back to your requests
          </Link>
        }
      />
    </div>
  );
}
