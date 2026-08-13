import {
  getSubjects,
  getTopicsBySubject,
  getPaperById,
  getSubtopicsByTopicId,
  getNotesMarkdown,
} from "@/lib/content";
import NotesSidebar, { type NotesSubject } from "@/components/NotesSidebar";

function buildNotesTree(): NotesSubject[] {
  return getSubjects().map((subject) => ({
    slug: subject.slug,
    name: subject.name,
    topics: getTopicsBySubject(subject.name)
      .map((topic) => {
        const paper = getPaperById(topic.paperId);
        if (!paper) return null;
        return {
          slug: topic.slug,
          name: topic.name,
          paperName: paper.name,
          subtopics: getSubtopicsByTopicId(topic.id).map((subtopic) => ({
            slug: subtopic.slug,
            name: subtopic.name,
            href: `/notes/${paper.slug}/${topic.slug}/${subtopic.slug}`,
            hasNotes: getNotesMarkdown(paper.slug, topic.slug, subtopic.slug) !== null,
          })),
        };
      })
      .filter((topic): topic is NonNullable<typeof topic> => topic !== null),
  }));
}

export default function NotesLayout({ children }: LayoutProps<"/notes">) {
  const subjects = buildNotesTree();

  return (
    <div className="flex flex-col gap-8 py-16 md:flex-row md:items-start">
      <NotesSidebar subjects={subjects} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
