import { createClient } from "@/lib/supabase/client";

export type Confidence = "red" | "amber" | "green";

export type SubtopicProgress = {
  notesRead: boolean;
  confidence: Confidence | null;
};

export const CONFIDENCE_LEVELS: Confidence[] = ["red", "amber", "green"];

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  red: "Weak",
  amber: "Okay",
  green: "Confident",
};

/**
 * Reads notes-read / confidence state for a set of subtopics. Signed-in
 * only: there's no localStorage fallback here, so anonymous callers get an
 * empty map and the UI falls back to its non-interactive state.
 */
export async function getSubtopicProgressMap(
  userId: string,
  subtopicIds: string[]
): Promise<Record<string, SubtopicProgress>> {
  if (subtopicIds.length === 0) return {};

  const supabase = createClient();
  const { data, error } = await supabase
    .from("subtopic_progress")
    .select("subtopic_id, notes_read, confidence")
    .eq("user_id", userId)
    .in("subtopic_id", subtopicIds);

  if (error) {
    console.warn("Failed to read subtopic progress from Supabase:", error);
    return {};
  }

  const progress: Record<string, SubtopicProgress> = {};
  for (const row of data ?? []) {
    progress[row.subtopic_id] = {
      notesRead: row.notes_read,
      confidence: row.confidence as Confidence | null,
    };
  }
  return progress;
}

async function upsert(
  userId: string,
  subtopicId: string,
  patch: { notes_read?: boolean; confidence?: Confidence | null }
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("subtopic_progress").upsert(
    {
      user_id: userId,
      subtopic_id: subtopicId,
      ...patch,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,subtopic_id" }
  );
  if (error) console.warn("Failed to save subtopic progress to Supabase:", error);
}

export function setNotesRead(userId: string, subtopicId: string, notesRead: boolean): Promise<void> {
  return upsert(userId, subtopicId, { notes_read: notesRead });
}

export function setConfidence(
  userId: string,
  subtopicId: string,
  confidence: Confidence | null
): Promise<void> {
  return upsert(userId, subtopicId, { confidence });
}
