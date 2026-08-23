// DRAFT — review before publishing. This page is a starting point, not
// final legal text. Before launch: replace the contact email, replace the
// last-updated date, and have the whole document reviewed for accuracy.

// TODO: replace with a real, monitored email address before publishing
const CONTACT_EMAIL = "privacy@example.com";

// TODO: set to the real publish date before this page goes live
const LAST_UPDATED = "[date to be set before publishing]";

export default function TermsOfServicePage() {
  return (
    <div className="py-16">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>

      <div className="mt-8 flex max-w-2xl flex-col gap-8 text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">1. Who this is for</h2>
          <p className="mt-2">
            These terms apply to anyone using this site as a revision resource for AQA A-Level PE.
            The site is free to use.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">2. What this site is</h2>
          <p className="mt-2">
            PE Revision is a student-made revision resource. It isn&rsquo;t affiliated with,
            endorsed by, or produced by AQA. Content is written in good faith, but it may contain
            mistakes — always cross-reference against your official course materials.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">3. Content and copying</h2>
          <p className="mt-2">
            Content on this site (flashcards, questions, notes) is made by us for your revision. You
            can use it freely for your own studying — including printing pages or sharing links with
            classmates. Please don&rsquo;t republish or resell our content on another site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">4. Accuracy</h2>
          <p className="mt-2">
            We try to keep everything accurate, but we can&rsquo;t guarantee it. Your official course
            materials should always be your main revision source, and your exam results are
            ultimately down to your own preparation.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">5. Your account</h2>
          <ul className="mt-2 list-disc pl-5">
            <li>Use a real email address you can access</li>
            <li>Don&rsquo;t share your account with anyone else</li>
            <li>You&rsquo;re responsible for anything done through your account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">6. Fair use</h2>
          <p className="mt-2">
            Use the site to revise, not to abuse it — no scraping, spamming, or attacking the site.
            We can suspend or delete accounts that misuse the site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">7. Availability</h2>
          <p className="mt-2">
            The site is free, and we do our best to keep it running, but we can&rsquo;t guarantee
            it&rsquo;ll always be available. We may take it down for updates, or eventually shut it
            down altogether — if we do, we&rsquo;ll give notice where we can.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">8. Changes to these terms</h2>
          <p className="mt-2">
            We may update these terms from time to time. The &ldquo;Last updated&rdquo; date at the
            top shows when. Continuing to use the site after a change means you accept the new
            version.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">9. Governing law</h2>
          <p className="mt-2">These terms are governed by the laws of England and Wales.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">10. Contact</h2>
          <p className="mt-2">
            Questions about these terms? Email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
