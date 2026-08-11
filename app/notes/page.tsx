import { HeartPulse, Brain, Users2, type LucideIcon } from "lucide-react";
import { getSubjects, getTopicsBySubject } from "@/lib/content";
import SectionHub from "@/components/SectionHub";

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  "Anatomy & Physiology": HeartPulse,
  "Sports Psychology": Brain,
  "Sport, Society & History": Users2,
};

export default function NotesHubPage() {
  const subjects = getSubjects().map((subject) => {
    const topics = getTopicsBySubject(subject.name);
    return {
      slug: subject.slug,
      name: subject.name,
      subtitle: topics.map((t) => t.name).join(", "),
      href: `/notes/${subject.slug}`,
      Icon: SUBJECT_ICONS[subject.name] ?? Brain,
    };
  });

  return (
    <SectionHub
      eyebrow="Notes"
      title="Clear notes for every topic"
      description="Browse by subject to find written notes for every topic."
      subjects={subjects}
    />
  );
}
