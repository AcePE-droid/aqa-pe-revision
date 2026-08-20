"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthStatus from "@/components/AuthStatus";

const navLinks = [
  { href: "/flashcards", label: "Flashcards" },
  { href: "/notes", label: "Notes" },
  { href: "/questions", label: "Practice Questions" },
  { href: "/past-papers", label: "Past Papers" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4 md:px-8 lg:px-12">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
          PE Revision
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`border-b-2 pb-1 transition-colors duration-150 hover:text-slate-900 ${
                  isActive
                    ? "border-blue-600 font-medium text-slate-900"
                    : "border-transparent text-slate-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <AuthStatus />
        </nav>
      </div>
    </header>
  );
}
