import Link from "next/link";
import type { ReactNode } from "react";
import { CARD_SHAPE_CLASSES, CARD_INTERACTIVE_CLASSES } from "@/lib/styles";

// Shared solid-fill "article grid" subject card used across Notes,
// Flashcards and Practice Questions hub pages: a 3-up grid, a faint serif
// page numeral, and a short underline beneath the heading. `children` lets a
// section append extra content (e.g. progress info) below the subtitle.
// `icon` is a pre-rendered node (rather than a component reference) so this
// can be used from client-component callers without crossing the
// server/client serialization boundary with a raw component reference.
type Props = {
  name: string;
  subtitle: string;
  href: string;
  icon: ReactNode;
  solidBgClassName: string;
  borderClassName: string;
  onSolidTextClassName: string;
  onSolidSubtextClassName: string;
  onSolidFillClassName: string;
  index: number;
  children?: ReactNode;
};

export default function SubjectSquareCard({
  name,
  subtitle,
  href,
  icon,
  solidBgClassName,
  borderClassName,
  onSolidTextClassName,
  onSolidSubtextClassName,
  onSolidFillClassName,
  index,
  children,
}: Props) {
  const numeral = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={href}
      className={`flex flex-col ${CARD_SHAPE_CLASSES} ${CARD_INTERACTIVE_CLASSES} ${solidBgClassName} ${borderClassName}`}
    >
      <div className="flex items-start justify-between">
        {icon}
        <span
          aria-hidden="true"
          className={`select-none font-serif text-4xl font-light opacity-40 ${onSolidSubtextClassName}`}
        >
          {numeral}
        </span>
      </div>
      <h2 className={`mt-6 font-serif text-xl font-semibold ${onSolidTextClassName}`}>{name}</h2>
      <span className={`mt-2 block h-0.5 w-10 ${onSolidFillClassName}`} />
      <p className={`mt-3 text-sm leading-relaxed ${onSolidSubtextClassName}`}>{subtitle}</p>
      {children}
    </Link>
  );
}
