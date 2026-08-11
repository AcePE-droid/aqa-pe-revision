import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSubjectBySlug,
  getTopicsBySubject,
  getPaperById,
  getSubtopicsByTopicId,
  getFlashcards,
} from "@/lib/content";
import TopicCard from "@/components/TopicCard";

type PaperSection = {
  paper: { slug: string; name: string };
  topics: {
    slug: string;
    name: string;
    href: string;
    subtopicIds: string[];
    total: number;
  }[];
};

export default async function FlashcardSubjectPage(
  props: PageProps<"/flashcards/[subjectSlug]">
) {
  const { subjectSlug } = await props.params;
  const subject = getSubjectBySlug(subjectSlug);
  if (!subject) notFound();

  const topics = getTopicsBySubject(subject.name);

  const sections = new Map<string, PaperSection>();
  for (const topic of topics) {
    const paper = getPaperById(topic.paperId);
    if (!paper) continue;

    const subtopics = getSubtopicsByTopicId(topic.id);
    const total = subtopics.reduce(
      (sum, subtopic) => sum + getFlashcards(paper.slug, topic.slug, subtopic.slug).length,
      0
    );

    const section = sections.get(paper.id) ?? {
      paper: { slug: paper.slug, name: paper.name },
      topics: [],
    };
    section.topics.push({
      slug: topic.slug,
      name: topic.name,
      href: `/${paper.slug}/${topic.slug}`,
      subtopicIds: subtopics.map((s) => s.id),
      total,
    });
    sections.set(paper.id, section);
  }

  return (
    <div className="py-16">
      <Link href="/flashcards" className="text-sm font-medium text-blue-600 hover:underline">
        &larr; Flashcards
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">
        {subject.name}
      </h1>
      <p className="mt-2 text-slate-600">Choose a topic to start studying.</p>

      <div className="mt-8 flex flex-col gap-10">
        {Array.from(sections.values()).map(({ paper, topics }) => (
          <div key={paper.slug}>
            <h2 className="text-sm font-medium text-slate-500">{paper.name}</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {topics.map((topic) => (
                <TopicCard
                  key={topic.slug}
                  name={topic.name}
                  href={topic.href}
                  subtopicIds={topic.subtopicIds}
                  total={topic.total}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
