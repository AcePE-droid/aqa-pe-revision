"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Layers, BookOpen, FileText, type LucideIcon } from "lucide-react";
import {
  CARD_BASE_CLASSES,
  CARD_BORDER_DEFAULT,
  CARD_HOVER_BORDER,
  CARD_INTERACTIVE_CLASSES,
} from "@/lib/styles";

type Props = {
  flashcardCount: number;
};

type Card = {
  icon: LucideIcon;
  heading: string;
  description: string;
  href: string;
  delay: string;
};

export default function WhatsInsideSection({ flashcardCount }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  // Fires the entrance animation once, when the section scrolls into view.
  // Does not repeat if the user scrolls away and back.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const cards: Card[] = [
    {
      icon: Layers,
      heading: "Flashcards",
      href: "/flashcards",
      description: `Over ${flashcardCount.toLocaleString()} flashcards for every subtopic, study with active recall`,
      delay: "delay-0",
    },
    {
      icon: BookOpen,
      heading: "Revision Notes",
      href: "/notes",
      description: "Condensed notes for every topic, no fluff, just what you need",
      delay: "delay-[250ms]",
    },
    {
      icon: FileText,
      heading: "Practice Questions",
      href: "/questions",
      description: "Exam-style questions with full mark schemes to improve technique",
      delay: "delay-500",
    },
  ];

  return (
    <section
      id="whats-inside"
      ref={sectionRef}
      className="scroll-mt-24 py-20 text-center"
    >
      <h2 className="font-serif text-2xl font-semibold tracking-tight text-slate-600 sm:text-3xl">
        What&rsquo;s inside
      </h2>
      <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 text-left md:grid-cols-3">
        {cards.map(({ icon: Icon, heading, description, href, delay }) => (
          // The entrance animation stays on this wrapper rather than on the card
          // itself. CARD_SHAPE_CLASSES carries transition-all duration-200 for the
          // hover, so holding both on one element would leave the two transitions
          // fighting over the cascade: either the hover snaps, or the 1000ms
          // entrance quietly runs at 200ms. Splitting them keeps each intact.
          <div
            key={heading}
            className={`${delay} transition-[opacity,transform] duration-[1000ms] ease-out motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:!transition-none ${
              inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            {/* h-full so the cards still stretch to a shared height now that the
                grid item is the wrapper rather than the card. */}
            <Link
              href={href}
              className={`flex h-full flex-col gap-3 ${CARD_BASE_CLASSES} ${CARD_BORDER_DEFAULT} ${CARD_INTERACTIVE_CLASSES} ${CARD_HOVER_BORDER} touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
            >
              <Icon className="h-8 w-8 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">{heading}</h3>
              <p className="text-sm leading-6 text-slate-500">{description}</p>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
