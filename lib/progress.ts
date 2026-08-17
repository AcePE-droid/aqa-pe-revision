// Client-side progress tracking, stored entirely in localStorage.
// No backend, no accounts - all state lives in the visitor's browser.

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

export function getFlashcardProgress(subtopicId: string): Record<string, FlashcardStatus> {
  return readJson(flashcardKey(subtopicId), {});
}

export function setFlashcardStatus(subtopicId: string, cardId: string, status: FlashcardStatus) {
  const progress = getFlashcardProgress(subtopicId);
  progress[cardId] = status;
  writeJson(flashcardKey(subtopicId), progress);
}

export function getQuestionProgress(subtopicId: string): Record<string, boolean> {
  return readJson(questionKey(subtopicId), {});
}

export function setQuestionAttempted(subtopicId: string, questionId: string) {
  const progress = getQuestionProgress(subtopicId);
  progress[questionId] = true;
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
