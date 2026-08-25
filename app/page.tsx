import Link from "next/link";
import { ChevronDown } from "lucide-react";
import AccountDeletedToast from "@/components/AccountDeletedToast";
import WhatsInsideSection from "@/components/WhatsInsideSection";
import { getTotalFlashcardCount } from "@/lib/content";

export default function Home() {
  const flashcardCount = getTotalFlashcardCount();

  return (
    <div>
      <AccountDeletedToast />

      <section className="flex min-h-[60vh] flex-col items-center px-4 text-center">
        <div className="flex flex-1 flex-col items-center justify-center">
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
            spec. Made by a former student, for students. Free forever.
          </p>
          <Link
            href="/flashcards"
            className="mt-8 inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
          >
            Start revising
          </Link>
        </div>

        <Link
          href="#whats-inside"
          aria-label="Scroll to learn more"
          className="pb-10 text-slate-400 hover:text-slate-600"
        >
          <ChevronDown className="hero-scroll-indicator h-6 w-6" />
        </Link>
      </section>

      <WhatsInsideSection flashcardCount={flashcardCount} />

      <section id="why" className="scroll-mt-24 border-t border-slate-200 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-slate-600 sm:text-3xl">
            Why this exists
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-600">
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
