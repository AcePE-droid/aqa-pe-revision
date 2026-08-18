import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSubjectBySlug,
  getTopicsBySubject,
  getPaperById,
  getSubtopicsByTopicId,
  getQuestions,
} from "@/lib/content";
import QuestionTopicCard from "@/components/QuestionTopicCard";
import { getSubjectStyle } from "@/lib/subject-styles";

type PaperSection = {
  paper: { slug: string; name: string };
  cards: { slug: string; name: string; href: string; total: number }[];
};

export default async function QuestionsSubjectPage(props: PageProps<"/questions/[paperSlug]">) {
  const { paperSlug: subjectSlug } = await props.params;
  const subject = getSubjectBySlug(subjectSlug);
  if (!subject) notFound();

  const topics = getTopicsBySubject(subject.name);
  const style = getSubjectStyle(subject.slug);

  // "Topic" cards, in the sense the practice-questions UI uses the word, are
  // spec subtopics (e.g. "Cardiovascular System") - not this codebase's
  // internal Topic entity (e.g. "Applied Anatomy & Physiology"), which is one
  // level up and deliberately not shown here. So subtopics across all of a
  // paper's Topics are flattened into one flat grid under that paper's
  // heading, skipping the intermediate grouping entirely.
  const sections = new Map<string, PaperSection>();
  for (const topic of topics) {
    const paper = getPaperById(topic.paperId);
    if (!paper) continue;

    const section = sections.get(paper.id) ?? {
      paper: { slug: paper.slug, name: paper.name },
      cards: [],
    };

    for (const subtopic of getSubtopicsByTopicId(topic.id)) {
      const total = getQuestions(paper.slug, topic.slug, subtopic.slug).length;
      section.cards.push({
        slug: subtopic.slug,
        name: subtopic.name,
        href: `/${paper.slug}/${topic.slug}/${subtopic.slug}/questions`,
        total,
      });
    }
    sections.set(paper.id, section);
  }

  return (
    <div className="py-16">
      <Link href="/questions" className="text-sm font-medium text-blue-600 hover:underline">
        &larr; Practice Questions
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">
        {subject.name}
      </h1>
      <p className="mt-2 text-slate-600">Choose a topic to practise questions from.</p>

      <div className="mt-8 flex flex-col gap-10">
        {Array.from(sections.values()).map(({ paper, cards }) => (
          <div key={paper.slug}>
            <h2 className="text-sm font-medium text-slate-500">{paper.name}</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {cards.map((card) => (
                <QuestionTopicCard
                  key={card.slug}
                  name={card.name}
                  href={card.href}
                  total={card.total}
                  hoverBorderClassName={style.hoverBorder}
                  hoverBgClassName={style.hoverBg}
                  arrowClassName={style.icon}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
