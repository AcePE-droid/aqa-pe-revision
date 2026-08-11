import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type Props = {
  name: string;
  subtitle: string;
  href: string;
  Icon: LucideIcon;
};

export default function SubjectCard({ name, subtitle, href, Icon }: Props) {
  return (
    <Link
      href={href}
      className="flex items-start gap-4 rounded-lg border border-slate-200 p-5 hover:border-blue-300 hover:bg-blue-50/50"
    >
      <Icon className="mt-0.5 h-6 w-6 shrink-0 text-blue-600" />
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{name}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
    </Link>
  );
}
