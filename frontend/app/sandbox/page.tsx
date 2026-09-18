import type { Metadata } from "next";
import { SandboxShell } from "@/components/sandbox/sandbox-shell";

export const metadata: Metadata = {
  title: "Sandbox · SideQuest",
  description: "Mobile screen sandbox for SideQuest.",
  robots: { index: false, follow: false },
};

export default function SandboxPage() {
  return <SandboxShell />;
}
