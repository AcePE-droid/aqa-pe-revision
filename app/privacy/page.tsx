import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "What AcePE stores about you, why, and how to delete it.",
  path: "/privacy",
});

const LAST_UPDATED = "10 November 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="py-16">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>

      <div className="mt-8 flex max-w-2xl flex-col gap-8 text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">1. Who we are</h2>
          <p className="mt-2">
            AcePE is a student-made revision resource for AQA A-Level PE. It isn&rsquo;t
            affiliated with, endorsed by, or connected to AQA.
          </p>
          <p className="mt-2">
            If you have questions about how your data is handled,{" "}
            <Link href="/feedback" className="text-blue-600 hover:underline">
              send us feedback
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">2. What information we collect</h2>
          <p className="mt-2">
            We never ask you for your real name, and you don&rsquo;t need to give one to use the
            site.
          </p>
          <ul className="mt-2 list-disc pl-5">
            <li>Your email address, if you sign in with a magic link or Google</li>
            <li>
              Your name, if Google shares it when you sign in with Google. We don&rsquo;t show it
              to anyone else and we don&rsquo;t use it to build your username
            </li>
            <li>
              A username, which we make up for you when you sign up. You can change it from your
              account page
            </li>
            <li>Your flashcard progress (which cards you&rsquo;ve marked as known or still learning)</li>
            <li>Your practice question answers, and which notes you&rsquo;ve marked as read</li>
            <li>
              How you rate your own confidence in a topic, your day streak, which badges
              you&rsquo;ve unlocked, and the score worked out from all of that
            </li>
            <li>A session cookie, to keep you signed in</li>
            <li>Basic browser storage (localStorage) to save your progress if you&rsquo;re not signed in</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">3. Why we collect it</h2>
          <ul className="mt-2 list-disc pl-5">
            <li>To create your account and let you sign in</li>
            <li>To sync your revision progress across your devices</li>
            <li>To show you your own progress, streak and badges</li>
            <li>To let you add friends and compare progress with them, if you choose to</li>
          </ul>
          <p className="mt-2">
            That&rsquo;s it. No advertising, no marketing emails, and we never sell your data to
            anyone.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">4. Who else can see it</h2>
          <p className="mt-2 font-medium text-slate-900">Other people using the site</p>
          <ul className="mt-2 list-disc pl-5">
            <li>
              <strong>Your username.</strong> Anyone signed in can search usernames in order to
              send a friend request, so your username is the one part of your account other
              students can find. That is why we don&rsquo;t build it from your name, and why we
              suggest you don&rsquo;t either
            </li>
            <li>
              <strong>Your score, to friends only.</strong> The leaderboard only ever shows you
              and the people you have accepted as friends. There is no site-wide leaderboard
            </li>
          </ul>
          <p className="mt-2">
            Your email address, your real name and your answers are never shown to other users.
            Nothing about your account is visible to anyone who isn&rsquo;t signed in.
          </p>
          <p className="mt-4 font-medium text-slate-900">Companies that handle it for us</p>
          <ul className="mt-2 list-disc pl-5">
            <li>
              <strong>Supabase</strong> (a US company, using an EU-based database): stores your
              account and progress data
            </li>
            <li>
              <strong>Google</strong>: only if you choose to sign in with Google, in which case
              Google knows you signed in to this site
            </li>
            <li>
              <strong>Vercel</strong> (a US company): hosts the site
            </li>
          </ul>
          <p className="mt-2">Nobody else sees your data, and we never sell it.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">5. How long we keep it</h2>
          <ul className="mt-2 list-disc pl-5">
            <li>Your account data: for as long as your account exists</li>
            <li>If you delete your account: your data is removed within 30 days</li>
            <li>Anonymous progress in your browser&rsquo;s localStorage: stays on your device until you clear it</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">6. Your rights</h2>
          <p className="mt-2">You can:</p>
          <ul className="mt-2 list-disc pl-5">
            <li>
              Ask to see what data we have about you (
              <Link href="/feedback" className="text-blue-600 hover:underline">
                send us feedback
              </Link>
              )
            </li>
            <li>Ask us to correct anything that&rsquo;s wrong</li>
            <li>Delete your account and all associated data, any time, from your account page</li>
            <li>
              Complain to the{" "}
              <a
                href="https://ico.org.uk/make-a-complaint/"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                ICO
              </a>{" "}
              if you&rsquo;re unhappy with how we&rsquo;ve handled your data
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">7. If you&rsquo;re under 18</h2>
          <p className="mt-2">
            Most people using this site are school students, so it&rsquo;s built on the
            assumption that you&rsquo;re under 18. In practice that means we never ask for your
            real name, the username we give you is made up rather than taken from your name or
            your email address, your scores are only ever shown to friends you have accepted,
            and nothing about your account is visible to anyone who isn&rsquo;t signed in. We
            don&rsquo;t advertise to you and we don&rsquo;t profile you. There are day streaks
            and badges, which are there to make revision feel less of a slog, and you can ignore
            them completely without losing access to anything.
          </p>
          <p className="mt-2">
            If you&rsquo;re under 13, please don&rsquo;t sign up without a parent or guardian&rsquo;s
            involvement. If we find out an account belongs to someone under 13, we&rsquo;ll delete it.
          </p>
          <p className="mt-2">
            If you&rsquo;re a parent, guardian or teacher and you want an account removed, or you
            want to know what the site holds about a student,{" "}
            <Link href="/feedback" className="text-blue-600 hover:underline">
              get in touch
            </Link>{" "}
            and we&rsquo;ll deal with it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">8. Cookies and browser storage</h2>
          <ul className="mt-2 list-disc pl-5">
            <li>We use a cookie to keep you signed in</li>
            <li>We use browser storage (localStorage) to save your progress when you&rsquo;re not signed in</li>
            <li>We don&rsquo;t use tracking or advertising cookies, and we don&rsquo;t use third-party analytics</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">9. Changes to this policy</h2>
          <p className="mt-2">
            We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at the
            top shows when it last changed. If you keep using the site after a change, that means
            you accept the new version.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">10. Contact</h2>
          <p className="mt-2">
            Questions about your data?{" "}
            <Link href="/feedback" className="text-blue-600 hover:underline">
              Send us feedback
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
