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

/** A few short recall bullets. */
export type LockItInBlock = {
  type: "lock_it_in";
  items: string[];
};

/**
 * A mnemonic: a way of remembering something, as opposed to the thing
 * itself. Deliberately its own type rather than another `lock_it_in`,
 * because those three boxes answer different questions - "the exact words
 * that earn marks" (say_it_to_score), "what to carry out of this section"
 * (lock_it_in), and "a trick for recalling it under pressure" (this one).
 *
 * `intro` sets the trick up in a line or two. `phrase` is the sentence to
 * memorise, set apart from the prose around it. `items` is the trick itself,
 * one line each. `pairs` renders a two-column mapping instead, for tricks
 * that are really a lookup between two sets, such as each plane of movement
 * and the axis that goes with it. A block may use `items`, `pairs`, or both,
 * but should use at least one of them.
 *
 * Inside `pairs`, a cell is plain text, or a `{ word, meaning }` pair where
 * the word is the one being memorised and renders in bold ahead of what it
 * stands for. `labelPosition` moves the column labels to the foot of the
 * grid, for a phrase whose closing words are themselves the labels.
 */
export type MemoryTipBlock = {
  type: "memory_tip";
  intro?: string[];
  phrase?: string;
  items?: string[];
  pairs?: {
    columns: string[];
    rows: MemoryTipCell[][];
    labelPosition?: "head" | "foot";
  };
};

/** A `pairs` cell: plain text, or a bolded word and what it stands for. */
export type MemoryTipCell = string | { word: string; meaning: string };

/**
 * A line graph, drawn from its data. For the places where the shape of the
 * line is the thing being taught: distance-time, velocity-time, force-time.
 *
 * Deliberately data rather than a picture file. The notes have no asset
 * pipeline, a line drawn from points stays sharp at any width and takes the
 * subject's own accent colour, and the axis values stay selectable text
 * instead of being baked into an image. A curve is drawn by giving the line
 * enough points to approximate it.
 *
 * `ticks` are listed rather than generated, because the useful marks on these
 * graphs are the moments the motion changes, which are not evenly spaced.
 * `annotations` name a stage of the line; `x` and `y` are in data units and
 * are positioned by hand against the shape they describe.
 */
export type GraphBlock = {
  type: "graph";
  title: string;
  xAxis: { label: string; max: number; ticks: number[] };
  yAxis: { label: string; max: number; ticks: number[] };
  /** `[x, y]` pairs in data units, joined in order. */
  points: number[][];
  /**
   * Stage labels. `x` and `y` are in data units, so a label stays attached to
   * the part of the line it describes at any size.
   *
   * `anchor` is which end of the text sits at `x`, defaulting to its middle.
   * A label beside a steep line needs to be anchored at the end nearest the
   * line, otherwise centring it pushes the text back across the line or off
   * the edge of the plot.
   *
   * `wrapped` is the same words broken over lines, used at phone width only.
   * SVG text does not reflow, so the two versions are both drawn and one is
   * hidden, the same approach the compare tables take. It exists to buy room
   * without shortening a label: these are the terms students have to
   * recognise, so they are never abbreviated or reworded.
   */
  annotations?: {
    x: number;
    y: number;
    text: string;
    anchor?: "start" | "middle" | "end";
    wrapped?: string[];
    /**
     * Position from the `sm` breakpoint up, where the type is smaller and so
     * the label is a good deal narrower. A label squeezed past a line at
     * phone width often has to sit further from it than it needs to on a
     * wide screen, and one position cannot be tight at both. Only the given
     * fields are overridden.
     */
    wide?: { x?: number; y?: number; anchor?: "start" | "middle" | "end" };
  }[];
  caption?: string;
};

export type NoteBlock =
  | DefinitionBlock
  | FormulaBlock
  | HowItWorksBlock
  | CompareBlock
  | ExplainerBlock
  | MixUpsBlock
  | SayItToScoreBlock
  | LockItInBlock
  | MemoryTipBlock
  | GraphBlock;

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
