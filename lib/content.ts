import fs from "fs";
import path from "path";
import type { Paper, Topic, Subtopic, Flashcard, Question, PastPaper } from "@/types/content";

const CONTENT_DIR = path.join(process.cwd(), "content");

function readJson<T>(relativePath: string): T {
  const filePath = path.join(CONTENT_DIR, relativePath);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

function readJsonSafe<T>(relativePath: string, fallback: T): T {
  const filePath = path.join(CONTENT_DIR, relativePath);
  if (!fs.existsSync(filePath)) return fallback;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function getPapers(): Paper[] {
  return readJson<Paper[]>("papers.json");
}

export function getPaperBySlug(slug: string): Paper | undefined {
  return getPapers().find((p) => p.slug === slug);
}

export function getTopics(): Topic[] {
  return readJson<Topic[]>("topics.json");
}

export function getTopicsByPaperId(paperId: string): Topic[] {
  return getTopics().filter((t) => t.paperId === paperId);
}

export function getTopicBySlug(slug: string): Topic | undefined {
  return getTopics().find((t) => t.slug === slug);
}

export function getSubtopics(): Subtopic[] {
  return readJson<Subtopic[]>("subtopics.json");
}

export function getSubtopicsByTopicId(topicId: string): Subtopic[] {
  return getSubtopics().filter((s) => s.topicId === topicId);
}

export function getSubtopicBySlug(slug: string): Subtopic | undefined {
  return getSubtopics().find((s) => s.slug === slug);
}

/**
 * Resolves the paper/topic/subtopic trio for a subtopic content path,
 * e.g. "paper-1/applied-anatomy/cardiovascular".
 */
export function resolveSubtopicPath(
  paperSlug: string,
  topicSlug: string,
  subtopicSlug: string
): { paper: Paper; topic: Topic; subtopic: Subtopic } | null {
  const paper = getPaperBySlug(paperSlug);
  const topic = getTopicBySlug(topicSlug);
  const subtopic = getSubtopicBySlug(subtopicSlug);
  if (!paper || !topic || !subtopic) return null;
  if (topic.paperId !== paper.id) return null;
  if (subtopic.topicId !== topic.id) return null;
  return { paper, topic, subtopic };
}

export function getFlashcards(paperSlug: string, topicSlug: string, subtopicSlug: string): Flashcard[] {
  return readJsonSafe<Flashcard[]>(
    `flashcards/${paperSlug}/${topicSlug}/${subtopicSlug}.json`,
    []
  );
}

export function getQuestions(paperSlug: string, topicSlug: string, subtopicSlug: string): Question[] {
  return readJsonSafe<Question[]>(
    `questions/${paperSlug}/${topicSlug}/${subtopicSlug}.json`,
    []
  );
}

export function getNotesMarkdown(paperSlug: string, topicSlug: string, subtopicSlug: string): string | null {
  const filePath = path.join(CONTENT_DIR, `notes/${paperSlug}/${topicSlug}/${subtopicSlug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}

export function getPastPapers(): PastPaper[] {
  return readJsonSafe<PastPaper[]>("past-papers.json", []);
}
