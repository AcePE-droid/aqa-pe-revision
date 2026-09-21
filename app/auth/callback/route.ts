import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * The one-time email token types this route will verify.
 *
 * Supabase's own `EmailOtpType` widens to `string`, so it constrains nothing
 * at compile time and the `type` in the URL has to be checked at runtime.
 * "recovery" is left out deliberately: the site has no password to reset, so
 * a link claiming that type is not one this app ever sends.
 */
const EMAIL_OTP_TYPES = ["email", "magiclink", "signup", "invite", "email_change"] as const;
type EmailOtpType = (typeof EMAIL_OTP_TYPES)[number];

function parseOtpType(value: string | null): EmailOtpType | null {
  return EMAIL_OTP_TYPES.includes(value as EmailOtpType) ? (value as EmailOtpType) : null;
}

/** An expired or already-used link is the one failure worth its own message. */
function isExpired(code: string | undefined, message: string): boolean {
  return code === "otp_expired" || /expired|already been used/i.test(message);
}

function fail(origin: string, reason: string, expired = false): NextResponse {
  // The student only ever sees the generic flag, but the real reason belongs
  // in the server log - without it a failure here is indistinguishable from
  // any other, which is exactly the hole this route used to have.
  console.error(`[auth/callback] ${reason}`);
  return NextResponse.redirect(`${origin}/login?error=${expired ? "expired" : "auth"}`);
}

/**
 * Completes both sign-in flows.
 *
 * Google OAuth uses PKCE: the verifier is in a cookie set by the browser that
 * began the sign-in, and the same browser finishes it here, so the cookie is
 * present.
 *
 * Magic links cannot rely on that. The link is opened from a mail client,
 * which is routinely a different browser - or a different device - from the
 * one that requested it, and the verifier does not travel. Those are verified
 * from the token in the URL instead, which carries no browser-bound state.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  // Supabase reports its own failures - an expired link, a consumed one - by
  // redirecting here with these rather than with anything to verify.
  const providerError = searchParams.get("error_description") ?? searchParams.get("error");
  if (providerError) {
    const expired = isExpired(searchParams.get("error_code") ?? undefined, providerError);
    return fail(origin, `provider returned: ${providerError}`, expired);
  }

  const supabase = await createClient();

  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/`);
    return fail(origin, `exchangeCodeForSession: ${error.message}`, isExpired(error.code, error.message));
  }

  const tokenHash = searchParams.get("token_hash");
  const type = parseOtpType(searchParams.get("type"));
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}/`);
    return fail(origin, `verifyOtp (${type}): ${error.message}`, isExpired(error.code, error.message));
  }

  return fail(
    origin,
    tokenHash
      ? `token_hash present but type is missing or not allowed: ${searchParams.get("type")}`
      : "callback hit with neither a code nor a token_hash"
  );
}
