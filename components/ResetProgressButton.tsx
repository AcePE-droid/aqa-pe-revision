"use client";

import { useState } from "react";
import { resetAllProgress } from "@/lib/progress";

export default function ResetProgressButton() {
  const [done, setDone] = useState(false);

  function handleReset() {
    if (!window.confirm("This will clear all your flashcard and question progress on this device. Continue?")) {
      return;
    }
    resetAllProgress();
    setDone(true);
  }

  return (
    <div>
      <button
        onClick={handleReset}
        className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Reset my progress
      </button>
      {done && <p className="mt-2 text-sm text-green-700">Progress reset.</p>}
    </div>
  );
}
