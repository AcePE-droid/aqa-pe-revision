import { HeartPulse, Brain, Users2, type LucideIcon } from "lucide-react";
import { getSubjects, getTopicsBySubject } from "@/lib/content";
import SectionHub from "@/components/SectionHub";

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  "Anatomy & Physiology": HeartPulse,
  "Sports Psychology": Brain,
  "Sport, Society & History": Users2,
};

export default function QuestionsHubPage() {
  const subjects = getSubjects().map((subject) => {
    const topics = getTopicsBySubject(subject.name);
    return {
      slug: subject.slug,
      name: subject.name,
      subtitle: topics.map((t) => t.name).join(", "),
      href: `/questions/${subject.slug}`,
      Icon: SUBJECT_ICONS[subject.name] ?? Brain,
    };
  });

  return (
    <SectionHub
      eyebrow="Practice Questions"
      title="Test yourself with exam-style questions"
      description="Browse by subject to find practice questions with full mark schemes."
      subjects={subjects}
    />
  );
}
