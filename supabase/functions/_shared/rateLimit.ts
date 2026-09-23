import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

// Atomically checks + increments today's usage count for a feature via the
// increment_usage() Postgres function, so concurrent requests can't race
// past the daily limit.
export async function checkRateLimit(
  admin: SupabaseClient,
  userId: string,
  feature: string,
  dailyLimit: number,
): Promise<{ allowed: boolean; count: number }> {
  const { data, error } = await admin
    .rpc("increment_usage", {
      p_user_id: userId,
      p_feature: feature,
      p_daily_limit: dailyLimit,
    })
    .single<{ allowed: boolean; current_count: number }>();

  if (error || !data) {
    console.error("rateLimit: rpc failed", error);
    // Fail open — an internal error here shouldn't block a farmer's request.
    return { allowed: true, count: 0 };
  }

  return { allowed: data.allowed, count: data.current_count };
}
