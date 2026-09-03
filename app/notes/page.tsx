import { getNotesSubjectCards } from "@/lib/subjects";
import NotesSubjectCard from "@/components/NotesSubjectCard";

export default function NotesHubPage() {
  const subjects = getNotesSubjectCards();

  return (
    <div className="py-16">
      <p className="text-sm font-medium text-blue-600">Notes</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-slate-900">
        Read condensed revision notes
      </h1>
      <p className="mt-2 text-slate-600">Choose a subject to browse notes.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {subjects.map((subject, index) => (
          <NotesSubjectCard
            key={subject.slug}
            name={subject.name}
            subtitle={subject.subtitle}
            href={subject.href}
            Icon={subject.Icon}
            iconClassName={subject.iconClassName}
            accentBarClassName={subject.progressBarClassName}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
