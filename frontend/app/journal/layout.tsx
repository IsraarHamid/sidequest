import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travel journal · SideQuest",
  description: "3D travel journal prototype for the SideQuest homepage.",
  robots: { index: false, follow: false },
};

export default function JournalLayout({
  children,
}: LayoutProps<"/journal">) {
  return children;
}
