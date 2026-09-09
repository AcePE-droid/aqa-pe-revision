import fs from "fs";
import path from "path";
import { unstable_cache } from "next/cache";
import type { Paper, Topic, Subtopic, Flashcard, Question, PastPaper } from "@/types/content";
import { slugify } from "@/lib/slug";

const CONTENT_DIR = path.join(process.cwd(), "content");

// Content JSON files are static (bundled at deploy time) and never change
// while a server process is running, so every read is cached in-memory by
// file path. Without this, pages like My Progress that re-derive an index
// over the entire content tree on every request were re-reading and
// re-parsing hundreds of JSON files per page load.
const jsonFileCache = new Map<string, unknown>();

function readJson<T>(relativePath: string): T {
  const filePath = path.join(CONTENT_DIR, relativePath);
  if (jsonFileCache.has(filePath)) return jsonFileCache.get(filePath) as T;
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw) as T;
  jsonFileCache.set(filePath, parsed);
  return parsed;
}

function readJsonSafe<T>(relativePath: string, fallback: T): T {
  const filePath = path.join(CONTENT_DIR, relativePath);
  if (jsonFileCache.has(filePath)) return jsonFileCache.get(filePath) as T;
  if (!fs.existsSync(filePath)) return fallback;
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw) as T;
  jsonFileCache.set(filePath, parsed);
  return parsed;
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

/**
 * Total item count (flashcards + questions combined) across every topic and
 * subtopic under a subject - used to compute "% of subject seen" for the
 * subject-coverage badges (see supabase/migrations for the activity/badge
 * schema).
 */
export function getSubjectItemCounts(subjectName: string): number {
  let total = 0;
  for (const topic of getTopicsBySubject(subjectName)) {
    const paper = getPaperById(topic.paperId);
    if (!paper) continue;
    for (const subtopic of getSubtopicsByTopicId(topic.id)) {
      total += getFlashcards(paper.slug, topic.slug, subtopic.slug).length;
      total += getQuestions(paper.slug, topic.slug, subtopic.slug).length;
    }
  }
  return total;
}

export type ProgressBucketInfo = {
  id: string;
  name: string;
  topicName: string;
  subject: string;
  totalItems: number;
};

export type ProgressContentIndex = {
  // Item id -> owning subject/subtopic, for mapping a user's flashcard_progress
  // / question_progress rows (which only carry an item id) back to a subject
  // and bucket for the My Progress page's per-subject/per-bucket stats.
  flashcardSubject: Map<string, string>;
  flashcardBucket: Map<string, string>;
  questionSubject: Map<string, string>;
  questionBucket: Map<string, string>;
  buckets: Map<string, ProgressBucketInfo>;
  subjectTotals: Map<string, number>;
};

/**
 * One-pass index over all content, built for the My Progress page: maps
 * every flashcard/question id to its subject and bucket (subtopic id), and
 * totals item counts per bucket and per subject. Kept separate from
 * getSubjectItemCounts (which callers on the study/question pages use
 * individually per-subject) so this page doesn't re-scan the content
 * directory once per subject.
 */
export function getProgressContentIndex(): ProgressContentIndex {
  const flashcardSubject = new Map<string, string>();
  const flashcardBucket = new Map<string, string>();
  const questionSubject = new Map<string, string>();
  const questionBucket = new Map<string, string>();
  const buckets = new Map<string, ProgressBucketInfo>();
  const subjectTotals = new Map<string, number>();

  for (const topic of getTopics()) {
    const paper = getPaperById(topic.paperId);
    if (!paper) continue;
    for (const subtopic of getSubtopicsByTopicId(topic.id)) {
      const flashcards = getFlashcards(paper.slug, topic.slug, subtopic.slug);
      const questions = getQuestions(paper.slug, topic.slug, subtopic.slug);

      for (const card of flashcards) {
        flashcardSubject.set(card.id, topic.subject);
        flashcardBucket.set(card.id, subtopic.id);
      }
      for (const q of questions) {
        questionSubject.set(q.id, topic.subject);
        questionBucket.set(q.id, subtopic.id);
      }

      const totalItems = flashcards.length + questions.length;
      buckets.set(subtopic.id, {
        id: subtopic.id,
        name: subtopic.name,
        topicName: topic.name,
        subject: topic.subject,
        totalItems,
      });
      subjectTotals.set(topic.subject, (subjectTotals.get(topic.subject) ?? 0) + totalItems);
    }
  }

  return { flashcardSubject, flashcardBucket, questionSubject, questionBucket, buckets, subjectTotals };
}

// Serializable (Map-free) shape of ProgressContentIndex, for use with
// unstable_cache below - Next's Data Cache persists across separate
// serverless invocations (unlike the in-memory jsonFileCache above, which
// only helps while a function instance stays warm), but it round-trips
// values through JSON, so Maps have to be represented as entry arrays.
export type ProgressContentIndexData = {
  flashcardSubject: [string, string][];
  flashcardBucket: [string, string][];
  questionSubject: [string, string][];
  questionBucket: [string, string][];
  buckets: [string, ProgressBucketInfo][];
  subjectTotals: [string, number][];
};

/**
 * Cached version of getProgressContentIndex() for the My Progress page.
 * Walking every subtopic's flashcard/question JSON file is the most
 * expensive content read in the app, and on a low-traffic serverless
 * deployment nearly every request hits a cold function instance - caching
 * this in Next's Data Cache (rather than only the in-memory jsonFileCache)
 * is what actually avoids repeating that work on every page load in
 * production, not just within a single warm process.
 */
export const getCachedProgressContentIndexData = unstable_cache(
  async (): Promise<ProgressContentIndexData> => {
    const index = getProgressContentIndex();
    return {
      flashcardSubject: Array.from(index.flashcardSubject.entries()),
      flashcardBucket: Array.from(index.flashcardBucket.entries()),
      questionSubject: Array.from(index.questionSubject.entries()),
      questionBucket: Array.from(index.questionBucket.entries()),
      buckets: Array.from(index.buckets.entries()),
      subjectTotals: Array.from(index.subjectTotals.entries()),
    };
  },
  ["progress-content-index"]
);

function countFlashcardsInDir(dir: string): number {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      total += countFlashcardsInDir(fullPath);
    } else if (entry.name.endsWith(".json")) {
      const cards = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
      total += Array.isArray(cards) ? cards.length : 0;
    }
  }
  return total;
}

/**
 * Total flashcard count across every subtopic file under content/flashcards,
 * rounded down to the nearest 100 for cleaner homepage copy (e.g. "2,400"
 * instead of "2,407"). Recomputed at build/request time, so it stays in
 * sync automatically as new flashcards are imported.
 */
export function getTotalFlashcardCount(): number {
  const total = countFlashcardsInDir(path.join(CONTENT_DIR, "flashcards"));
  return Math.floor(total / 100) * 100;
}
