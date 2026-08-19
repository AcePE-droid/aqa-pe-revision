import { getNotesSubjectCards } from "@/lib/subjects";
import SectionHub from "@/components/SectionHub";

export default function NotesHubPage() {
  const subjects = getNotesSubjectCards();

  return (
    <SectionHub
      eyebrow="Notes"
      title="Read condensed revision notes"
      description="Choose a subject to browse notes."
      subjects={subjects}
    />
  );
}
