import fs from "fs";
import path from "path";
import type { Paper, Topic, Subtopic, Flashcard, Question, PastPaper } from "@/types/content";
import { slugify } from "@/lib/slug";

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

/**
 * Defense-in-depth: slugs used in content.ts always originate from validated
 * JSON records (papers/topics/subtopics), never directly from route params.
 * This guard rejects anything that isn't a plain slug (no path separators,
 * traversal sequences, or leading dots) so a future caller can't accidentally
 * turn one of the file-path-building functions below into a path traversal.
 */
const SAFE_SLUG_PATTERN = /^[a-z0-9-]+$/;

function isSafeSlug(slug: string): boolean {
  return SAFE_SLUG_PATTERN.test(slug);
}

export function getPapers(): Paper[] {
  return readJson<Paper[]>("papers.json");
}

export function getPaperBySlug(slug: string): Paper | undefined {
  return getPapers().find((p) => p.slug === slug);
}

export function getPaperById(id: string): Paper | undefined {
  return getPapers().find((p) => p.id === id);
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

/**
 * Subjects (e.g. "Anatomy & Physiology") group Topics across both papers.
 * Order follows first appearance in topics.json, which matches the spec order.
 */
export function getSubjects(): { name: string; slug: string }[] {
  const seen = new Map<string, string>();
  for (const topic of getTopics()) {
    const slug = slugify(topic.subject);
    if (!seen.has(slug)) seen.set(slug, topic.subject);
  }
  return Array.from(seen.entries()).map(([slug, name]) => ({ slug, name }));
}

export function getSubjectBySlug(slug: string): { name: string; slug: string } | undefined {
  return getSubjects().find((s) => s.slug === slug);
}

export function getTopicsBySubject(subjectName: string): Topic[] {
  return getTopics().filter((t) => t.subject === subjectName);
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
  if (!isSafeSlug(paperSlug) || !isSafeSlug(topicSlug) || !isSafeSlug(subtopicSlug)) return [];
  return readJsonSafe<Flashcard[]>(
    `flashcards/${paperSlug}/${topicSlug}/${subtopicSlug}.json`,
    []
  );
}

export function getQuestions(paperSlug: string, topicSlug: string, subtopicSlug: string): Question[] {
  if (!isSafeSlug(paperSlug) || !isSafeSlug(topicSlug) || !isSafeSlug(subtopicSlug)) return [];
  return readJsonSafe<Question[]>(
    `questions/${paperSlug}/${topicSlug}/${subtopicSlug}.json`,
    []
  );
}

export function getNotesMarkdown(paperSlug: string, topicSlug: string, subtopicSlug: string): string | null {
  if (!isSafeSlug(paperSlug) || !isSafeSlug(topicSlug) || !isSafeSlug(subtopicSlug)) return null;
  const filePath = path.join(CONTENT_DIR, `notes/${paperSlug}/${topicSlug}/${subtopicSlug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}

export function getPastPapers(): PastPaper[] {
  return readJsonSafe<PastPaper[]>("past-papers.json", []);
}
