import Link from "next/link";
import AccountDeletedToast from "@/components/AccountDeletedToast";
import WhatsInsideSection from "@/components/WhatsInsideSection";
import { getTotalFlashcardCount } from "@/lib/content";

export default function Home() {
  const flashcardCount = getTotalFlashcardCount();

  return (
    <div>
      <AccountDeletedToast />

      <section className="flex min-h-[30vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="font-serif text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl md:text-7xl">
          All your A-Level PE revision,
          <br />
          <span className="relative inline-block">
            in one place
            <span
              aria-hidden="true"
              className="hero-underline absolute inset-x-0 -bottom-1 h-1 rounded-full bg-blue-600"
            />
          </span>
          .
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
          Flashcards, practice questions, and revision notes for every topic on the AQA (7582)
          spec. Made by a student, for future students.
        </p>
        <Link
          href="/flashcards"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
        >
          Start revising - it&rsquo;s free!
        </Link>
      </section>

      <WhatsInsideSection flashcardCount={flashcardCount} />

      <section id="why" className="scroll-mt-24 border-t border-slate-200 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-slate-600 sm:text-3xl">
            Why this exists
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            When I studied A-Level PE, I couldn&rsquo;t find an online revision resource with
            organised, clean material to learn from. That led me to spend hours making my own
            notes and flashcards &mdash; time that should have gone into actually revising.
          </p>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            AcePE exists so the next cohort doesn&rsquo;t have to do that. Many sections are free
            and built to help you get the grade you want, made by someone who sat the exam and
            knew exactly what was missing.
          </p>
          <Link
            href="/flashcards"
            className="mt-8 inline-flex items-center justify-center rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Explore the site
          </Link>
        </div>
      </section>
    </div>
  );
}
