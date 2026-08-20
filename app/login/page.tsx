"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CARD_BASE_CLASSES } from "@/lib/styles";

const ERROR_MESSAGES: Record<string, string> = {
  auth: "Something went wrong signing you in. Please try again.",
};

function LoginError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  if (!error) return null;

  return (
    <p className="mt-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {ERROR_MESSAGES[error] ?? "Something went wrong signing you in. Please try again."}
    </p>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSending(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setSending(false);
    if (error) {
      setFormError("Something went wrong sending the link. Please try again.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="py-16">
      <div className={`mx-auto max-w-[420px] ${CARD_BASE_CLASSES}`}>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-slate-900">
          Log in or create an account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to sync your revision progress across devices.
        </p>

        <Suspense fallback={null}>
          <LoginError />
        </Suspense>

        <button
          onClick={handleGoogleSignIn}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {sent ? (
          <p className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            Check your email &mdash; we&apos;ve sent you a link to sign in.
          </p>
        ) : (
          <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send magic link"}
            </button>
            {formError && <p className="text-sm text-red-700">{formError}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
