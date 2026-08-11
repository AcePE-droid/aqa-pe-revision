import Link from "next/link";
import { notFound } from "next/navigation";
import { getPaperBySlug, getTopicsByPaperId, getSubtopicsByTopicId } from "@/lib/content";

export default async function PaperPage(props: PageProps<"/[paperSlug]">) {
  const { paperSlug } = await props.params;
  const paper = getPaperBySlug(paperSlug);
  if (!paper) notFound();

  const topics = getTopicsByPaperId(paper.id);

  const subjects = new Map<string, typeof topics>();
  for (const topic of topics) {
    const list = subjects.get(topic.subject) ?? [];
    list.push(topic);
    subjects.set(topic.subject, list);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-blue-600">{paper.name}</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-slate-900">
        Topics
      </h1>

      <div className="mt-10 flex flex-col gap-10">
        {Array.from(subjects.entries()).map(([subject, subjectTopics]) => (
          <div key={subject}>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {subject}
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {subjectTopics.map((topic) => {
                const subtopicCount = getSubtopicsByTopicId(topic.id).length;
                return (
                  <Link
                    key={topic.id}
                    href={`/${paper.slug}/${topic.slug}`}
                    className="rounded-lg border border-slate-200 p-5 hover:border-blue-300 hover:bg-blue-50/50"
                  >
                    <h3 className="text-lg font-semibold text-slate-900">{topic.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {subtopicCount} subtopic{subtopicCount === 1 ? "" : "s"}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
