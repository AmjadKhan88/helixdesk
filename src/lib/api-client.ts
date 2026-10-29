export class ApiRequestError extends Error {
  constructor(
    public status: number,
    message: string,
    public issues?: { path: string; message: string }[]
  ) {
    super(message);
  }
}

export async function apiFetch<T>(url: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const hasBody = init?.body !== undefined;
  const res = await fetch(url, {
    method: init?.method,
    headers: hasBody ? { "Content-Type": "application/json" } : undefined,
    body: hasBody ? JSON.stringify(init!.body) : undefined,
  });
  const data = await res.json().catch(() => null);

  if (res.status === 401 && typeof window !== "undefined") {
    // Session expired: go sign in again and come back here
    window.location.href = `/login?callbackUrl=${encodeURIComponent(location.pathname + location.search)}`;
  }
  if (!res.ok) throw new ApiRequestError(res.status, data?.error ?? "Request failed", data?.issues);
  return data as T;
}

export function errorMessage(err: unknown) {
  if (err instanceof ApiRequestError) return err.issues?.[0]?.message ?? err.message;
  return "Something went wrong. Please try again.";
}