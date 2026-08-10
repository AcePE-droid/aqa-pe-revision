/**
 * Imports flashcards from a CSV export of the site owner's Google Sheet into
 * /content/flashcards/[paper]/[topic]/[subtopic].json.
 *
 * Expected CSV columns (header row required):
 *   Subject, Exam Board, Qualification, Paper, Topic, Sub-topic, Question, Answer
 *
 * Only "Sub-topic", "Question", and "Answer" are actually used - the subtopic name
 * is matched against content/subtopics.json to work out where the file goes.
 *
 * Safe to run repeatedly: rows whose Question text already exists in that
 * subtopic's JSON file are skipped, so re-running after adding new rows to the
 * sheet only imports what's new.
 *
 * Usage:
 *   npm run import:flashcards -- path/to/export.csv
 */
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import type { Flashcard } from "../types/content";
import { resolveSubtopicByName, contentFilePath } from "./lib/taxonomy";

type CsvRow = {
  "Sub-topic"?: string;
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

  const raw = fs.readFileSync(csvPath, "utf-8");
  const parsed = Papa.parse<CsvRow>(raw, { header: true, skipEmptyLines: true });

  const rowsBySubtopic = new Map<string, CsvRow[]>();
  const errors: string[] = [];

  for (const [i, row] of parsed.data.entries()) {
    const subtopicName = row["Sub-topic"]?.trim();
    if (!subtopicName) {
      errors.push(`Row ${i + 2}: missing "Sub-topic" - skipped.`);
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

    const existing: Flashcard[] = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
      : [];
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
      existing.push({ id, front, back, subtopicId: subtopic.id });
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
