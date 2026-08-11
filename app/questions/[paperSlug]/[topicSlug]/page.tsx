import { notFound } from "next/navigation";
import { getPaperBySlug, getTopicBySlug, getSubtopicsByTopicId, getQuestions } from "@/lib/content";
import { slugify } from "@/lib/slug";
import SubtopicList from "@/components/SubtopicList";
import { getSubjectStyle } from "@/lib/subject-styles";

export default async function QuestionsTopicPage(props: PageProps<"/questions/[paperSlug]/[topicSlug]">) {
  const { paperSlug, topicSlug } = await props.params;
  const paper = getPaperBySlug(paperSlug);
  const topic = getTopicBySlug(topicSlug);
  if (!paper || !topic || topic.paperId !== paper.id) notFound();

  const subtopics = getSubtopicsByTopicId(topic.id);
  const items = subtopics.map((subtopic) => {
    const count = getQuestions(paper.slug, topic.slug, subtopic.slug).length;
    return {
      slug: subtopic.slug,
      name: subtopic.name,
      subtitle: `${count} question${count === 1 ? "" : "s"}`,
    };
  });

  return (
    <SubtopicList
      title={topic.name}
      backHref={`/questions/${slugify(topic.subject)}`}
      backLabel="Practice Questions"
      basePath={`/questions/${paper.slug}/${topic.slug}`}
      items={items}
      hoverBgClassName={getSubjectStyle(slugify(topic.subject)).hoverBg}
    />
  );
}
