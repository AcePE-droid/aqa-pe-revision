import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSubjectBySlug,
  getTopicsBySubject,
  getPaperById,
  getSubtopicsByTopicId,
  getFlashcards,
} from "@/lib/content";
import SectionSubjectTree, { type PaperGroup } from "@/components/SectionSubjectTree";

export default async function FlashcardSubjectPage(
  props: PageProps<"/flashcards/[subjectSlug]">
) {
  const { subjectSlug } = await props.params;
  const subject = getSubjectBySlug(subjectSlug);
  if (!subject) notFound();

  const topics = getTopicsBySubject(subject.name);

  const groups = new Map<string, PaperGroup>();
  for (const topic of topics) {
    const paper = getPaperById(topic.paperId);
    if (!paper) continue;

    const subtopics = getSubtopicsByTopicId(topic.id);
    const flashcardCount = subtopics.reduce(
      (sum, subtopic) => sum + getFlashcards(paper.slug, topic.slug, subtopic.slug).length,
      0
    );

    const group = groups.get(paper.id) ?? { paper: { slug: paper.slug, name: paper.name }, topics: [] };
    group.topics.push({
      slug: topic.slug,
      name: topic.name,
      meta: `${flashcardCount} card${flashcardCount === 1 ? "" : "s"}`,
    });
    groups.set(paper.id, group);
  }

  return (
    <div className="py-16">
      <Link href="/flashcards" className="text-sm font-medium text-blue-600 hover:underline">
        &larr; Flashcards
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">
        {subject.name}
      </h1>
      <p className="mt-2 text-slate-600">
        Browse the specification &mdash; expand a paper and select a topic to study.
      </p>

      <SectionSubjectTree groups={Array.from(groups.values())} basePath="" />
    </div>
  );
}
