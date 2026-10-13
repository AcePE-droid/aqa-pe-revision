// Block-structured revision notes.
//
// The older notes are a single markdown document per subtopic, which mirrors
// the textbook's shape: long block text with separate key-definition boxes.
// These types describe the replacement - a subtopic is an ordered list of
// sections, and each section is an ordered list of typed blocks that the site
// renders as its own styled component.
//
// One file per topic, subtopics nested inside, so a topic can be regenerated
// or reviewed as a unit.

/**
 * Key terms. `term` must be the exact AQA term - only the `meaning` is
 * rewritten. Grouped into one block rather than one block per term so the
 * renderer can lay a set of related terms out together.
 *
 * `label` overrides the heading above the list, which is otherwise "Key term"
 * or "Key terms" depending on how many there are. Set it where the block is a
 * named set rather than a loose group of terms, for example "Types of valves",
 * so the heading says what the list actually is. Used verbatim, so it does not
 * pluralise itself.
 */
export type DefinitionBlock = {
  type: "definition";
  items: { term: string; meaning: string }[];
  label?: string;
};

/**
 * An equation or calculation. `equation` is the first line; `meaning` is the
 * single plain-English line underneath saying what it means or what a typical
 * value looks like.
 */
export type FormulaBlock = {
  type: "formula";
  equation: string;
  meaning: string;
};

/**
 * Numbered steps, a cause-and-effect chain, or a short sequence.
 *
 * - "steps" renders an ordered list, for stages that each need a sentence.
 * - "chain" renders each item as its own linked stage, stacked vertically
 *   with a link between, for cause-and-effect where each stage is a clause.
 * - "sequence" renders the items inline across the page, separated by
 *   arrows. For ordered lists of short labels - an anatomical pathway, a
 *   run of vessel names - where a stack of boxes would take a lot of page
 *   for very little information.
 *
 * Rule of thumb: if the items are more than a few words each, they are a
 * chain. If they are names, they are a sequence.
 */
export type HowItWorksBlock = {
  type: "how_it_works";
  mode: "steps" | "chain" | "sequence";
  items: string[];
};

/** A small contrast table. Only used where two or more things genuinely differ. */
export type CompareBlock = {
  type: "compare";
  columns: string[];
  rows: string[][];
};

/**
 * Connected prose for the parts that genuinely need explaining rather than
 * listing. This is the one block allowed to run to full sentences and
 * paragraphs - everything else stays in short chunks. Kept deliberately
 * short (one or two paragraphs) so the notes don't drift back towards the
 * textbook's wall of block text.
 */
export type ExplainerBlock = {
  type: "explainer";
  paragraphs: string[];
};

/** Common student mistakes, as a wrong/right pair so the correction is explicit. */
export type MixUpsBlock = {
  type: "mix_ups";
  items: { wrong: string; right: string }[];
};

/** Exact AQA terms and phrases that earn marks. */
export type SayItToScoreBlock = {
  type: "say_it_to_score";
  items: string[];
};

/** Three short recall bullets. */
export type LockItInBlock = {
  type: "lock_it_in";
  items: string[];
};

export type NoteBlock =
  | DefinitionBlock
  | FormulaBlock
  | HowItWorksBlock
  | CompareBlock
  | ExplainerBlock
  | MixUpsBlock
  | SayItToScoreBlock
  | LockItInBlock;

/**
 * A section groups blocks under one heading. Sections are ordered by the AQA
 * spec bullets, deliberately not by the textbook's chapter order.
 */
export type NoteSection = {
  heading: string;
  /** The spec bullet this section covers, for traceability during review. */
  specBullet?: string;
  blocks: NoteBlock[];
};

/** `subtopicId` must match an id in content/subtopics.json exactly. */
export type NoteSubtopic = {
  subtopicId: string;
  sections: NoteSection[];
};

/** `topicId` must match an id in content/topics.json exactly. */
export type NoteTopicDocument = {
  topicId: string;
  subtopics: NoteSubtopic[];
};
