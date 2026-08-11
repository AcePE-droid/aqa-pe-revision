import { getFlashcardSubjectCards } from "@/lib/subjects";
import SectionHub from "@/components/SectionHub";

export default function FlashcardsHubPage() {
  const subjects = getFlashcardSubjectCards();

  return (
    <SectionHub
      eyebrow="Flashcards"
      title="Study with interactive flashcards"
      description="Browse by subject to find flashcard sets for every topic."
      subjects={subjects}
    />
  );
}
