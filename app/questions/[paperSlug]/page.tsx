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

export default async function QuestionsSubjectPage(props: PageProps<"/questions/[paperSlug]">) {
  const { paperSlug: subjectSlug } = await props.params;
  const subject = getSubjectBySlug(subjectSlug);
  if (!subject) notFound();

  const topics = getTopicsBySubject(subject.name);

  const groups = new Map<string, PaperGroup>();
  for (const topic of topics) {
    const paper = getPaperById(topic.paperId);
    if (!paper) continue;

    const subtopics = getSubtopicsByTopicId(topic.id);
    let topicQuestionCount = 0;
    const subtopicItems = subtopics.map((subtopic) => {
      const count = getQuestions(paper.slug, topic.slug, subtopic.slug).length;
      topicQuestionCount += count;
      return {
        slug: subtopic.slug,
        name: subtopic.name,
        href: `/${paper.slug}/${topic.slug}/${subtopic.slug}/questions`,
        meta: `${count} question${count === 1 ? "" : "s"}`,
      };
    });

    const group = groups.get(paper.id) ?? { paper: { slug: paper.slug, name: paper.name }, topics: [] };
    group.topics.push({
      slug: topic.slug,
      name: topic.name,
      href: `/${paper.slug}/${topic.slug}/questions`,
      meta: `${topicQuestionCount} question${topicQuestionCount === 1 ? "" : "s"}`,
      subtopics: subtopicItems,
    });
    groups.set(paper.id, group);
  }

  return (
    <div className="py-16">
      <Link href="/questions" className="text-sm font-medium text-blue-600 hover:underline">
        &larr; Practice Questions
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">
        {subject.name}
      </h1>
      <p className="mt-2 text-slate-600">
        Click a topic to start a question session, or expand it to practise a single subtopic.
      </p>

      <SectionSubjectTree groups={Array.from(groups.values())} subjectSlug={subjectSlug} />
    </div>
  );
}
