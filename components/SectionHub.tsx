import type { LucideIcon } from "lucide-react";
import SubjectCard from "@/components/SubjectCard";

type Subject = {
  slug: string;
  name: string;
  subtitle: string;
  href: string;
  Icon: LucideIcon;
  iconClassName?: string;
  hoverBgClassName?: string;
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
          <SubjectCard
            key={subject.slug}
            name={subject.name}
            subtitle={subject.subtitle}
            href={subject.href}
            Icon={subject.Icon}
            iconClassName={subject.iconClassName}
            hoverBgClassName={subject.hoverBgClassName}
          />
        ))}
      </div>
    </div>
  );
}
