"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Target, Heart, Trophy } from "lucide-react";

export function BottomNav({ tripId }: { tripId: string }) {
  const pathname = usePathname();

  const tabs = [
    { key: "trips", label: "Trips", icon: Map, href: "/" },
    {
      key: "missions",
      label: "Missions",
      icon: Target,
      href: `/trips/${tripId}/missions`,
    },
    {
      key: "vote",
      label: "Vote",
      icon: Heart,
      href: `/trips/${tripId}/vote`,
    },
    {
      key: "ranks",
      label: "Ranks",
      icon: Trophy,
      href: `/trips/${tripId}/leaderboard`,
    },
  ];

  return (
    <div className="sticky bottom-0 box-border w-full h-fit shrink-0 flex flex-row gap-0 p-[0px_16px_12px_16px] justify-start items-start bg-[#F2F2ED]">
      <div className="box-border flex-1 h-[60px] [box-shadow:0px_4px_12px_0px_#4A3B2E24] flex flex-row gap-[4px] p-[6px] justify-start items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-full">
        {tabs.map((tab) => {
          const isActive =
            tab.key === "trips"
              ? pathname === "/"
              : tab.key === "missions"
                ? pathname.includes("/missions") && !pathname.includes("/vote")
                : tab.key === "vote"
                  ? pathname.includes("/vote")
                  : pathname.includes("/leaderboard");
          const Icon = tab.icon;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`box-border flex-1 h-full flex flex-col gap-[2px] justify-center items-center rounded-full ${
                isActive ? "bg-[#121212]" : ""
              }`}
            >
              <Icon
                className="w-[19px] h-[19px] shrink-0"
                color={isActive ? "#FBF7F0" : "#8A7A69"}
              />
              <div
                className={`text-[10px]/[normal] box-border font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap ${
                  isActive ? "text-[#FBF7F0]" : "text-[#8A7A69]"
                }`}
              >
                {tab.label}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
