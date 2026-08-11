import { getSubjectCards } from "@/lib/subjects";
import SectionHub from "@/components/SectionHub";

export default function NotesHubPage() {
  const subjects = getSubjectCards("/notes");

  return (
    <SectionHub
      eyebrow="Notes"
      title="Clear notes for every topic"
      description="Browse by subject to find written notes for every topic."
      subjects={subjects}
    />
  );
}
