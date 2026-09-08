import FeedbackForm from "@/components/FeedbackForm";
import { CARD_BASE_CLASSES, CARD_BORDER_DEFAULT } from "@/lib/styles";

// Random each request (not statically generated at build) so the math
// bot-check question is fresh per visit.
export const dynamic = "force-dynamic";

export default function FeedbackPage() {
  const mathA = 1 + Math.floor(Math.random() * 8);
  const mathB = 1 + Math.floor(Math.random() * 8);

  return (
    <div className="py-16">
      <div className={`mx-auto max-w-[480px] ${CARD_BASE_CLASSES} ${CARD_BORDER_DEFAULT}`}>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-slate-900">Send feedback</h1>
        <p className="mt-2 text-sm text-slate-600">
          Spotted a mistake, have a suggestion, or just want to say hi? Let us know.
        </p>
        <FeedbackForm mathA={mathA} mathB={mathB} />
      </div>
    </div>
  );
}
