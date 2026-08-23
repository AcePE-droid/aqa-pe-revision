import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ResetProgressButton from "@/components/ResetProgressButton";
import DeleteAccountSection from "@/components/DeleteAccountSection";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="py-16">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">
        Your account
      </h1>
      <p className="mt-2 text-slate-600">{user.email}</p>

      <div className="mt-10 border-t border-slate-200 pt-6">
        <h2 className="text-base font-semibold text-slate-900">Reset progress</h2>
        <p className="mt-1 text-sm text-slate-500">
          Clears every card marked as known or still learning, on this device and across every
          device where you&rsquo;re signed in.
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
