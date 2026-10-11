"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, Users, MonitorSmartphone, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CARD_BASE_CLASSES, CARD_BORDER_DEFAULT } from "@/lib/styles";

type Benefit = {
  icon: LucideIcon;
  heading: string;
  description: string;
};

const benefits: Benefit[] = [
  {
    icon: TrendingUp,
    heading: "Track your progress",
    description:
      "See how much of the spec you have covered, which subjects are strongest, and which topics to go back to",
  },
  {
    icon: Users,
    heading: "Add friends",
    description:
      "Find friends by username and compare how far through the spec you each are",
  },
  {
    icon: MonitorSmartphone,
    heading: "Revise on any device",
    description:
      "Progress is saved to your account rather than the browser, so a phone picks up where a laptop left off",
  },
];

/**
 * Invites signed-out visitors to make an account, and explains what one is
 * for. Hidden once signed in, where the prompt would make no sense.
 *
 * The home page is statically rendered, so there is no session to read on the
 * server and auth only resolves after hydration. The three states are kept
 * apart deliberately: `undefined` means "not known yet" and renders nothing,
 * so a signed-in visitor never sees a flash of a prompt telling them to log
 * in. The cost is that a signed-out visitor gets the section a moment after
 * the rest of the page, which is a fair trade for a section this far down.
 */
export default function AccountPromptSection() {
  const [signedIn, setSignedIn] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (signedIn === undefined || signedIn) return null;

  return (
    <section className="border-t border-slate-200 py-20 text-center">
      <div className="mx-auto max-w-2xl px-4">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-slate-600 sm:text-3xl">
          Make it stick with an account
        </h2>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          Everything above is free to use without one. Logging in saves your progress so you can
          pick up where you left off, on any device.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 px-4 text-left md:grid-cols-3">
        {benefits.map(({ icon: Icon, heading, description }) => (
          <div
            key={heading}
            className={`flex h-full flex-col gap-3 ${CARD_BASE_CLASSES} ${CARD_BORDER_DEFAULT}`}
          >
            <Icon className="h-8 w-8 text-blue-600" aria-hidden="true" />
            <h3 className="text-lg font-bold text-slate-900">{heading}</h3>
            <p className="text-sm leading-6 text-slate-500">{description}</p>
          </div>
        ))}
      </div>

      <Link
        href="/login"
        className="mt-10 inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Create a free account
      </Link>
    </section>
  );
}
