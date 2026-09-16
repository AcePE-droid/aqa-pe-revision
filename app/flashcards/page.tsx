import type { Metadata } from "next";
import { getFlashcardSubjectCards } from "@/lib/subjects";
import SubjectSquareCard from "@/components/SubjectSquareCard";

export const metadata: Metadata = {
  title: "A-Level PE Flashcards",
  description:
    "Free interactive flashcards for AQA A-Level PE (7582), organised by subject and topic across anatomy and physiology, sports psychology, and sport and society.",
  alternates: { canonical: "/flashcards" },
};

export default function FlashcardsHubPage() {
  const subjects = getFlashcardSubjectCards();

  return (
    <div className="flex min-h-[70vh] flex-col justify-center py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Flashcards</p>
      <h1 className="mt-1 font-serif text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
        Study with interactive flashcards
      </h1>
      <p className="mt-2 text-slate-600">Browse by subject to find flashcard sets for every topic.</p>

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
