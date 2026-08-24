import type { LucideIcon } from "lucide-react";
import { CARD_BASE_CLASSES } from "@/lib/styles";

type Props = {
  Icon: LucideIcon;
  heading: string;
  body: string;
};

// Static (non-interactive) card used on the homepage's "What you get"
// section to describe a content type (flashcards, questions, notes).
// Reuses the canonical card container so it matches every other card on
// the site, but skips CARD_INTERACTIVE_CLASSES since these aren't links.
export default function ContentTypeCard({ Icon, heading, body }: Props) {
  return (
    <div className={`flex flex-col gap-3 ${CARD_BASE_CLASSES}`}>
      <Icon className="h-6 w-6 text-blue-600" />
      <h3 className="text-lg font-semibold text-slate-900">{heading}</h3>
      <p className="text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}
