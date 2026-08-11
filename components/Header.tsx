import Link from "next/link";

const navLinks = [
  { href: "/flashcards", label: "Flashcards" },
  { href: "/paper-1", label: "Paper 1" },
  { href: "/paper-2", label: "Paper 2" },
  { href: "/past-papers", label: "Past Papers" },
  { href: "/about", label: "About" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
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
