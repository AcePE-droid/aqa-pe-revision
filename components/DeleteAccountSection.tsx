"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { resetAllProgress } from "@/lib/progress";
import ConfirmModal from "@/components/ConfirmModal";

export default function DeleteAccountSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch("/api/delete-account", { method: "POST" });
      if (!res.ok) throw new Error("Delete request failed");

      const supabase = createClient();
      await supabase.auth.signOut();
      resetAllProgress();
      router.push("/?deleted=1");
    } catch (err) {
      console.warn("Failed to delete account:", err);
      setError("Something went wrong deleting your account. Please try again.");
      setDeleting(false);
      setModalOpen(false);
    }
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900">Delete your account</h2>
      <p className="mt-1 text-sm text-slate-600">
        Deleting your account permanently removes your email, your synced progress, and any other
        data linked to your account. This can&rsquo;t be undone. Anonymous progress saved on this
        device will not be affected.
      </p>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <button
        onClick={() => setModalOpen(true)}
        className="mt-3 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
      >
        Delete my account
      </button>
      <ConfirmModal
        open={modalOpen}
        title="Delete your account?"
        body="Deleting your account permanently removes your email, your synced progress, and any other data linked to your account. This can't be undone."
        confirmLabel={deleting ? "Deleting..." : "Delete permanently"}
        confirmDisabled={deleting}
        onConfirm={handleDelete}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}
