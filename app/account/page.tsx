import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ResetProgressButton from "@/components/ResetProgressButton";
import DeleteAccountSection from "@/components/DeleteAccountSection";
import UsernameSection from "@/components/UsernameSection";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, username_updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="py-16">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">
        Your account
      </h1>
      <p className="mt-2 text-slate-600">{user.email}</p>

      {profile && (
        <div className="mt-10 border-t border-slate-200 pt-6">
          <UsernameSection initialUsername={profile.username} usernameUpdatedAt={profile.username_updated_at} />
        </div>
      )}

      <div className="mt-10 border-t border-slate-200 pt-6">
        <h2 className="text-base font-semibold text-slate-900">Your study progress</h2>
        <p className="mt-1 text-sm text-slate-500">
          Resets which flashcards and questions you&rsquo;ve marked known or correct, across every
          device where you&rsquo;re signed in. Streaks, badges and lifetime totals are kept
          &mdash; but My Progress coverage and strength figures are based on these marks, so
          they&rsquo;ll reset too.
        </p>
        <div className="mt-3">
          <ResetProgressButton />
        </div>
      </div>

      <div className="mt-10 border-t border-slate-200 pt-6">
        <DeleteAccountSection />
      </div>
    </div>
  );
}
