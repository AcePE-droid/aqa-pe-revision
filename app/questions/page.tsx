import { getSubjectCards } from "@/lib/subjects";
import SectionHub from "@/components/SectionHub";

export default function QuestionsHubPage() {
  const subjects = getSubjectCards("/questions");

  return (
    <SectionHub
      eyebrow="Practice Questions"
      title="Test yourself with exam-style questions"
      description="Browse by subject to find practice questions with full mark schemes."
      subjects={subjects}
    />
  );
}
