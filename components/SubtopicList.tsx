import Link from "next/link";
import { CARD_BASE_CLASSES, CARD_INTERACTIVE_CLASSES, CARD_HOVER_BORDER, CARD_HOVER_BG } from "@/lib/styles";

type Props = {
  title: string;
  backHref: string;
  backLabel: string;
  basePath: string; // e.g. "/notes/paper-1/applied-anatomy"
  items: { slug: string; name: string; subtitle: string }[];
  hoverBgClassName?: string;
};

export default function SubtopicList({ title, backHref, backLabel, basePath, items, hoverBgClassName }: Props) {
  return (
    <div className="py-16">
      <Link href={backHref} className="text-sm font-medium text-blue-600 hover:underline">
        &larr; {backLabel}
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>

      <div className="mt-8 flex flex-col gap-3">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`${basePath}/${item.slug}`}
            className={`${CARD_BASE_CLASSES} ${CARD_INTERACTIVE_CLASSES} ${CARD_HOVER_BORDER} ${hoverBgClassName ?? CARD_HOVER_BG}`}
          >
            <h2 className="text-base font-semibold text-slate-900">{item.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{item.subtitle}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
