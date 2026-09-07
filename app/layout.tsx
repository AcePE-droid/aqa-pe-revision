import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BadgeUnlockProvider from "@/components/badges/BadgeUnlockProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AcePE | AQA A-Level PE (7582)",
  description:
    "Free flashcards, practice questions, and study notes for AQA A-Level PE (7582).",
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
