// Progress tracking. Anonymous visitors are backed entirely by localStorage;
// signed-in users are synced to Supabase (`flashcard_progress` table). Callers
// don't need to know which backend is in play - these functions check auth
// state internally and route accordingly.
//
// Only flashcard known/learning status syncs to the cloud. Question-attempt
// flags, the "celebrated" flag, and "last learning" card IDs stay
// localStorage-only for everyone (including signed-in users) - see the
// bottom of this file.

import { createClient } from "@/lib/supabase/client";

export type FlashcardStatus = "unseen" | "learning" | "known";

const STORAGE_PREFIX = "pe-revision:";

function flashcardKey(subtopicId: string) {
  return `${STORAGE_PREFIX}flashcards:${subtopicId}`;
}

function questionKey(subtopicId: string) {
  return `${STORAGE_PREFIX}questions:${subtopicId}`;
}

function celebratedKey(subtopicId: string) {
  return `${STORAGE_PREFIX}flashcards-celebrated:${subtopicId}`;
}

function lastLearningKey(subtopicId: string) {
  return `${STORAGE_PREFIX}flashcards-last-learning:${subtopicId}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

// --- Flashcard progress (synced for signed-in users) -----------------------

async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id ?? null;
  } catch (err) {
    console.warn("Could not read auth session, falling back to local progress:", err);
    return null;
  }
}

function getLocalFlashcardProgress(subtopicId: string): Record<string, FlashcardStatus> {
  return readJson(flashcardKey(subtopicId), {});
}

function setLocalFlashcardStatus(subtopicId: string, flashcardId: string, status: FlashcardStatus) {
  const progress = getLocalFlashcardProgress(subtopicId);
  progress[flashcardId] = status;
  writeJson(flashcardKey(subtopicId), progress);
}

/**
 * Progress for every flashcard in `flashcardIds`, scoped to `subtopicId`
 * for the local (anonymous) fallback. `flashcardIds` is required so that
 * the cloud path - where rows have no subtopic column - can be scoped to
 * exactly the right cards (needed for correct per-subtopic/per-topic
 * aggregation, e.g. in TopicCard).
 */
export async function getSubtopicProgress(
  subtopicId: string,
  flashcardIds: string[]
): Promise<Record<string, FlashcardStatus>> {
  const userId = await getCurrentUserId();
  if (!userId) return getLocalFlashcardProgress(subtopicId);
  if (flashcardIds.length === 0) return {};

  const supabase = createClient();
  const { data, error } = await supabase
    .from("flashcard_progress")
    .select("flashcard_id, status")
    .eq("user_id", userId)
    .in("flashcard_id", flashcardIds);

  if (error) {
    console.warn("Failed to read flashcard progress from Supabase:", error);
    return {};
  }

  const progress: Record<string, FlashcardStatus> = {};
  for (const row of data ?? []) {
    progress[row.flashcard_id] = row.status as FlashcardStatus;
  }
  return progress;
}

export async function getCardStatus(subtopicId: string, flashcardId: string): Promise<FlashcardStatus> {
  const progress = await getSubtopicProgress(subtopicId, [flashcardId]);
  return progress[flashcardId] ?? "unseen";
}

export async function setCardStatus(
  subtopicId: string,
  flashcardId: string,
  status: FlashcardStatus
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) {
    setLocalFlashcardStatus(subtopicId, flashcardId, status);
    return;
  }

  const supabase = createClient();
  if (status === "unseen") {
    const { error } = await supabase
      .from("flashcard_progress")
      .delete()
      .eq("user_id", userId)
      .eq("flashcard_id", flashcardId);
    if (error) console.warn("Failed to clear flashcard progress in Supabase:", error);
    return;
  }

  const { error } = await supabase
    .from("flashcard_progress")
    .upsert({ user_id: userId, flashcard_id: flashcardId, status, updated_at: new Date().toISOString() });
  if (error) console.warn("Failed to save flashcard progress to Supabase:", error);
}

export async function getSubtopicCounts(
  subtopicId: string,
  flashcardIds: string[]
): Promise<{ known: number; learning: number; total: number }> {
  const progress = await getSubtopicProgress(subtopicId, flashcardIds);
  const known = flashcardIds.filter((id) => progress[id] === "known").length;
  const learning = flashcardIds.filter((id) => progress[id] === "learning").length;
  return { known, learning, total: flashcardIds.length };
}

/**
 * Copies local flashcard progress into Supabase on first sign-in. A no-op if
 * the user's cloud table already has any rows, so a second device signing in
 * later doesn't clobber progress already synced from the first - cloud wins.
 */
export async function migrateLocalProgressToCloud(userId: string): Promise<void> {
  const supabase = createClient();

  const { count, error: countError } = await supabase
    .from("flashcard_progress")
    .select("flashcard_id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) {
    console.warn("Could not check existing cloud progress before migration:", countError);
    return;
  }
  if (count && count > 0) return; // already has cloud progress - don't overwrite

  if (typeof window === "undefined") return;
  const rows: { user_id: string; flashcard_id: string; status: FlashcardStatus }[] = [];
  const prefix = `${STORAGE_PREFIX}flashcards:`;
  for (const key of Object.keys(window.localStorage)) {
    if (!key.startsWith(prefix)) continue;
    const progress = readJson<Record<string, FlashcardStatus>>(key, {});
    for (const [flashcardId, status] of Object.entries(progress)) {
      if (status === "known" || status === "learning") {
        rows.push({ user_id: userId, flashcard_id: flashcardId, status });
      }
    }
  }
  if (rows.length === 0) return;

  const { error } = await supabase.from("flashcard_progress").upsert(rows);
  if (error) console.warn("Failed to migrate local flashcard progress to Supabase:", error);
}

/**
 * Deletes all of a signed-in user's cloud flashcard progress rows. Used by
 * the "Reset my progress" flow for signed-in users, in addition to (not
 * instead of) clearing localStorage on this device - RLS already lets a
 * user delete their own rows, so this uses the normal browser client rather
 * than a server route.
 */
export async function resetCloudProgress(userId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("flashcard_progress").delete().eq("user_id", userId);
  if (error) console.warn("Failed to reset cloud flashcard progress:", error);
}

// --- Question progress, celebration flag, last-learning IDs ----------------
// Local-only for all users, signed in or not - not part of the account sync.

export type QuestionProgress = {
  attempted: boolean;
  marksAwarded?: number;
};

function migrateQuestionProgress(old: Record<string, boolean | QuestionProgress>): Record<string, QuestionProgress> {
  const migrated: Record<string, QuestionProgress> = {};
  for (const [id, value] of Object.entries(old)) {
    if (typeof value === "boolean") {
      migrated[id] = { attempted: value };
    } else {
      migrated[id] = value;
    }
  }
  return migrated;
}

export function getQuestionProgress(subtopicId: string): Record<string, QuestionProgress> {
  const raw = readJson<Record<string, boolean | QuestionProgress>>(questionKey(subtopicId), {});
  return migrateQuestionProgress(raw);
}

export function setQuestionAttempted(subtopicId: string, questionId: string) {
  const progress = getQuestionProgress(subtopicId);
  progress[questionId] = { attempted: true, marksAwarded: progress[questionId]?.marksAwarded };
  writeJson(questionKey(subtopicId), progress);
}

export function setQuestionMarks(subtopicId: string, questionId: string, marksAwarded: number) {
  const progress = getQuestionProgress(subtopicId);
  progress[questionId] = { attempted: true, marksAwarded };
  writeJson(questionKey(subtopicId), progress);
}

// Whether the "every card marked as known" celebration has already been
// shown for the subtopic's current completed run. Cleared on deck restart
// so a fresh full completion can celebrate again.
export function getFlashcardCelebrated(subtopicId: string): boolean {
  return readJson(celebratedKey(subtopicId), false);
}

export function setFlashcardCelebrated(subtopicId: string, celebrated: boolean) {
  writeJson(celebratedKey(subtopicId), celebrated);
}

// IDs of cards marked "learning" as of the end of the most recently
// completed study session for this subtopic. Frozen at session-completion
// time (not live-updated mid-session), so the study screen can badge "what
// needed focus last time" independent of marks made so far in the current
// pass.
export function getLastLearningCardIds(subtopicId: string): string[] {
  return readJson(lastLearningKey(subtopicId), []);
}

export function setLastLearningCardIds(subtopicId: string, cardIds: string[]) {
  writeJson(lastLearningKey(subtopicId), cardIds);
}

/** Clears all PE Revision progress data from localStorage. */
export function resetAllProgress() {
  if (typeof window === "undefined") return;
  const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(STORAGE_PREFIX));
  keys.forEach((k) => window.localStorage.removeItem(k));
}
