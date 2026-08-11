import Link from "next/link";
import SubjectCard from "@/components/SubjectCard";
import { getFlashcardSubjectCards } from "@/lib/subjects";

export default function Home() {
  const subjects = getFlashcardSubjectCards();

  return (
    <div className="py-20">
      <div className="text-center sm:text-left">
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          AQA A-Level PE Revision, Simplified
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
          Flashcards, practice questions, and clear notes for every topic on the AQA A-Level PE
          (7582) spec. Built by someone who sat the exam and wished this existed.
        </p>
        <Link
          href="#subjects"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
        >
          Start Revising
        </Link>
      </div>

      <div id="subjects" className="mt-16 scroll-mt-24">
        <p className="text-sm font-medium text-blue-600">Choose a subject</p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.slug}
              name={subject.name}
              subtitle={subject.subtitle}
              href={subject.href}
              Icon={subject.Icon}
              iconClassName={subject.iconClassName}
              hoverBgClassName={subject.hoverBgClassName}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
