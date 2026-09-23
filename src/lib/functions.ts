import { createClient } from "@/lib/supabase/server";

export type EdgeFunctionResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

// Calls a Supabase Edge Function with the current user's JWT attached, so
// the function can verify the caller and (later) apply per-user rate
// limits. Server-side only.
export async function callEdgeFunction<T>(
  functionName: string,
  searchParams: Record<string, string | undefined> = {},
): Promise<EdgeFunctionResult<T>> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { data: null, error: "unauthorized" };
  }

  const url = new URL(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${functionName}`);
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) url.searchParams.set(key, value);
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
  } catch {
    return { data: null, error: "network_error" };
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { data: null, error: (body?.error as string) ?? "request_failed" };
  }

  const data = (await response.json()) as T;
  return { data, error: null };
}
