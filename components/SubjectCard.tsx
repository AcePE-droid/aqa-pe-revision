import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { CARD_BASE_CLASSES, CARD_INTERACTIVE_CLASSES, CARD_HOVER_BORDER } from "@/lib/styles";

type Props = {
  name: string;
  subtitle: string;
  href: string;
  Icon: LucideIcon;
  iconClassName?: string;
};

export default function SubjectCard({ name, subtitle, href, Icon, iconClassName }: Props) {
  return (
    <Link
      href={href}
      className={`flex items-start gap-4 ${CARD_BASE_CLASSES} ${CARD_INTERACTIVE_CLASSES} ${CARD_HOVER_BORDER}`}
    >
      <Icon className={`mt-0.5 h-6 w-6 shrink-0 ${iconClassName ?? "text-blue-600"}`} />
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{name}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
    </Link>
  );
}
