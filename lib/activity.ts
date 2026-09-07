// Activity/gamification logging for signed-in users only - anonymous
// visitors don't get events logged (same gating as flashcard cloud sync in
// lib/progress.ts). This is purely additive: it never replaces or blocks
// the existing localStorage/flashcard_progress tracking those flows already
// do, it just also records an event for streaks/scoring/badges. Any error
// here is swallowed (console.warn) so a logging failure never breaks the
// study/question UI.
//
// See supabase/migrations/20260907000000_create_activity_gamification.sql
// for the table/function definitions this calls into.

import { createClient } from "@/lib/supabase/client";

async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id ?? null;
  } catch (err) {
    console.warn("Could not read auth session, skipping activity log:", err);
    return null;
  }
}

export async function logFlashcardActivity(params: {
  subjectSlug: string;
  subtopicId: string;
  flashcardId: string;
  status: "known" | "learning";
  wasKnownBefore: boolean;
  bucketKnownPct: number;
  bucketTotalItems: number;
  subjectTotalItems: number;
}): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const isFirstTransition = !params.wasKnownBefore && params.status === "known";

  const supabase = createClient();
  const { error } = await supabase.rpc("log_activity_event", {
    p_user_id: userId,
    p_content_type: "flashcard",
    p_subject: params.subjectSlug,
    p_bucket: params.subtopicId,
    p_item_id: params.flashcardId,
    p_result: params.status === "known" ? "known" : "still_learning",
    p_is_first_transition: isFirstTransition,
    p_subject_total_items: params.subjectTotalItems,
    p_bucket_total_items: params.bucketTotalItems,
    p_bucket_known_pct: params.bucketKnownPct,
  });
  if (error) console.warn("Failed to log flashcard activity:", error);
}

// Threshold for counting a self-graded written answer as "correct" for
// activity logging - a full-marks requirement would count genuinely solid
// partial answers as failures, so 65% of available marks is used instead.
// Multiple-choice questions use the exact selected-option comparison
// instead of this threshold.
const WRITTEN_CORRECT_THRESHOLD = 0.65;

export async function logQuestionActivity(params: {
  subjectSlug: string;
  subtopicId: string;
  questionId: string;
  marksAwarded: number;
  totalMarks: number;
  isMultipleChoice: boolean;
  selectedOptionCorrect: boolean | null; // null when not multiple-choice / nothing selected
  subjectTotalItems: number;
}): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const correct =
    params.isMultipleChoice && params.selectedOptionCorrect !== null
      ? params.selectedOptionCorrect
      : params.totalMarks > 0 && params.marksAwarded / params.totalMarks >= WRITTEN_CORRECT_THRESHOLD;

  const supabase = createClient();

  const { data: existing, error: readError } = await supabase
    .from("question_progress")
    .select("correct")
    .eq("user_id", userId)
    .eq("question_id", params.questionId)
    .maybeSingle();
  if (readError) console.warn("Failed to read prior question progress:", readError);

  const wasCorrectBefore = existing?.correct ?? false;
  const isFirstTransition = !wasCorrectBefore && correct;

  const { error: upsertError } = await supabase.from("question_progress").upsert({
    user_id: userId,
    question_id: params.questionId,
    correct,
    marks_awarded: params.marksAwarded,
    updated_at: new Date().toISOString(),
  });
  if (upsertError) console.warn("Failed to save cloud question progress:", upsertError);

  const { error } = await supabase.rpc("log_activity_event", {
    p_user_id: userId,
    p_content_type: "question",
    p_subject: params.subjectSlug,
    p_bucket: params.subtopicId,
    p_item_id: params.questionId,
    p_result: correct ? "correct" : "incorrect",
    p_is_first_transition: isFirstTransition,
    p_subject_total_items: params.subjectTotalItems,
    p_bucket_total_items: null,
    p_bucket_known_pct: null,
  });
  if (error) console.warn("Failed to log question activity:", error);
}
