import { createClient, type User } from "jsr:@supabase/supabase-js@2";

// Verifies the caller's JWT (forwarded from the frontend) and returns the
// authenticated user, or null. Supabase's gateway already rejects requests
// with no/invalid token (verify_jwt defaults to true), but we still need
// the parsed user for downstream logic like rate limiting.
export async function getAuthenticatedUser(req: Request): Promise<User | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}
