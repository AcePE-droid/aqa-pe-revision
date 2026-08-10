import fs from "fs";
import path from "path";
import type { Paper, Topic, Subtopic } from "../../types/content";

const CONTENT_DIR = path.join(process.cwd(), "content");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8")) as T;
}

/**
 * Resolves a subtopic by its human-readable name (case-insensitive), as it would
 * appear in a "Sub-topic" column exported from Google Sheets. Returns the full
 * paper/topic/subtopic trio so callers can build the correct /content file path.
 */
export function resolveSubtopicByName(
  name: string
): { paper: Paper; topic: Topic; subtopic: Subtopic } | null {
  const subtopics = readJson<Subtopic[]>("subtopics.json");
  const topics = readJson<Topic[]>("topics.json");
  const papers = readJson<Paper[]>("papers.json");

  const target = name.trim().toLowerCase();
  const subtopic = subtopics.find((s) => s.name.trim().toLowerCase() === target);
  if (!subtopic) return null;

  const topic = topics.find((t) => t.id === subtopic.topicId);
  if (!topic) return null;

  const paper = papers.find((p) => p.id === topic.paperId);
  if (!paper) return null;

  return { paper, topic, subtopic };
}

export function contentFilePath(
  kind: "flashcards" | "questions",
  paperSlug: string,
  topicSlug: string,
  subtopicSlug: string
): string {
  return path.join(CONTENT_DIR, kind, paperSlug, topicSlug, `${subtopicSlug}.json`);
}
