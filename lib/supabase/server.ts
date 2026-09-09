import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

// Supabase client for use in Server Components, Route Handlers, and Server
// Actions. Reads/writes the auth session via Next.js's cookie store.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll was called from a Server Component. This can be ignored
            // if middleware is refreshing sessions (see middleware.ts).
          }
        },
      },
    }
  );
}

// Reads the user id that middleware.ts already verified via a network call
// to Supabase's auth server for this same request, avoiding a second
// getUser() round trip in the page itself. Only safe to use where nothing
// beyond the id (e.g. email) is needed - see middleware.ts for how the
// header is set and why it can't be spoofed by the client.
export async function getVerifiedUserId(): Promise<string | null> {
  const headerStore = await headers();
  const id = headerStore.get("x-user-id");
  return id && id.length > 0 ? id : null;
}
