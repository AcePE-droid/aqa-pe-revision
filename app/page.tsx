import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <div className="text-center sm:text-left">
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          AQA A-Level PE Revision, Simplified
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
          Flashcards, practice questions, and clear notes for every topic on the AQA A-Level PE
          (7582) spec. Built by someone who sat the exam and wished this existed.
        </p>
        <Link
          href="/flashcards"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
        >
          Start Revising
        </Link>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2">
        <Link
          href="/flashcards"
          className="rounded-lg border border-slate-200 p-6 hover:border-blue-300 hover:bg-blue-50/50"
        >
          <h2 className="text-lg font-semibold text-slate-900">Flashcards</h2>
          <p className="mt-1 text-sm text-slate-500">Browse by subject and study with active recall</p>
        </Link>
        <Link
          href="/past-papers"
          className="rounded-lg border border-slate-200 p-6 hover:border-blue-300 hover:bg-blue-50/50"
        >
          <h2 className="text-lg font-semibold text-slate-900">Past Papers</h2>
          <p className="mt-1 text-sm text-slate-500">Official question papers &amp; mark schemes</p>
        </Link>
      </div>
    </div>
  );
}
