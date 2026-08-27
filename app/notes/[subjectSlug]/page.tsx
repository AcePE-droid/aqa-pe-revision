import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSubjectBySlug,
  getTopicsBySubject,
  getPaperById,
  getSubtopicsByTopicId,
  getNotesMarkdown,
} from "@/lib/content";
import NotesTopicCard from "@/components/NotesTopicCard";
import { getSubjectStyle } from "@/lib/subject-styles";

type PaperSection = {
  paper: { slug: string; name: string };
  topics: {
    slug: string;
    name: string;
    href: string;
    withNotes: number;
    total: number;
  }[];
};

export default async function NotesSubjectPage(props: PageProps<"/notes/[subjectSlug]">) {
  const { subjectSlug } = await props.params;
  const subject = getSubjectBySlug(subjectSlug);
  if (!subject) notFound();

  const topics = getTopicsBySubject(subject.name);
  const style = getSubjectStyle(subject.slug);

  const sections = new Map<string, PaperSection>();
  for (const topic of topics) {
    const paper = getPaperById(topic.paperId);
    if (!paper) continue;

    const subtopics = getSubtopicsByTopicId(topic.id);
    const withNotes = subtopics.filter(
      (subtopic) => getNotesMarkdown(paper.slug, topic.slug, subtopic.slug) !== null
    ).length;

    const section = sections.get(paper.id) ?? {
      paper: { slug: paper.slug, name: paper.name },
      topics: [],
    };
    section.topics.push({
      slug: topic.slug,
      name: topic.name,
      href: `/notes/${subject.slug}/${topic.slug}`,
      withNotes,
      total: subtopics.length,
    });
    sections.set(paper.id, section);
  }

  return (
    <div className="py-16">
      <Link href="/notes" className="text-sm font-medium text-blue-600 hover:underline">
        &larr; Notes
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">
        {subject.name}
      </h1>
      <p className="mt-2 text-slate-600">Choose a topic to browse notes.</p>

      <div className="mt-8 flex flex-col gap-10">
        {(() => {
          // Chapters number continuously across the whole subject (paper
          // sections are just visual groupings), textbook-style.
          let chapter = 0;
          return Array.from(sections.values()).map(({ paper, topics }) => (
            <div key={paper.slug}>
              <h2 className="text-sm font-medium text-slate-500">{paper.name}</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {topics.map((topic) => {
                  chapter += 1;
                  return (
                    <NotesTopicCard
                      key={topic.slug}
                      index={chapter}
                      name={topic.name}
                      href={topic.href}
                      withNotes={topic.withNotes}
                      total={topic.total}
                      borderClassName={style.border}
                      hoverBgClassName={style.hoverBg}
                      arrowClassName={style.icon}
                    />
                  );
                })}
              </div>
            </div>
          ));
        })()}
      </div>
    </div>
  );
}
