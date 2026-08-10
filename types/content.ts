// Core content types for the AQA A-Level PE revision site (v1).
// Every JSON file in /content must conform to one of these shapes.

export type Paper = {
  id: string; // e.g. "paper-1"
  slug: string; // e.g. "paper-1" (used in URLs)
  number: 1 | 2;
  name: string; // e.g. "Paper 1"
};

export type Topic = {
  id: string; // e.g. "applied-anatomy"
  slug: string; // used in URLs, matches folder name under /content
  name: string; // e.g. "Applied Anatomy & Physiology"
  paperId: string; // references Paper.id
};

export type Subtopic = {
  id: string; // e.g. "cardiovascular"
  slug: string; // used in URLs, matches JSON/MD filename (without extension)
  name: string; // e.g. "Cardiovascular System"
  topicId: string; // references Topic.id
};

export type Flashcard = {
  id: string; // unique, e.g. "cv-001"
  front: string;
  back: string;
  subtopicId: string;
};

export type Question = {
  id: string; // e.g. "cv-q1"
  questionNumber: string; // e.g. "Q1" or "Q7(a)"
  question: string;
  marks: number;
  markScheme: string; // full mark scheme text, may contain line breaks
  subtopicId: string;
  isMultipleChoice?: boolean;
  options?: string[]; // only if multiple choice
  correctOption?: string; // only if multiple choice
};

export type PastPaper = {
  id: string; // e.g. "2025-p1"
  year: number; // e.g. 2025
  paper: 1 | 2;
  session?: string; // "June" | "November" - optional
  questionPaperUrl: string;
  markSchemeUrl: string;
  examinerReportUrl?: string; // optional
};
