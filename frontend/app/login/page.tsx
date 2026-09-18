import type { Metadata } from "next";
import { WelcomeScreen } from "@/components/login/welcome-screen";

export const metadata: Metadata = {
  title: "Sign in · SideQuest",
  description: "Sign in to turn your next trip into a game.",
};

export default function LoginPage() {
  return <WelcomeScreen />;
}
