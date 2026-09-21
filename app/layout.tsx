import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BadgeUnlockProvider from "@/components/badges/BadgeUnlockProvider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const DESCRIPTION =
  "Free flashcards, practice questions, and study notes for AQA A-Level PE (7582).";

// Deliberately no `alternates.canonical` here. Root metadata is inherited by
// every page that doesn't set its own, and only this file sets any - so a
// canonical here would tell Google all 20-odd topic pages are duplicates of
// the homepage. Canonicals belong in per-page `generateMetadata`.
export const metadata: Metadata = {
  // Resolves relative URLs in OpenGraph tags and, once pages set their own
  // canonicals, in those too. Without it Next falls back to localhost.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AcePE | AQA A-Level PE (7582)",
    template: "%s | AcePE",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "AcePE",
    locale: "en_GB",
    title: "AcePE | AQA A-Level PE (7582)",
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable} h-full scroll-smooth antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-slate-900">
        <BadgeUnlockProvider>
          <Header />
          <main className="flex-1">
            <div className="mx-auto w-full max-w-[1100px] px-6 md:px-8 lg:px-12">{children}</div>
          </main>
          <Footer />
        </BadgeUnlockProvider>
      </body>
    </html>
  );
}
