import { HeartPulse, Brain, Users2, type LucideIcon } from "lucide-react";
import { getSubjects, getTopicsBySubject } from "@/lib/content";
import { getSubjectStyle } from "@/lib/subject-styles";

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  "Anatomy & Physiology": HeartPulse,
  "Sports Psychology": Brain,
  "Sport, Society & History": Users2,
};

export type SubjectCardData = {
  slug: string;
  name: string;
  subtitle: string;
  href: string;
  Icon: LucideIcon;
  iconClassName: string;
};

/**
 * The three top-level subjects, formatted for use as flashcard subject
 * cards (used on both /flashcards and the homepage).
 */
export function getFlashcardSubjectCards(): SubjectCardData[] {
  return getSubjects().map((subject) => {
    const topics = getTopicsBySubject(subject.name);
    return {
      slug: subject.slug,
      name: subject.name,
      subtitle: topics.map((t) => t.name).join(", "),
      href: `/flashcards/${subject.slug}`,
      Icon: SUBJECT_ICONS[subject.name] ?? Brain,
      iconClassName: getSubjectStyle(subject.slug).icon,
    };
  });
}
