"use client";

import { useState } from "react";
import { resetAllProgress, resetCloudProgress } from "@/lib/progress";
import { useAuthUserId } from "@/lib/supabase/useAuthUserId";
import ConfirmModal from "@/components/ConfirmModal";

export default function ResetProgressButton() {
  const [done, setDone] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const userId = useAuthUserId();

  async function handleConfirmReset() {
    // Signed-in progress is synced, so it has to be cleared server-side too;
    // anonymous progress only ever exists in this browser.
    if (userId) {
      setResetting(true);
      await resetCloudProgress(userId);
    }
    resetAllProgress();
    setResetting(false);
    setModalOpen(false);
    setDone(true);
  }

  return (
    <div>
      <button
        onClick={() => setModalOpen(true)}
        className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Reset flashcard &amp; question progress
      </button>
      {done && <p className="mt-2 text-sm text-green-700">Progress reset.</p>}
      <ConfirmModal
        open={modalOpen}
        title="Reset flashcard & question progress?"
        body={`Clears every flashcard and question marked known or correct${
          userId ? ", on all your devices" : ", on this device"
        }. Streaks, badges and lifetime totals aren't affected. This can't be undone.`}
        confirmLabel={resetting ? "Resetting..." : "Reset progress"}
        confirmDisabled={resetting}
        onConfirm={handleConfirmReset}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}
