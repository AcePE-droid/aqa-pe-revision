/**
 * Imports flashcards from a CSV export of the site owner's Google Sheet into
 * /content/flashcards/[paper]/[topic]/[subtopic].json.
 *
 * Expected CSV columns (header row required):
 *   Subject, Paper, Section, Topic, Subtopic, Question, Answer
 *
 * "Topic" is matched against content/subtopics.json (the site's "Subtopic" entity,
 * which is deliberately broader than the spec's finest level) to work out where the
 * file goes. "Subtopic" (the finest spec-level grouping, e.g. "Receptors") is stored
 * on each card as its `group`, used to filter/group cards within that subtopic's deck.
 * For backwards compatibility, "Sub-topic" is also accepted as an alias for "Topic".
 *
 * Safe to run repeatedly: rows whose Question text already exists in that
 * subtopic's JSON file are skipped, so re-running after adding new rows to the
 * sheet only imports what's new.
 *
 * To wholesale-replace a subtopic's deck instead of merging (e.g. after editing
 * existing rows in the sheet rather than adding new ones), pass --replace with a
 * comma-separated list of subtopic names matching the CSV's "Topic" column. Any
 * subtopic named there has its existing cards discarded before that subtopic's
 * rows from the CSV are imported (fresh sequential IDs, since discarded cards
 * can't be matched back up to specific new rows). All other subtopics are
 * unaffected and continue to merge-and-skip-duplicates as normal.
 *
 * Usage:
 *   npm run import:flashcards -- path/to/export.csv
 *   npm run import:flashcards -- path/to/export.csv --replace="Respiratory System,Neuromuscular System"
 */
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import type { Flashcard } from "../types/content";
import { resolveSubtopicByName, contentFilePath } from "./lib/taxonomy";

type CsvRow = {
  Topic?: string;
  "Sub-topic"?: string;
  Subtopic?: string;
  Question?: string;
  Answer?: string;
};

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function nextIdNumber(existing: Flashcard[]): number {
  const nums = existing.map((c) => parseInt(c.id.split("-").pop() ?? "", 10)).filter((n) => !isNaN(n));
  return (nums.length ? Math.max(...nums) : 0) + 1;
}

function parseReplaceArg(argv: string[]): Set<string> {
  const flag = argv.find((a) => a.startsWith("--replace="));
  if (!flag) return new Set();
  return new Set(
    flag
      .slice("--replace=".length)
      .split(",")
      .map((s) => normalize(s))
      .filter(Boolean)
  );
}

function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: npm run import:flashcards -- <path-to-csv>");
    process.exit(1);
  }
  if (!fs.existsSync(csvPath)) {
    console.error(`File not found: ${csvPath}`);
    process.exit(1);
  }

  const replaceSubtopics = parseReplaceArg(process.argv.slice(3));

  const raw = fs.readFileSync(csvPath, "utf-8");
  const parsed = Papa.parse<CsvRow>(raw, { header: true, skipEmptyLines: true });

  const rowsBySubtopic = new Map<string, CsvRow[]>();
  const errors: string[] = [];

  for (const [i, row] of parsed.data.entries()) {
    const subtopicName = (row.Topic ?? row["Sub-topic"])?.trim();
    if (!subtopicName) {
      errors.push(`Row ${i + 2}: missing "Topic" - skipped.`);
      continue;
    }
    if (!rowsBySubtopic.has(subtopicName)) rowsBySubtopic.set(subtopicName, []);
    rowsBySubtopic.get(subtopicName)!.push(row);
  }

  let imported = 0;
  let skipped = 0;

  for (const [subtopicName, rows] of rowsBySubtopic) {
    const resolved = resolveSubtopicByName(subtopicName);
    if (!resolved) {
      errors.push(
        `Unknown subtopic "${subtopicName}" (${rows.length} row(s) skipped). Check spelling against content/subtopics.json.`
      );
      skipped += rows.length;
      continue;
    }

    const { paper, topic, subtopic } = resolved;
    const filePath = contentFilePath("flashcards", paper.slug, topic.slug, subtopic.slug);

    const previousCards: Flashcard[] = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
      : [];
    const isReplace = replaceSubtopics.has(normalize(subtopicName));
    if (isReplace && previousCards.length) {
      console.log(`Subtopic "${subtopicName}": replacing ${previousCards.length} existing card(s).`);
    }

    const existing: Flashcard[] = isReplace ? [] : previousCards;
    const existingFronts = new Set(existing.map((c) => normalize(c.front)));
    let nextNum = nextIdNumber(existing);

    for (const row of rows) {
      const front = row.Question?.trim();
      const back = row.Answer?.trim();
      if (!front || !back) {
        errors.push(`Subtopic "${subtopicName}": row missing Question or Answer - skipped.`);
        continue;
      }
      if (existingFronts.has(normalize(front))) {
        skipped++;
        continue;
      }

      const id = `${subtopic.slug}-${String(nextNum).padStart(3, "0")}`;
      nextNum++;
      const group = row.Subtopic?.trim() || undefined;
      existing.push({ id, front, back, subtopicId: subtopic.id, ...(group ? { group } : {}) });
      existingFronts.add(normalize(front));
      imported++;
    }

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2) + "\n");
  }

  console.log("\nFlashcard import complete.");
  console.log(`  Imported: ${imported}`);
  console.log(`  Skipped (duplicates or unresolved subtopics): ${skipped}`);
  if (errors.length) {
    console.log(`  Warnings: ${errors.length}`);
    errors.forEach((e) => console.log(`   - ${e}`));
  }
}

main();
