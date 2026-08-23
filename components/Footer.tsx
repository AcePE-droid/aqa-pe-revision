import Link from "next/link";

const FEEDBACK_EMAIL = "acepe26.a.level@gmail.com";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-[1100px] px-6 py-8 text-sm text-slate-500 md:px-8 lg:px-12">
        <p>
          PE Revision is an independent student-made resource. Not affiliated with or endorsed
          by AQA.
        </p>
        <p className="mt-2 flex flex-wrap gap-4">
          <Link href="/about" className="hover:text-blue-600">
            About this site
          </Link>
          <a href={`mailto:${FEEDBACK_EMAIL}?subject=PE%20Revision%20feedback`} className="hover:text-blue-600">
            Send feedback
          </a>
          <Link href="/privacy" className="hover:text-blue-600">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-blue-600">
            Terms of Service
          </Link>
        </p>
      </div>
    </footer>
  );
}
