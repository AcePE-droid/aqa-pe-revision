// DRAFT — review before publishing. This page is a starting point, not
// final legal text. Before launch: replace LAST_UPDATED with the actual
// publish date, and have the whole policy reviewed (ideally by someone
// other than the person who wrote the site) for accuracy against what the
// site actually does at that time.

const PRIVACY_EMAIL = "acepe26.a.level@gmail.com";

// TODO: set to the real publish date before this policy goes live
const LAST_UPDATED = "[date to be set before publishing]";

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
            PE Revision is a free, student-made revision resource for AQA A-Level PE. It isn&rsquo;t
            affiliated with, endorsed by, or connected to AQA.
          </p>
          <p className="mt-2">
            If you have questions about how your data is handled, email{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`} className="text-blue-600 hover:underline">
              {PRIVACY_EMAIL}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">2. What information we collect</h2>
          <ul className="mt-2 list-disc pl-5">
            <li>Your email address, if you sign in with a magic link or Google</li>
            <li>Your name, if Google shares it when you sign in with Google</li>
            <li>Your flashcard progress — which cards you&rsquo;ve marked as known or still learning</li>
            <li>A session cookie, to keep you signed in</li>
            <li>Basic browser storage (localStorage) to save your progress if you&rsquo;re not signed in</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">3. Why we collect it</h2>
          <ul className="mt-2 list-disc pl-5">
            <li>To create your account and let you sign in</li>
            <li>To sync your flashcard progress across your devices</li>
          </ul>
          <p className="mt-2">
            That&rsquo;s it — no advertising, no marketing emails, and we never sell your data to
            anyone.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">4. Who else can see it</h2>
          <ul className="mt-2 list-disc pl-5">
            <li>
              <strong>Supabase</strong> (a US company, using an EU-based database) — stores your
              account and progress data
            </li>
            <li>
              <strong>Google</strong> — only if you choose to sign in with Google, in which case
              Google knows you signed in to this site
            </li>
            <li>
              <strong>Vercel</strong> (a US company) — hosts the site
            </li>
          </ul>
          <p className="mt-2">Nobody else sees your data.</p>
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
              Ask to see what data we have about you (email{" "}
              <a href={`mailto:${PRIVACY_EMAIL}`} className="text-blue-600 hover:underline">
                {PRIVACY_EMAIL}
              </a>
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
          <h2 className="text-lg font-semibold text-slate-900">7. If you&rsquo;re under 13</h2>
          <p className="mt-2">
            If you&rsquo;re under 13, please don&rsquo;t sign up without a parent or guardian&rsquo;s
            involvement. If we find out an account belongs to someone under 13, we&rsquo;ll delete it.
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
            Questions about your data? Email{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`} className="text-blue-600 hover:underline">
              {PRIVACY_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
