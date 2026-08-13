import { BookOpen } from "lucide-react";

export default function NotesHubPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-start justify-center">
      <BookOpen className="h-8 w-8 text-blue-600" />
      <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-slate-900">
        Notes
      </h1>
      <p className="mt-2 max-w-md text-slate-600">
        Pick a topic from the sidebar to start reading.
      </p>
    </div>
  );
}
