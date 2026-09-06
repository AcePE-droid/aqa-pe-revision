import { getSubjectCards } from "@/lib/subjects";
import { getTopicsBySubject, getSubtopicsByTopicId, getPaperById, getQuestions } from "@/lib/content";
import QuestionSubjectCard from "@/components/QuestionSubjectCard";

export default function QuestionsHubPage() {
  const subjects = getSubjectCards("/questions");

  return (
    <div className="flex min-h-[70vh] flex-col justify-center py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Practice Questions</p>
      <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
        Test yourself, topic by topic
      </h1>
      <p className="mx-auto mt-2 max-w-2xl text-slate-600">
        Pick a subject to start a focused question session &mdash; one question at a time, with the
        mark scheme a click away.
      </p>

      <div className="mx-auto mt-8 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
        {subjects.map((subject, index) => {
          const subtopicIds: string[] = [];
          let totalQuestions = 0;
          for (const topic of getTopicsBySubject(subject.name)) {
            const paper = getPaperById(topic.paperId);
            if (!paper) continue;
            for (const subtopic of getSubtopicsByTopicId(topic.id)) {
              subtopicIds.push(subtopic.id);
              totalQuestions += getQuestions(paper.slug, topic.slug, subtopic.slug).length;
            }
          }

          return (
            <QuestionSubjectCard
              key={subject.slug}
              name={subject.name}
              subtitle={subject.subtitle}
              href={subject.href}
              icon={<subject.Icon className={`h-6 w-6 ${subject.onSolidIconClassName}`} />}
              borderClassName={subject.borderClassName}
              solidBgClassName={subject.solidBgClassName}
              onSolidTextClassName={subject.onSolidTextClassName}
              onSolidSubtextClassName={subject.onSolidSubtextClassName}
              onSolidTrackClassName={subject.onSolidTrackClassName}
              onSolidFillClassName={subject.onSolidFillClassName}
              subtopicIds={subtopicIds}
              totalQuestions={totalQuestions}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}
