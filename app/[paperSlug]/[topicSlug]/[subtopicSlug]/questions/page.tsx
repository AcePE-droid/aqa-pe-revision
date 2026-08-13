import { notFound } from "next/navigation";
import { resolveSubtopicPath, getQuestions } from "@/lib/content";
import { slugify } from "@/lib/slug";
import QuestionSession from "@/components/QuestionSession";

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
      backHref={`/questions/${slugify(topic.subject)}`}
      questions={questions}
    />
  );
}
