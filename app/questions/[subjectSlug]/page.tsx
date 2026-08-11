import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSubjectBySlug,
  getTopicsBySubject,
  getPaperById,
  getSubtopicsByTopicId,
  getQuestions,
} from "@/lib/content";
import SectionSubjectTree, { type PaperGroup } from "@/components/SectionSubjectTree";

export default async function QuestionsSubjectPage(props: PageProps<"/questions/[subjectSlug]">) {
  const { subjectSlug } = await props.params;
  const subject = getSubjectBySlug(subjectSlug);
  if (!subject) notFound();

  const topics = getTopicsBySubject(subject.name);

  const groups = new Map<string, PaperGroup>();
  for (const topic of topics) {
    const paper = getPaperById(topic.paperId);
    if (!paper) continue;

    const subtopics = getSubtopicsByTopicId(topic.id);
    const questionCount = subtopics.reduce(
      (sum, subtopic) => sum + getQuestions(paper.slug, topic.slug, subtopic.slug).length,
      0
    );

    const group = groups.get(paper.id) ?? { paper: { slug: paper.slug, name: paper.name }, topics: [] };
    group.topics.push({
      slug: topic.slug,
      name: topic.name,
      meta: `${questionCount} question${questionCount === 1 ? "" : "s"}`,
    });
    groups.set(paper.id, group);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link href="/questions" className="text-sm font-medium text-blue-600 hover:underline">
        &larr; Practice Questions
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">
        {subject.name}
      </h1>
      <p className="mt-2 text-slate-600">
        Browse the specification &mdash; expand a paper and select a topic to practise.
      </p>

      <SectionSubjectTree groups={Array.from(groups.values())} basePath="/questions" />
    </div>
  );
}
