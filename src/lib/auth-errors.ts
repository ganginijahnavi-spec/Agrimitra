// Maps raw Supabase Auth error messages to a key under the "Auth.errors"
// messages namespace, so the UI never shows a raw provider error string.
export function mapAuthErrorToKey(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) return "invalidCredentials";
  if (normalized.includes("email not confirmed")) return "emailNotConfirmed";
  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return "emailInUse";
  }
  if (normalized.includes("password") && normalized.includes("6 characters")) {
    return "weakPassword";
  }

  return "generic";
}
