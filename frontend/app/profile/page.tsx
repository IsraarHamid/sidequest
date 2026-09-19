import type { Metadata } from "next";
import { ProfileScreen } from "@/components/trips/profile-screen";

export const metadata: Metadata = {
  title: "Profile · SideQuest",
  description: "Manage your SideQuest profile.",
};

export default function ProfilePage() {
  return <ProfileScreen />;
}
