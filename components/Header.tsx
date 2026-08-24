"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes, so a back/forward
  // navigation (or a link that doesn't unmount Header) doesn't leave it open.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Stop the page behind the menu from scrolling while it's open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4 md:px-8 lg:px-12">
          <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
            PE Revision
          </Link>

          {/* Desktop nav: unchanged, shown from md upward */}
          <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
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

          {/* Mobile hamburger toggle: shown below md */}
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center text-slate-700 md:hidden"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu panel: slides down within the header's own flow (rather
            than floating over it), animated via the grid-rows 0fr -> 1fr trick
            so it can go from 0 height to auto height smoothly. */}
        <div
          className={`grid transition-[grid-template-rows] duration-[220ms] ease-out md:hidden ${
            menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <nav
            inert={!menuOpen}
            className="max-h-[calc(100vh-4.5rem)] overflow-y-auto border-t border-slate-200 px-2 py-2 text-sm"
          >
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex min-h-[44px] items-center border-b-2 px-4 text-base font-medium transition-colors duration-150 hover:bg-slate-50 ${
                    isActive
                      ? "border-blue-600 text-slate-900"
                      : "border-transparent text-slate-700"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <AuthStatus variant="mobile" onNavigate={() => setMenuOpen(false)} />
          </nav>
        </div>
      </header>

      {/* Backdrop: dims the page below the header while the menu is open.
          Sits below the header in z-order, so the header's own opaque
          background covers it wherever the two overlap. */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-20 bg-slate-900/30 md:hidden"
        />
      )}
    </>
  );
}
