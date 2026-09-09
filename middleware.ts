import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth session on every request so sessions persist
// across page loads. This does NOT gate any routes behind login — every page
// remains accessible to anonymous visitors.
export async function middleware(request: NextRequest) {
  let refreshedCookies: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          refreshedCookies = cookiesToSet;
        },
      },
    }
  );

  // Refresh the session if expired - required for Server Components.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Pass the already-verified user id to Server Components via a request
  // header, so pages don't need a second network round trip to Supabase's
  // auth server to re-verify the same request. Set on `request` (not just
  // the response we return) so it overwrites anything a client tried to
  // send under this header name — it can't be spoofed by the caller.
  request.headers.set("x-user-id", user?.id ?? "");

  const response = NextResponse.next({ request });
  refreshedCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
