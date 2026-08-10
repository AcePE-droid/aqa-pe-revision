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

/** Clears all PE Revision progress data from localStorage. */
export function resetAllProgress() {
  if (typeof window === "undefined") return;
  const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(STORAGE_PREFIX));
  keys.forEach((k) => window.localStorage.removeItem(k));
}
