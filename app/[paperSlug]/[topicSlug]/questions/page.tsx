import { notFound } from "next/navigation";
import { getPaperBySlug, getTopicBySlug, getSubtopicsByTopicId, getQuestions } from "@/lib/content";
import { slugify } from "@/lib/slug";
import QuestionSession from "@/components/QuestionSession";

export default async function TopicQuestionSessionPage(
  props: PageProps<"/[paperSlug]/[topicSlug]/questions">
) {
  const { paperSlug, topicSlug } = await props.params;
  const paper = getPaperBySlug(paperSlug);
  const topic = getTopicBySlug(topicSlug);
  if (!paper || !topic || topic.paperId !== paper.id) notFound();

  const subtopics = getSubtopicsByTopicId(topic.id);
  const questions = subtopics.flatMap((subtopic) =>
    getQuestions(paper.slug, topic.slug, subtopic.slug)
  );

  return (
    <QuestionSession
      breadcrumb={topic.name}
      subjectSlug={slugify(topic.subject)}
      backHref={`/questions/${slugify(topic.subject)}`}
      questions={questions}
    />
  );
}
