import type { Metadata } from "next";
import { PRIVATE_PAGE } from "@/lib/metadata";

// app/login/page.tsx is a Client Component, and Client Components can't
// export `metadata` - so it lives here, in a layout wrapping the one route.
export const metadata: Metadata = {
  title: "Log In",
  description: "Sign in to sync your AcePE revision progress across devices.",
  robots: PRIVATE_PAGE,
};

export default function LoginLayout({ children }: LayoutProps<"/login">) {
  return children;
}
