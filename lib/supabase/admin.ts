import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Admin client using the service_role key. Server-only - this bypasses Row
// Level Security entirely, so it must never be imported from a Client
// Component or otherwise reach the browser. Only used for
// supabase.auth.admin.deleteUser(), which the anon/authenticated keys can't
// do. See docs/service-role-key-setup.md.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY - see docs/service-role-key-setup.md"
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
