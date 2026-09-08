import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-[1100px] px-6 py-8 text-sm text-slate-500 md:px-8 lg:px-12">
        <p>
          AcePE is an independent student-made resource. Not affiliated with or endorsed
          by AQA.
        </p>
        <p className="mt-2 flex flex-wrap gap-4">
          <Link href="/about" className="hover:text-blue-600">
            About this site
          </Link>
          <Link href="/feedback" className="hover:text-blue-600">
            Send feedback
          </Link>
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
