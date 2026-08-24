import Link from "next/link";
import { Layers, ClipboardCheck, BookOpen } from "lucide-react";
import SubjectCard from "@/components/SubjectCard";
import ContentTypeCard from "@/components/ContentTypeCard";
import AccountDeletedToast from "@/components/AccountDeletedToast";
import { getFlashcardSubjectCards } from "@/lib/subjects";

export default function Home() {
  const subjects = getFlashcardSubjectCards();

  return (
    <div className="pb-20">
      <AccountDeletedToast />

      <div className="pt-20 text-center sm:text-left">
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          AQA A-Level PE Revision, Simplified
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
          Free flashcards, practice questions, and revision notes for every topic on the AQA
          A-Level PE (7582) spec. Made by a former student, for students.
        </p>
        <Link
          href="#subjects"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
        >
          Start Revising
        </Link>
      </div>

      <section className="mt-16 border-t border-slate-200 pt-16 sm:mt-20 sm:pt-20">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          What you get
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <ContentTypeCard
            Icon={Layers}
            heading="Flashcards"
            body="Study every topic with a Quizlet-style flip flow. Mark cards as known or still learning. Your progress syncs across devices when you sign in."
          />
          <ContentTypeCard
            Icon={ClipboardCheck}
            heading="Practice Questions"
            body="Exam-style questions with full mark schemes. Write your answer, reveal the mark scheme, see exactly what examiners want."
          />
          <ContentTypeCard
            Icon={BookOpen}
            heading="Revision Notes"
            body="Clear, concise notes for each subtopic, written in plain English. No fluff, no padding, no ads."
          />
        </div>
        <p className="mt-8 text-center text-sm font-medium text-slate-500">
          All free. All in one place. All matched to the AQA 7582 spec.
        </p>
      </section>

      <section id="subjects" className="scroll-mt-24 border-t border-slate-200 pt-16 sm:pt-20">
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
              hoverBorderClassName={subject.hoverBorderClassName}
              hoverBgClassName={subject.hoverBgClassName}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 pt-16 sm:pt-20">
        <div className="max-w-2xl">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Why this exists
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            When I studied A-Level PE, I couldn&rsquo;t find a single revision resource that
            covered exactly the AQA spec without being bloated with ads, locked behind paywalls,
            or watered down for GCSE students. Most of my revision came from cobbling together
            bits of textbooks, YouTube, and Quizlet decks made by other students.
          </p>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            PE Revision exists so the next cohort doesn&rsquo;t have to do that. It&rsquo;s free
            forever, focused on exactly one qualification, and built by someone who sat the exam
            and knows what actually mattered.
          </p>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-16 text-center sm:pt-20">
        <p className="text-sm font-medium text-slate-500">Ready to start?</p>
        <Link
          href="#subjects"
          className="mt-4 inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
        >
          Start Revising
        </Link>
      </section>
    </div>
  );
}
