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

  function handleClick() {
    // Signed-in users get a proper modal (their progress spans devices, so
    // this is a bigger action than the anonymous, single-device case below).
    if (userId) {
      setModalOpen(true);
      return;
    }
    if (!window.confirm("This will clear all your flashcard and question progress on this device. Continue?")) {
      return;
    }
    resetAllProgress();
    setDone(true);
  }

  async function handleConfirmReset() {
    if (!userId) return;
    setResetting(true);
    await resetCloudProgress(userId);
    resetAllProgress();
    setResetting(false);
    setModalOpen(false);
    setDone(true);
  }

  return (
    <div>
      <button
        onClick={handleClick}
        className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Reset my progress
      </button>
      {done && <p className="mt-2 text-sm text-green-700">Progress reset.</p>}
      <ConfirmModal
        open={modalOpen}
        title="Reset all your progress?"
        body="This will clear all cards marked as known or still learning across all your devices. Your account will not be deleted. This can't be undone."
        confirmLabel={resetting ? "Resetting..." : "Reset progress"}
        confirmDisabled={resetting}
        onConfirm={handleConfirmReset}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}
