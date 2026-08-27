import { getSubjectCards } from "@/lib/subjects";
import { getTopicsBySubject, getSubtopicsByTopicId, getPaperById, getQuestions } from "@/lib/content";
import { getSubjectStyle } from "@/lib/subject-styles";
import QuestionSubjectCard from "@/components/QuestionSubjectCard";

export default function QuestionsHubPage() {
  const subjects = getSubjectCards("/questions");

  return (
    <div className="py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Practice Questions</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">
        Test yourself, topic by topic
      </h1>
      <p className="mt-2 text-slate-600">
        Pick a subject to start a focused question session &mdash; one question at a time, with the
        mark scheme a click away.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {subjects.map((subject) => {
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
              icon={<subject.Icon className={`mt-0.5 h-6 w-6 shrink-0 ${subject.iconClassName}`} />}
              iconClassName={subject.iconClassName}
              borderClassName={subject.borderClassName}
              hoverBgClassName={subject.hoverBgClassName}
              progressBarClassName={getSubjectStyle(subject.slug).progressBar}
              subtopicIds={subtopicIds}
              totalQuestions={totalQuestions}
            />
          );
        })}
      </div>
    </div>
  );
}
