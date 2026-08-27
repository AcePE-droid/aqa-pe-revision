import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { CARD_SHAPE_CLASSES, CARD_INTERACTIVE_CLASSES, CARD_BORDER_DEFAULT, CARD_HOVER_BG } from "@/lib/styles";

type Props = {
  name: string;
  subtitle: string;
  href: string;
  Icon: LucideIcon;
  iconClassName?: string;
  borderClassName?: string;
  hoverBgClassName?: string;
  // Solid-fill variant: when supplied, the card background is the full
  // accent colour instead of white, and the hover background tint is
  // skipped in favour of the shadow hover cue alone.
  solidBgClassName?: string;
  onSolidTextClassName?: string;
  onSolidSubtextClassName?: string;
  onSolidIconClassName?: string;
};

export default function SubjectCard({
  name,
  subtitle,
  href,
  Icon,
  iconClassName,
  borderClassName,
  hoverBgClassName,
  solidBgClassName,
  onSolidTextClassName,
  onSolidSubtextClassName,
  onSolidIconClassName,
}: Props) {
  return (
    <Link
      href={href}
      className={`flex items-start gap-4 ${CARD_SHAPE_CLASSES} ${CARD_INTERACTIVE_CLASSES} ${solidBgClassName ?? "bg-white"} ${borderClassName ?? CARD_BORDER_DEFAULT} ${solidBgClassName ? "" : (hoverBgClassName ?? CARD_HOVER_BG)}`}
    >
      <Icon className={`mt-0.5 h-6 w-6 shrink-0 ${onSolidIconClassName ?? iconClassName ?? "text-blue-600"}`} />
      <div>
        <h2 className={`text-lg font-semibold ${onSolidTextClassName ?? "text-slate-900"}`}>{name}</h2>
        <p className={`mt-1 text-sm ${onSolidSubtextClassName ?? "text-slate-500"}`}>{subtitle}</p>
      </div>
    </Link>
  );
}
