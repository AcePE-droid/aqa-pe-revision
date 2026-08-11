import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type Subject = {
  slug: string;
  name: string;
  subtitle: string;
  href: string;
  Icon: LucideIcon;
};

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  subjects: Subject[];
};

export default function SectionHub({ eyebrow, title, description, subjects }: Props) {
  return (
    <div className="py-16">
      <p className="text-sm font-medium text-blue-600">{eyebrow}</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-2 text-slate-600">{description}</p>

      <div className="mt-8 flex flex-col gap-3">
        {subjects.map((subject) => (
          <Link
            key={subject.slug}
            href={subject.href}
            className="flex items-start gap-4 rounded-lg border border-slate-200 p-5 hover:border-blue-300 hover:bg-blue-50/50"
          >
            <subject.Icon className="mt-0.5 h-6 w-6 shrink-0 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{subject.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{subject.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
