"use client";

import Link from "next/link";
import {
  Camera,
  Check,
  CircleDashed,
  LoaderCircle,
  Landmark,
  Timer,
  Users,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import type { Mission } from "@/lib/trip-quest-data";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Utensils,
  Camera,
  Users,
  Landmark,
};

export function MissionCard({ mission, tripId }: { mission: Mission; tripId: string }) {
  const CategoryIcon = CATEGORY_ICONS[mission.icon] ?? Utensils;
  const isGroup = mission.kind === "group";
  const isCompleted = mission.status === "completed";

  return (
    <Link
      href={`/trips/${tripId}/missions/${mission.id}`}
      className={`box-border w-full h-fit shrink-0 [box-shadow:0px_1px_2px_0px_#4A3B2E14] flex flex-col gap-[14px] p-[20px] justify-start items-start rounded-3xl relative ${
        isGroup ? "bg-[#3E6B4A14]" : "bg-[#FBF7F0]"
      } ${isCompleted ? "opacity-70" : ""}`}
    >
      <div
        className="box-border w-fit h-fit [transform:rotate(7deg)] [transform-origin:top_left] [box-shadow:0px_4px_10px_0px_#4A3B2E24] absolute left-[-12px] top-[-16px] flex flex-row gap-[6px] p-[7px_13px] justify-start items-center z-0"
        style={{ backgroundColor: isGroup ? "#3E6B4A" : mission.accentColor }}
      >
        <CategoryIcon className="w-[13px] h-[13px] shrink-0" color="#4A3B2E" />
        <div className="text-[12px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-bold text-left whitespace-nowrap">
          {mission.category}
        </div>
      </div>

      <div className="box-border w-full h-fit shrink-0 flex flex-row gap-[12px] p-[10px_0px_0px_0px] justify-start items-start relative z-10">
        <div className="box-border flex-1 h-fit flex flex-col gap-[4px] justify-start items-start">
          <div className="text-[17px]/[22px] box-border w-full text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-left">
            {mission.title}
          </div>
          <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal tracking-[0.5px] text-left whitespace-nowrap">
            {mission.kindLabel}
          </div>
        </div>
        <div className="box-border w-fit shrink-0 h-fit flex flex-row gap-0 p-[6px_10px] justify-start items-start bg-[#F2F2ED] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-lg">
          <div className="text-[12px]/[normal] box-border text-[#C8901A] font-[Geist,system-ui,sans-serif] font-bold text-left whitespace-nowrap">
            {mission.points} pts
          </div>
        </div>
      </div>

      <div className="text-[14px]/[21px] box-border w-full text-[#8A7A69] font-[Geist,system-ui,sans-serif] font-normal text-left relative z-10">
        {mission.shortDescription}
      </div>

      <div className="box-border w-full h-[1px] shrink-0 flex flex-row gap-0 justify-start items-start bg-[#DDD2C0] relative z-10" />

      <div className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-center relative z-10">
        {mission.timeLeft ? (
          <div className="box-border w-fit shrink-0 h-fit flex flex-row gap-[6px] justify-start items-center">
            <Timer className="w-[13px] h-[13px] shrink-0" color="#8A7A69" />
            <div className="text-[12px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal text-left whitespace-nowrap">
              {mission.timeLeft}
            </div>
          </div>
        ) : (
          <div />
        )}
        <div
          className={`box-border w-fit shrink-0 h-fit flex flex-row gap-[5px] p-[6px_11px] justify-start items-center rounded-lg ${
            isCompleted ? "bg-[#3E6B4A1F]" : "bg-[#F2F2ED]"
          }`}
        >
          {isCompleted ? (
            <Check className="w-[12px] h-[12px] shrink-0" color="#3E6B4A" />
          ) : mission.status === "in-progress" ? (
            isGroup ? (
              <Users className="w-[12px] h-[12px] shrink-0" color="#8A7A69" />
            ) : (
              <LoaderCircle className="w-[12px] h-[12px] shrink-0" color="#8A7A69" />
            )
          ) : (
            <CircleDashed className="w-[12px] h-[12px] shrink-0" color="#8A7A69" />
          )}
          <div
            className={`text-[11px]/[normal] box-border font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap ${
              isCompleted ? "text-[#3E6B4A]" : "text-[#8A7A69]"
            }`}
          >
            {mission.statusLabel}
          </div>
        </div>
      </div>
    </Link>
  );
}
