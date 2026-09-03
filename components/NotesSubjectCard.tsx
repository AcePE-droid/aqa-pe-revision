import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { CARD_SHAPE_CLASSES, CARD_INTERACTIVE_CLASSES } from "@/lib/styles";

// Notes-only subject card: a solid-fill "article grid" treatment that matches
// the color energy of Flashcards/Practice Questions, but stays visually
// distinct through shape rather than color: a 3-up grid, a faint serif page
// numeral, and a short underline beneath the heading instead of a progress
// bar or arrow icon.
type Props = {
  name: string;
  subtitle: string;
  href: string;
  Icon: LucideIcon;
  solidBgClassName: string;
  borderClassName: string;
  onSolidTextClassName: string;
  onSolidSubtextClassName: string;
  onSolidIconClassName: string;
  onSolidFillClassName: string;
  index: number;
};

export default function NotesSubjectCard({
  name,
  subtitle,
  href,
  Icon,
  solidBgClassName,
  borderClassName,
  onSolidTextClassName,
  onSolidSubtextClassName,
  onSolidIconClassName,
  onSolidFillClassName,
  index,
}: Props) {
  const numeral = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={href}
      className={`flex flex-col ${CARD_SHAPE_CLASSES} ${CARD_INTERACTIVE_CLASSES} ${solidBgClassName} ${borderClassName}`}
    >
      <div className="flex items-start justify-between">
        <Icon className={`h-6 w-6 ${onSolidIconClassName}`} />
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
    </Link>
  );
}
