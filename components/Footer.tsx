import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-[1100px] px-6 py-8 text-sm text-slate-500 md:px-8 lg:px-12">
        <p>
          PE Revision is an independent student-made resource. Not affiliated with or endorsed
          by AQA.
        </p>
        <p className="mt-2">
          <Link href="/about" className="hover:text-blue-600">
            About this site
          </Link>
        </p>
      </div>
    </footer>
  );
}
