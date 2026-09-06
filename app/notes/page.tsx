import { getNotesSubjectCards } from "@/lib/subjects";
import SubjectSquareCard from "@/components/SubjectSquareCard";

export default function NotesHubPage() {
  const subjects = getNotesSubjectCards();

  return (
    <div className="flex min-h-[70vh] flex-col justify-center py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Notes</p>
      <h1 className="mt-1 font-serif text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
        Read condensed revision notes
      </h1>
      <p className="mt-2 text-slate-600">Choose a subject to browse notes.</p>

      <div className="mx-auto mt-8 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
        {subjects.map((subject, index) => (
          <SubjectSquareCard
            key={subject.slug}
            name={subject.name}
            subtitle={subject.subtitle}
            href={subject.href}
            icon={<subject.Icon className={`h-6 w-6 ${subject.onSolidIconClassName}`} />}
            solidBgClassName={subject.solidBgClassName}
            borderClassName={subject.borderClassName}
            onSolidTextClassName={subject.onSolidTextClassName}
            onSolidSubtextClassName={subject.onSolidSubtextClassName}
            onSolidFillClassName={subject.onSolidFillClassName}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
