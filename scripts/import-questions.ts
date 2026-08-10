/**
 * Imports practice questions from a CSV export into
 * /content/questions/[paper]/[topic]/[subtopic].json.
 *
 * Expected CSV columns (header row required):
 *   Question Number, Question, Marks, Mark Scheme, Sub-topic
 *
 * Optional columns for multiple choice questions:
 *   Is Multiple Choice (TRUE/FALSE), Options (separated by " | "), Correct Option
 *
 * Safe to run repeatedly: rows whose Question text already exists in that
 * subtopic's JSON file are skipped.
 *
 * Usage:
 *   npm run import:questions -- path/to/export.csv
 */
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import type { Question } from "../types/content";
import { resolveSubtopicByName, contentFilePath } from "./lib/taxonomy";

type CsvRow = {
  "Question Number"?: string;
  Question?: string;
  Marks?: string;
  "Mark Scheme"?: string;
  "Sub-topic"?: string;
  "Is Multiple Choice"?: string;
  Options?: string;
  "Correct Option"?: string;
};

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function nextIdNumber(existing: Question[]): number {
  const nums = existing
    .map((q) => parseInt(q.id.replace(/^\D*q/i, ""), 10))
    .filter((n) => !isNaN(n));
  return (nums.length ? Math.max(...nums) : 0) + 1;
}

function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: npm run import:questions -- <path-to-csv>");
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
    const filePath = contentFilePath("questions", paper.slug, topic.slug, subtopic.slug);

    const existing: Question[] = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
      : [];
    const existingQuestions = new Set(existing.map((q) => normalize(q.question)));
    let nextNum = nextIdNumber(existing);

    for (const row of rows) {
      const questionText = row.Question?.trim();
      const marksRaw = row.Marks?.trim();
      const markScheme = row["Mark Scheme"]?.trim();
      const questionNumber = row["Question Number"]?.trim();

      if (!questionText || !marksRaw || !markScheme || !questionNumber) {
        errors.push(
          `Subtopic "${subtopicName}": row missing Question Number, Question, Marks, or Mark Scheme - skipped.`
        );
        continue;
      }
      const marks = parseInt(marksRaw, 10);
      if (isNaN(marks)) {
        errors.push(`Subtopic "${subtopicName}": row has non-numeric Marks "${marksRaw}" - skipped.`);
        continue;
      }
      if (existingQuestions.has(normalize(questionText))) {
        skipped++;
        continue;
      }

      const isMultipleChoice = ["true", "yes"].includes((row["Is Multiple Choice"] ?? "").trim().toLowerCase());
      const options = row.Options
        ? row.Options.split("|").map((o) => o.trim()).filter(Boolean)
        : undefined;
      const correctOption = row["Correct Option"]?.trim() || undefined;

      const id = `${subtopic.slug}-q${nextNum}`;
      nextNum++;

      const question: Question = {
        id,
        questionNumber,
        question: questionText,
        marks,
        markScheme,
        subtopicId: subtopic.id,
        ...(isMultipleChoice ? { isMultipleChoice, options, correctOption } : {}),
      };

      existing.push(question);
      existingQuestions.add(normalize(questionText));
      imported++;
    }

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2) + "\n");
  }

  console.log("\nQuestion import complete.");
  console.log(`  Imported: ${imported}`);
  console.log(`  Skipped (duplicates or unresolved subtopics): ${skipped}`);
  if (errors.length) {
    console.log(`  Warnings: ${errors.length}`);
    errors.forEach((e) => console.log(`   - ${e}`));
  }
}

main();
