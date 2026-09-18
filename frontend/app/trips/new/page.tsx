import type { Metadata } from "next";
import { CreateTripScreen } from "@/components/trips/create-trip-screen";

export const metadata: Metadata = {
  title: "Create a trip · SideQuest",
  description: "Create a new SideQuest trip for your crew.",
};

export default function CreateTripPage() {
  return <CreateTripScreen />;
}
