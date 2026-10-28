import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-base font-extrabold text-white shadow-sm">
            H
          </div>
          <div className="leading-tight">
            <p className="text-base font-bold text-slate-900">HelixDesk</p>
            <p className="text-[11px] font-medium text-slate-400">
              Support Desk
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            Sign in
          </h1>
          <p className="mb-5 mt-1 text-sm text-slate-500">
            Welcome back. Enter your details to continue.
          </p>
          <LoginForm callbackUrl={callbackUrl} />
        </div>

        {process.env.NODE_ENV === "development" && (
          <p className="mt-4 text-center text-[11px] text-slate-400">
            Dev seed: amara@helixdesk.dev / admin1234 · leo@helixdesk.dev /
            agent1234
          </p>
        )}
      </div>
    </main>
  );
}
