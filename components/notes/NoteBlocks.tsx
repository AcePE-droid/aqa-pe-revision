import {
  ArrowRight,
  Check,
  X,
  Quote,
  CheckCheck,
  ArrowDown,
  Lightbulb,
} from "lucide-react";
import type { SubjectStyle } from "@/lib/subject-styles";
import type {
  NoteBlock,
  DefinitionBlock,
  FormulaBlock,
  HowItWorksBlock,
  CompareBlock,
  ExplainerBlock,
  MixUpsBlock,
  SayItToScoreBlock,
  LockItInBlock,
  MemoryTipBlock,
  GraphBlock,
} from "@/types/notes-blocks";

// Each block type gets its own visual treatment, so a student can tell what
// kind of information they are looking at before reading a word of it. The
// two that are easiest to confuse - definition and formula - are deliberately
// built from different materials: definitions are a plain bordered stack on
// the page background, formulas are a cream panel with a heavy accent bar.

type BlockProps<T> = { block: T; style: SubjectStyle };

/** Small caps section label used above several of the blocks. */
function BlockLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-xs font-semibold uppercase tracking-widest ${className}`}>{children}</p>
  );
}

/**
 * Definitions. Deliberately not a boxed callout - a boxed callout is what the
 * textbook does, and the brief is to look different from it. Instead each term
 * hangs off a hairline rule, reading as a list rather than a box.
 */
function Definition({ block, style }: BlockProps<DefinitionBlock>) {
  return (
    <div className="my-8">
      <BlockLabel className="text-slate-600">
        {block.label ?? (block.items.length === 1 ? "Key term" : "Key terms")}
      </BlockLabel>
      <dl className="mt-3 divide-y divide-slate-200 border-t border-slate-200">
        {block.items.map((item) => (
          <div key={item.term} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-6">
            <dt className={`font-semibold leading-snug ${style.icon}`}>{item.term}</dt>
            <dd className="text-slate-700">{item.meaning}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * Keeps an operator attached to the term before it, so a line can never begin
 * with a bare "=" or "×". A long equation on a phone wraps over three or four
 * lines, and a break falling on the space before an operator leaves it
 * stranded at the start of the next line, which reads as a new equation
 * rather than a continuation. Replacing the space in front of the operator
 * with a non-breaking space moves the break to after it instead.
 */
function tieOperators(equation: string) {
  return equation.replace(/ ([=\u00d7\u00f7+\u2212]) /g, "\u00a0$1 ");
}

/**
 * Formula. Thick vertical accent bar, italic serif equation in a slate
 * blue-grey, warm cream panel, with a single plain-English line underneath.
 *
 * Built from the same bar-plus-serif-italic vocabulary as the pull quote the
 * markdown notes already used, so formulas read as part of the same family
 * rather than as a new component bolted on.
 */
function Formula({ block, style }: BlockProps<FormulaBlock>) {
  return (
    <div className="my-8 flex overflow-hidden rounded-r-lg bg-[#efe5d4]">
      <div className={`w-2 shrink-0 ${style.progressBar}`} aria-hidden="true" />
      <div className="px-5 py-5 sm:px-6">
        <p className="font-serif text-xl italic leading-snug text-slate-700 sm:text-2xl">
          {tieOperators(block.equation)}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{block.meaning}</p>
      </div>
    </div>
  );
}

function HowItWorks({ block, style }: BlockProps<HowItWorksBlock>) {
  if (block.mode === "steps") {
    return (
      <div className="my-8">
        <BlockLabel className="text-slate-600">How it works</BlockLabel>
        <ol className="mt-3 space-y-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${style.progressBar}`}
              >
                {i + 1}
              </span>
              <span className="text-slate-700">{item}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (block.mode === "sequence") {
    // A run of short labels - an airway, a line of vessels. Set inline across
    // the page rather than as a stack of boxes, which would spend a lot of
    // height on a handful of words.
    return (
      <div className="my-8">
        <BlockLabel className="text-slate-600">In order</BlockLabel>
        <ol className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="font-medium text-slate-800">{item}</span>
              {i < block.items.length - 1 && (
                <ArrowRight className={`h-4 w-4 shrink-0 ${style.icon}`} aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  // Cause-and-effect chain: each stage sits on its own line with a downward
  // link between, so the causality is visible without reading a paragraph.
  return (
    <div className="my-8">
      <BlockLabel className="text-slate-600">What causes what</BlockLabel>
      <ol className="mt-3">
        {block.items.map((item, i) => (
          <li key={i}>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-700">
              {item}
            </div>
            {i < block.items.length - 1 && (
              <div className="flex justify-center py-1" aria-hidden="true">
                <ArrowDown className={`h-4 w-4 ${style.icon}`} />
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Compare({ block }: BlockProps<CompareBlock>) {
  // A table with three or more columns, or with cells that run to a sentence,
  // squeezes down to two or three words per line on a phone. Those stack into
  // one card per row instead, with the column name as the label. Short,
  // two-column tables already fit a 375px screen, so they stay as tables.
  //
  // The cell threshold is measured rather than guessed: at 375px a two-column
  // table whose longest cell passes roughly 70 characters squeezes the first
  // column to around 120px, which wraps a column heading over four lines.
  // Below that the first column holds its width and the table still reads.
  const stackOnMobile =
    block.columns.length > 2 || block.rows.some((r) => r.some((c) => c.length > 70));

  return (
    <div className="my-8">
      <BlockLabel className="text-slate-600">Side by side</BlockLabel>
      {stackOnMobile && (
        <div className="mt-3 space-y-3 sm:hidden">
          {block.rows.map((row, ri) => (
            <div key={ri} className="rounded-lg border border-slate-200 bg-white/50 p-4">
              <p className="text-sm font-semibold text-slate-900">{row[0]}</p>
              <dl className="mt-2 space-y-2">
                {row.slice(1).map((cell, ci) =>
                  cell ? (
                    <div key={ci}>
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                        {block.columns[ci + 1]}
                      </dt>
                      <dd className="mt-0.5 text-sm text-slate-700">{cell}</dd>
                    </div>
                  ) : null,
                )}
              </dl>
            </div>
          ))}
        </div>
      )}
      {/* Wider screens keep the table. It scrolls rather than overflowing the
          page - same approach the markdown notes and PastPapersTable use. */}
      <div className={`mt-3 overflow-x-auto ${stackOnMobile ? "hidden sm:block" : ""}`}>
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-300">
              {block.columns.map((c, i) => (
                <th key={i} scope="col" className="py-2 pr-4 font-semibold text-slate-900">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, ri) => (
              <tr key={ri} className="border-b border-slate-200">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`py-3 pr-4 align-top ${ci === 0 ? "font-medium text-slate-900" : "text-slate-700"}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Connected prose. No label and no panel - this is the body text of the
 * notes, so it should read as the page itself rather than as another boxed
 * component competing with the blocks around it.
 */
function Explainer({ block }: BlockProps<ExplainerBlock>) {
  return (
    <div className="my-8 space-y-4">
      {block.paragraphs.map((p, i) => (
        <p key={i} className="text-[17px] leading-[1.75] text-slate-800">
          {p}
        </p>
      ))}
    </div>
  );
}

function MixUps({ block }: BlockProps<MixUpsBlock>) {
  return (
    <div className="my-8">
      <BlockLabel className="text-slate-600">Easy to get wrong</BlockLabel>
      <ul className="mt-3 space-y-4">
        {block.items.map((item, i) => (
          <li key={i} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="flex gap-2.5 text-slate-600">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
              <span>
                <span className="sr-only">Common mistake: </span>
                {item.wrong}
              </span>
            </p>
            <p className="mt-2 flex gap-2.5 text-slate-900">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
              <span>
                <span className="sr-only">Correct version: </span>
                {item.right}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SayItToScore({ block, style }: BlockProps<SayItToScoreBlock>) {
  // A chip only reads as a chip while it sits on one line. Some of these
  // phrases are a full clause, and inside this card a phone leaves about
  // 250px, so each one wraps to two or three lines and the wrapped row of
  // tags becomes a stack of identical full-width boxes. Sets that long drop
  // the chip treatment on narrow screens and read as a list instead, which is
  // what they already are at that width.
  const chipsFit = block.items.every((item) => item.length <= 40);

  return (
    <div className="my-8 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex gap-3">
        <Quote className={`mt-0.5 h-5 w-5 shrink-0 ${style.icon}`} aria-hidden="true" />
        <div className="min-w-0">
          <BlockLabel className={style.icon}>Say it to score</BlockLabel>
          <p className="mt-1 text-sm text-slate-600">
            The standard AQA terminology for this topic.
          </p>
          {!chipsFit && (
            <ul className="mt-3 space-y-2 sm:hidden">
              {block.items.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm font-medium text-slate-800">
                  <span aria-hidden="true" className={style.icon}>
                    &bull;
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
          <ul className={`mt-3 flex-wrap gap-2 ${chipsFit ? "flex" : "hidden sm:flex"}`}>
            {block.items.map((item, i) => (
              <li
                key={i}
                className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm font-medium text-slate-800"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function LockItIn({ block, style }: BlockProps<LockItInBlock>) {
  return (
    <div className="my-8 rounded-xl border-2 border-dashed border-slate-300 p-5">
      <div className="flex gap-3">
        <CheckCheck className={`mt-0.5 h-5 w-5 shrink-0 ${style.icon}`} aria-hidden="true" />
        <div>
          <BlockLabel className={style.icon}>Lock it in</BlockLabel>
          <ul className="mt-2 space-y-1.5">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-2 text-slate-700">
                <span aria-hidden="true" className="text-slate-500">
                  &bull;
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * A mnemonic. Third member of the same family as "Say it to score" and
 * "Lock it in", and told apart from them by what the card is made of rather
 * than only by its label: that one is solid on white, the other is a dashed
 * outline on the page, and this one is a tinted fill behind a solid accent
 * border. The tint comes from the subject's own `lightBg`, so a tip reads as
 * part of its subject rather than introducing a fourth colour to the notes.
 */
function MemoryTip({ block, style }: BlockProps<MemoryTipBlock>) {
  const labels = block.pairs?.columns.map((column, i) => (
    <div key={`label-${i}`} className="bg-white/80 px-3 py-2">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
        {column}
      </span>
    </div>
  ));

  return (
    <div className={`my-8 rounded-xl border ${style.border} ${style.lightBg} p-5`}>
      <div className="flex gap-3">
        <Lightbulb className={`mt-0.5 h-5 w-5 shrink-0 ${style.icon}`} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <BlockLabel className={style.icon}>Memory tip</BlockLabel>

          {block.intro?.map((paragraph, i) => (
            <p key={i} className={`text-sm leading-6 text-slate-700 ${i === 0 ? "mt-1" : "mt-2"}`}>
              {paragraph}
            </p>
          ))}

          {block.phrase && (
            <p className="mt-3 font-serif text-base text-slate-900">
              &ldquo;{block.phrase}&rdquo;
            </p>
          )}

          {/* The pairing is a lookup, so it stays a two-column grid at every
              width rather than stacking the way Compare does. It can: both
              sides are short labels, and at 375px this card leaves about
              287px, which is around 140px a column - enough for "Transverse
              axis" on one or two lines. Stacking it would also destroy the
              point, since what is being memorised is the pairing itself. */}
          {block.pairs && (
            <dl className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white/60">
              <div className="grid grid-cols-2 gap-px bg-slate-200">
                {/* The labels sit at the foot when the closing words of the
                    phrase are themselves the labels ("...Like Planes And
                    Axis"), so the grid reads up into them. */}
                {block.pairs.labelPosition !== "foot" && labels}
                {block.pairs.rows.map((row, ri) =>
                  row.map((cell, ci) => {
                    const Cell = ci === 0 ? "dt" : "dd";
                    return (
                      <Cell
                        key={`${ri}-${ci}`}
                        className={`bg-white/40 px-3 py-2 text-sm ${
                          typeof cell === "string" && ci === 0
                            ? "font-medium text-slate-900"
                            : "text-slate-700"
                        }`}
                      >
                        {typeof cell === "string" ? (
                          cell
                        ) : (
                          <>
                            <span className="font-semibold text-slate-900">{cell.word}</span>:{" "}
                            {cell.meaning}
                          </>
                        )}
                      </Cell>
                    );
                  }),
                )}
                {block.pairs.labelPosition === "foot" && labels}
              </div>
            </dl>
          )}
          {block.items && (
            <ul className="mt-3 space-y-1.5">
              {block.items.map((item, i) => (
                <li key={i} className="flex gap-2 text-slate-700">
                  <span aria-hidden="true" className="text-slate-500">
                    &bull;
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// The graph card background. The stage labels are painted with a stroke of
// this colour underneath the glyphs, so a gridline passing behind a label
// does not cut through the letters.
const ANNOTATION_HALO = "#ffffff";

/**
 * A line graph drawn from its points. No marker elements and no hooks, since
 * these render on the server: the axis arrowheads are plain polygons, so two
 * graphs on one page cannot collide over an id.
 *
 * The drawing is laid out in a fixed viewBox and scaled by the browser, so
 * the whole thing shrinks to the column width on a phone without any of the
 * text reflowing out of position. Because the whole drawing scales, the type
 * sizes are set the other way round from everywhere else on the site: larger
 * viewBox units on a phone, smaller on a wide screen. A 380-unit viewBox is
 * drawn at roughly 295px on a 375px phone and roughly 600px in the notes
 * column, so a single size would render at about 8px on the phone and about
 * 16px on the desktop. These two pairs land near 10px and 16px on both.
 */
function Graph({ block, style }: BlockProps<GraphBlock>) {
  const W = 380;
  // The top padding carries the y-axis name, which sits above the axis rather
  // than rotated alongside it. It has to clear the tallest the name ever gets:
  // the type is larger in viewBox units on a phone, and at 24 the ascenders of
  // "Distance (m)" reached y = -5.5, above the viewBox, so the browser cropped
  // their tops. The height grows by the same amount the padding does, which
  // leaves the plot itself exactly as it was and so leaves every measured
  // label clearance untouched.
  const H = 256;
  const PAD = { left: 46, right: 16, top: 40, bottom: 38 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const originY = PAD.top + plotH;

  const sx = (v: number) => PAD.left + (v / block.xAxis.max) * plotW;
  const sy = (v: number) => originY - (v / block.yAxis.max) * plotH;

  const line = block.points.map(([x, y]) => `${sx(x)},${sy(y)}`).join(" ");

  return (
    <figure className="my-8">
      <BlockLabel className="text-slate-600">Example graph</BlockLabel>
      {/* On a phone the card pulls out past the page gutter and keeps almost no
          side padding, so the drawing renders about 292px wide rather than 258px.
          That is what lets the labels hit an 11px minimum at 320px without
          shrinking any of them: the terms have to stay readable and unabbreviated. */}
      <div className="-mx-4 mt-3 rounded-xl border border-slate-200 bg-white px-1.5 py-3 sm:mx-0 sm:p-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={block.caption ? `${block.title}. ${block.caption}` : block.title}
        >
          {/* Value gridlines, faint enough to read the line over */}
          {block.yAxis.ticks.map((t) => (
            <line
              key={`g${t}`}
              x1={PAD.left}
              y1={sy(t)}
              x2={PAD.left + plotW}
              y2={sy(t)}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
          ))}

          {/* Axes, each with a solid arrowhead at its open end */}
          <line x1={PAD.left} y1={originY} x2={PAD.left + plotW + 4} y2={originY} stroke="#0f172a" strokeWidth="1.5" />
          <polygon points={`${PAD.left + plotW + 12},${originY} ${PAD.left + plotW + 2},${originY - 4} ${PAD.left + plotW + 2},${originY + 4}`} fill="#0f172a" />
          <line x1={PAD.left} y1={originY} x2={PAD.left} y2={PAD.top - 4} stroke="#0f172a" strokeWidth="1.5" />
          <polygon points={`${PAD.left},${PAD.top - 12} ${PAD.left - 4},${PAD.top - 2} ${PAD.left + 4},${PAD.top - 2}`} fill="#0f172a" />

          {block.xAxis.ticks.map((t) => (
            <text key={`x${t}`} x={sx(t)} y={originY + 16} textAnchor="middle" className="text-[15px] sm:text-[10px]" fill="#475569">
              {t}
            </text>
          ))}
          {block.yAxis.ticks.map((t) => (
            <text key={`y${t}`} x={PAD.left - 8} y={sy(t) + 4} textAnchor="end" className="text-[15px] sm:text-[10px]" fill="#475569">
              {t}
            </text>
          ))}

          {/* Axis names sit beside the arrowheads rather than rotated, which
              keeps them legible once the whole drawing is scaled down. */}
          <text x={PAD.left - 8} y={PAD.top - 18} textAnchor="start" className="text-[16px] sm:text-[11px]" fill="#334155" fontStyle="italic">
            {block.yAxis.label}
          </text>
          <text x={W - PAD.right} y={H - 8} textAnchor="end" className="text-[16px] sm:text-[11px]" fill="#334155" fontStyle="italic">
            {block.xAxis.label}
          </text>

          {/* currentColor picks up the subject accent from the class below */}
          <g className={style.icon}>
            <polyline
              points={line}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Stage labels. The white stroke painted underneath the glyphs is
              the card background, so a label that has to sit over a dotted
              gridline is not cut through by it. Where a label has a `wrapped`
              form, the one-line version is hidden at phone width and the
              stacked version takes over, which buys room without shortening
              any of the terms. */}
          {block.annotations?.map((a, i) => {
            const size = "text-[15px] sm:text-[10.5px]";
            const LINE_HEIGHT = 16;

            // Two variants: the phone one may wrap and may sit somewhere
            // else, the wide one is always a single line. Only one is drawn,
            // the other is display:none, the same trick the compare tables
            // use to reflow a table a phone cannot fit.
            const narrow = { x: a.x, y: a.y, anchor: a.anchor, lines: a.wrapped ?? [a.text] };
            const wide = {
              x: a.wide?.x ?? a.x,
              y: a.wide?.y ?? a.y,
              anchor: a.wide?.anchor ?? a.anchor,
              lines: [a.text],
            };
            const differs = Boolean(a.wrapped || a.wide);

            const draw = (v: typeof narrow, className: string, key?: string) => (
              <text
                key={key}
                x={sx(v.x)}
                y={sy(v.y)}
                textAnchor={v.anchor ?? "middle"}
                className={className}
                fill="#475569"
                fontStyle="italic"
                stroke={ANNOTATION_HALO}
                strokeWidth={3}
                strokeLinejoin="round"
                paintOrder="stroke"
              >
                {v.lines.length === 1
                  ? v.lines[0]
                  : v.lines.map((lineText, li) => (
                      <tspan
                        key={li}
                        x={sx(v.x)}
                        dy={li === 0 ? (-(v.lines.length - 1) * LINE_HEIGHT) / 2 : LINE_HEIGHT}
                      >
                        {lineText}
                      </tspan>
                    ))}
              </text>
            );

            if (!differs) return draw(narrow, size, String(i));
            return (
              <g key={i}>
                {draw(narrow, `${size} sm:hidden`)}
                {draw(wide, `${size} hidden sm:inline`)}
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-sm text-slate-600">
        <span className="font-medium text-slate-800">{block.title}.</span>
        {block.caption ? ` ${block.caption}` : null}
      </figcaption>
    </figure>
  );
}

/** Renders one block according to its `type`. */
export function NoteBlockRenderer({ block, style }: { block: NoteBlock; style: SubjectStyle }) {
  switch (block.type) {
    case "definition":
      return <Definition block={block} style={style} />;
    case "formula":
      return <Formula block={block} style={style} />;
    case "how_it_works":
      return <HowItWorks block={block} style={style} />;
    case "compare":
      return <Compare block={block} style={style} />;
    case "explainer":
      return <Explainer block={block} style={style} />;
    case "mix_ups":
      return <MixUps block={block} style={style} />;
    case "say_it_to_score":
      return <SayItToScore block={block} style={style} />;
    case "lock_it_in":
      return <LockItIn block={block} style={style} />;
    case "memory_tip":
      return <MemoryTip block={block} style={style} />;
    case "graph":
      return <Graph block={block} style={style} />;
  }
}
