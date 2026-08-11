import { getPastPapers } from "@/lib/content";
import PastPapersTable from "@/components/PastPapersTable";

export default function PastPapersPage() {
  const papers = getPastPapers();

  return (
    <div className="py-16">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">
        Past Papers
      </h1>
      <p className="mt-2 max-w-xl text-slate-600">
        Official AQA A-Level PE (7582) past papers and mark schemes. Links open the original
        source in a new tab &mdash; nothing is hosted on this site.
      </p>

      <div className="mt-8">
        <PastPapersTable papers={papers} />
      </div>
    </div>
  );
}
