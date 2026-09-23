"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import type { PastPaper } from "@/types/content";

type Props = {
  papers: PastPaper[];
};

type PaperFilter = "all" | 1 | 2;
type SortDir = "asc" | "desc";

function ExternalLink({ href, label }: { href?: string; label: string }) {
  if (!href) {
    return <span className="text-slate-400">Not available</span>;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-blue-600 hover:underline"
    >
      {label}
    </a>
  );
}

export default function PastPapersTable({ papers }: Props) {
  const [paperFilter, setPaperFilter] = useState<PaperFilter>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const years = useMemo(
    () => Array.from(new Set(papers.map((p) => p.year))).sort((a, b) => b - a),
    [papers]
  );

  const filtered = useMemo(() => {
    let list = papers;
    if (paperFilter !== "all") list = list.filter((p) => p.paper === paperFilter);
    if (yearFilter !== "all") list = list.filter((p) => p.year === parseInt(yearFilter, 10));
    return [...list].sort((a, b) => (sortDir === "desc" ? b.year - a.year : a.year - b.year));
  }, [papers, paperFilter, yearFilter, sortDir]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700"
        >
          <option value="all">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <div className="flex rounded-md border border-slate-200 text-sm">
          {(["all", 1, 2] as PaperFilter[]).map((p) => (
            <button
              key={String(p)}
              onClick={() => setPaperFilter(p)}
              className={`px-3 py-2 ${
                paperFilter === p ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
              } ${p === "all" ? "rounded-l-md" : p === 2 ? "rounded-r-md" : ""}`}
            >
              {p === "all" ? "Both papers" : `Paper ${p}`}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-4 rounded-lg border border-slate-200 px-4 py-8 text-center text-slate-400">
          No past papers to show yet.
        </p>
      ) : (
        <>
          {/* Below sm: a table wide enough for five columns just pushes the
              later columns off-screen with no obvious way to reach them (they
              look missing, not scrollable). Each paper becomes its own card
              instead, so every link stays reachable by normal vertical
              scrolling. */}
          <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200 sm:hidden">
            {filtered.map((p) => (
              <div key={p.id} className="px-4 py-3">
                <p className="font-medium text-slate-800">
                  {p.year}
                  {p.session ? ` (${p.session})` : ""} &middot; Paper {p.paper}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <ExternalLink href={p.questionPaperUrl} label="Question Paper" />
                  <ExternalLink href={p.markSchemeUrl} label="Mark Scheme" />
                  <ExternalLink href={p.examinerReportUrl} label="Examiner Report" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 hidden max-h-[70vh] overflow-auto rounded-lg border border-slate-200 sm:block">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">
                    <button
                      onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
                      className="flex items-center gap-1 hover:text-slate-900"
                    >
                      Year <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">Paper</th>
                  <th className="px-4 py-3 font-medium">Question Paper</th>
                  <th className="px-4 py-3 font-medium">Mark Scheme</th>
                  <th className="px-4 py-3 font-medium">Examiner Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="even:bg-slate-50 hover:bg-slate-100 transition-colors duration-150"
                  >
                    <td className="px-4 py-3 text-slate-800">
                      {p.year}
                      {p.session ? ` (${p.session})` : ""}
                    </td>
                    <td className="px-4 py-3 text-slate-800">Paper {p.paper}</td>
                    <td className="px-4 py-3">
                      <ExternalLink href={p.questionPaperUrl} label="Question Paper" />
                    </td>
                    <td className="px-4 py-3">
                      <ExternalLink href={p.markSchemeUrl} label="Mark Scheme" />
                    </td>
                    <td className="px-4 py-3">
                      <ExternalLink href={p.examinerReportUrl} label="Examiner Report" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
