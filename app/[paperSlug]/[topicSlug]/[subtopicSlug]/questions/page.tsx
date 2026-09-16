import { notFound } from "next/navigation";
import { resolveSubtopicPath, getQuestions, getSubjectItemCounts } from "@/lib/content";
import { slugify } from "@/lib/slug";
import QuestionSession from "@/components/QuestionSession";
import type { Metadata } from "next";

export async function generateMetadata(
  props: PageProps<"/[paperSlug]/[topicSlug]/[subtopicSlug]/questions">
): Promise<Metadata> {
  const { paperSlug, topicSlug, subtopicSlug } = await props.params;
  const resolved = resolveSubtopicPath(paperSlug, topicSlug, subtopicSlug);
  if (!resolved) return {};
  const { paper, topic, subtopic } = resolved;

  return {
    title: `${subtopic.name} Practice Questions`,
    description: `Exam-style questions on ${subtopic.name} (${topic.name}) for AQA A-Level PE (7582), with mark schemes.`,
    alternates: { canonical: `/${paper.slug}/${topic.slug}/${subtopic.slug}/questions` },
  };
}

export default async function SubtopicQuestionSessionPage(
  props: PageProps<"/[paperSlug]/[topicSlug]/[subtopicSlug]/questions">
) {
  const { paperSlug, topicSlug, subtopicSlug } = await props.params;
  const resolved = resolveSubtopicPath(paperSlug, topicSlug, subtopicSlug);
  if (!resolved) notFound();
  const { paper, topic, subtopic } = resolved;

  const questions = getQuestions(paper.slug, topic.slug, subtopic.slug);

  return (
    <QuestionSession
      breadcrumb={`${topic.name} \u00b7 ${subtopic.name}`}
      subjectSlug={slugify(topic.subject)}
      subject={topic.subject}
      backHref={`/questions/${slugify(topic.subject)}`}
      questions={questions}
      subjectTotalItems={getSubjectItemCounts(topic.subject)}
    />
  );
}
