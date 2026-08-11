import { notFound } from "next/navigation";
import { getPaperBySlug, getTopicBySlug, getSubtopicsByTopicId, getNotesMarkdown } from "@/lib/content";
import { slugify } from "@/lib/slug";
import SubtopicList from "@/components/SubtopicList";
import { getSubjectStyle } from "@/lib/subject-styles";

export default async function NotesTopicPage(props: PageProps<"/notes/[paperSlug]/[topicSlug]">) {
  const { paperSlug, topicSlug } = await props.params;
  const paper = getPaperBySlug(paperSlug);
  const topic = getTopicBySlug(topicSlug);
  if (!paper || !topic || topic.paperId !== paper.id) notFound();

  const subtopics = getSubtopicsByTopicId(topic.id);
  const items = subtopics.map((subtopic) => ({
    slug: subtopic.slug,
    name: subtopic.name,
    subtitle: getNotesMarkdown(paper.slug, topic.slug, subtopic.slug) ? "Notes available" : "Not added yet",
  }));

  return (
    <SubtopicList
      title={topic.name}
      backHref={`/notes/${slugify(topic.subject)}`}
      backLabel="Notes"
      basePath={`/notes/${paper.slug}/${topic.slug}`}
      items={items}
      hoverBgClassName={getSubjectStyle(slugify(topic.subject)).hoverBg}
    />
  );
}
