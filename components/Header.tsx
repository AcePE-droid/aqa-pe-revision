import Link from "next/link";

const navLinks = [
  { href: "/flashcards", label: "Flashcards" },
  { href: "/notes", label: "Notes" },
  { href: "/questions", label: "Practice Questions" },
  { href: "/past-papers", label: "Past Papers" },
  { href: "/about", label: "About" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4 md:px-8 lg:px-12">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
          PE Revision
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-slate-600">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-blue-600">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
