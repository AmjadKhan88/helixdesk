import { auth } from "@/auth";
import { logoutAction } from "@/lib/actions/auth";

export default async function PortalPage() {
  const session = await auth();
  return (
    <div className="p-8">
      <h1 className="text-lg font-bold text-slate-900">Customer portal</h1>
      <p className="mt-1 text-sm text-slate-500">
        Signed in as {session?.user.email}
      </p>
      <form action={logoutAction} className="mt-4">
        <button className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white">
          Sign out
        </button>
      </form>
    </div>
  );
}
