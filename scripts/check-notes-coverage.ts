/**
 * Coverage check for the notes rewrite.
 *
 * The rewrite changes the structure and the wording of the notes, but it must
 * not lose any of the concepts the previous notes covered. This compares the
 * old markdown against the new block document for the same subtopic and
 * reports anything the old notes named that the new ones don't.
 *
 * It extracts two things from the old notes:
 *   - every **bolded** term, which is how key terminology was marked
 *   - every "## " section heading
 *
 * ...then checks each one appears somewhere in the new blocks. Matching is
 * deliberately loose (case-insensitive, singular/plural tolerant) because the
 * rewrite is allowed to reword - it is the concept that has to survive, not
 * the sentence.
 *
 * A term reported here is a prompt to go and look, not proof of a gap: a
 * concept can legitimately be covered under different wording. Read the list,
 * don't just clear it.
 *
 * Usage:
 *   npx tsx scripts/check-notes-coverage.ts
 *   npx tsx scripts/check-notes-coverage.ts cardiovascular
 */
import fs from "fs";
import path from "path";

const CONTENT = path.join(process.cwd(), "content");

type Block = Record<string, unknown>;
type Section = { heading: string; blocks: Block[] };
type Doc = { topicId: string; subtopics: { subtopicId: string; sections: Section[] }[] };

type Subtopic = { id: string; slug: string; name: string; topicId: string };
type Topic = { id: string; slug: string; paperId: string };
type Paper = { id: string; slug: string };

function readJson<T>(rel: string): T {
  return JSON.parse(fs.readFileSync(path.join(CONTENT, rel), "utf-8")) as T;
}

/** Every string anywhere in the new block document, flattened. */
function allText(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => allText(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => allText(v, out));
  return out;
}

function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Loose containment: tolerates plurals and hyphen/space differences. */
function covers(haystack: string, needle: string): boolean {
  const h = normalise(haystack).replace(/-/g, " ");
  const n = normalise(needle).replace(/-/g, " ");
  if (!n) return true;
  if (h.includes(n)) return true;
  // try the singular form, and the form without a trailing parenthetical
  const singular = n.replace(/(ies)$/, "y").replace(/s$/, "");
  return h.includes(singular);
}

function extractOldTerms(md: string): { bold: string[]; headings: string[] } {
  const bold = [...md.matchAll(/\*\*([^*]+)\*\*/g)]
    .map((m) => m[1].trim())
    .filter((t) => t.length > 2);
  const headings = [...md.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());
  return { bold: [...new Set(bold)], headings: [...new Set(headings)] };
}

function main() {
  const only = process.argv[2];
  const subtopics = readJson<Subtopic[]>("subtopics.json");
  const topics = readJson<Topic[]>("topics.json");
  const papers = readJson<Paper[]>("papers.json");

  let checked = 0;
  let totalMissing = 0;

  for (const st of subtopics) {
    if (only && st.id !== only) continue;
    const topic = topics.find((t) => t.id === st.topicId);
    if (!topic) continue;
    const paper = papers.find((p) => p.id === topic.paperId);
    if (!paper) continue;

    const mdPath = path.join(CONTENT, `notes/${paper.slug}/${topic.slug}/${st.slug}.md`);
    const blocksPath = path.join(CONTENT, `notes-blocks/${paper.slug}/${topic.slug}.json`);
    if (!fs.existsSync(mdPath) || !fs.existsSync(blocksPath)) continue;

    const doc = JSON.parse(fs.readFileSync(blocksPath, "utf-8")) as Doc;
    const entry = doc.subtopics.find((s) => s.subtopicId === st.id);
    if (!entry) continue;

    checked++;
    const md = fs.readFileSync(mdPath, "utf-8");
    const { bold, headings } = extractOldTerms(md);
    const newText = allText(entry).join(" \n ");

    const missingTerms = bold.filter((t) => !covers(newText, t));
    const missingHeadings = headings.filter((h) => !covers(newText, h));

    console.log(`\n=== ${st.name} (${st.id}) ===`);
    console.log(`  old: ${bold.length} bolded terms, ${headings.length} sections`);
    console.log(`  new: ${entry.sections.length} sections, ${entry.sections.reduce((n, s) => n + s.blocks.length, 0)} blocks`);

    if (missingHeadings.length) {
      console.log(`\n  SECTIONS from the old notes with no clear match (${missingHeadings.length}):`);
      missingHeadings.forEach((h) => console.log(`    - ${h}`));
    }
    if (missingTerms.length) {
      console.log(`\n  TERMS from the old notes not found (${missingTerms.length}):`);
      missingTerms.forEach((t) => console.log(`    - ${t}`));
    }
    if (!missingTerms.length && !missingHeadings.length) {
      console.log("  OK - every bolded term and section heading is accounted for.");
    }
    totalMissing += missingTerms.length + missingHeadings.length;
  }

  console.log(`\n---\nchecked ${checked} subtopic(s), ${totalMissing} item(s) to review`);
  if (totalMissing > 0) process.exitCode = 1;
}

main();
