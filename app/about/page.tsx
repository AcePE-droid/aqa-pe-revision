import ResetProgressButton from "@/components/ResetProgressButton";

export default function AboutPage() {
  return (
    <div className="py-16">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">About</h1>

      <div className="mt-6 flex flex-col gap-4 text-slate-700">
        <p>
          This site was built by a former AQA A-Level PE student who felt there wasn&apos;t
          enough clear, structured revision material for this course. It&apos;s free, and always
          will be.
        </p>
        <p>
          Everything here &mdash; flashcards, practice questions, and notes &mdash; is organised
          by the official AQA specification (7582), so you can revise topic by topic and know
          you&apos;re covering what&apos;s actually examinable.
        </p>
        <p className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <strong className="text-slate-800">Disclaimer:</strong> This is an independent,
          student-made resource. It is not affiliated with, endorsed by, or produced by AQA.
          Notes are written in the site owner&apos;s own words as a study aid, not a substitute
          for your textbook or official spec.
        </p>
      </div>

      <div className="mt-10 border-t border-slate-200 pt-6">
        <h2 className="text-sm font-semibold text-slate-900">Your progress</h2>
        <p className="mt-1 text-sm text-slate-500">
          Flashcard and question progress is stored only in your browser, on this device.
        </p>
        <div className="mt-3">
          <ResetProgressButton />
        </div>
      </div>
    </div>
  );
}
