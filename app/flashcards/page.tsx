import Link from "next/link";
import { HeartPulse, Brain, Users2, type LucideIcon } from "lucide-react";
import { getSubjects, getTopicsBySubject } from "@/lib/content";

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  "Anatomy & Physiology": HeartPulse,
  "Sports Psychology": Brain,
  "Sport, Society & History": Users2,
};

export default function FlashcardsHubPage() {
  const subjects = getSubjects();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-blue-600">Flashcards</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-slate-900">
        Study with interactive flashcards
      </h1>
      <p className="mt-2 text-slate-600">Browse by subject to find flashcard sets for every topic.</p>

      <div className="mt-8 flex flex-col gap-3">
        {subjects.map((subject) => {
          const topics = getTopicsBySubject(subject.name);
          const Icon = SUBJECT_ICONS[subject.name] ?? Brain;
          const subtitle = topics.map((t) => t.name).join(", ");
          return (
            <Link
              key={subject.slug}
              href={`/flashcards/${subject.slug}`}
              className="flex items-start gap-4 rounded-lg border border-slate-200 p-5 hover:border-blue-300 hover:bg-blue-50/50"
            >
              <Icon className="mt-0.5 h-6 w-6 shrink-0 text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{subject.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
