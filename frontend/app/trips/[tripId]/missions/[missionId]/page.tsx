"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Landmark,
  Lightbulb,
  Timer,
  User,
  Users,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/trip-quest/page-header";
import { getMission } from "@/lib/trip-quest-data";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Utensils,
  Camera,
  Users,
  Landmark,
};

export default function MissionDetailPage() {
  const router = useRouter();
  const { tripId, missionId } = useParams<{ tripId: string; missionId: string }>();
  const mission = getMission(missionId);
  const [showHint, setShowHint] = useState(false);
  const [note, setNote] = useState(mission.draftNote ?? "");
  const CategoryIcon = CATEGORY_ICONS[mission.icon] ?? Utensils;

  return (
    <div className="min-h-svh w-full bg-[#F4EFE4]">
      <div className="mx-auto w-full max-w-[430px]">
        <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[20px] p-[16px_20px_24px_20px] justify-start items-start">
          <PageHeader title="Mission" />

          <div className="box-border w-full h-[220px] shrink-0 flex flex-col gap-[10px] justify-center items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-3xl relative z-10">
            <div className="box-border w-[52px] h-[52px] shrink-0 flex flex-row gap-0 justify-center items-center bg-[#F4EFE4] rounded-full">
              <Camera className="w-[24px] h-[24px] shrink-0" color="#8A7A69" />
            </div>
            <div className="text-[14px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
              Take or upload a photo
            </div>
            <div className="text-[12px]/[normal] box-border text-[#8A7A69] font-[Geist,system-ui,sans-serif] font-normal text-left whitespace-nowrap">
              This is your proof for the group
            </div>
          </div>

          <div
            className="box-border w-fit h-fit [transform:rotate(7deg)] [transform-origin:top_left] [box-shadow:0px_4px_10px_0px_#4A3B2E24] absolute left-[36px] top-[116px] flex flex-row gap-[6px] p-[7px_13px] justify-start items-center z-20"
            style={{ backgroundColor: mission.accentColor }}
          >
            <CategoryIcon className="w-[13px] h-[13px] shrink-0" color="#4A3B2E" />
            <div className="text-[12px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-bold text-left whitespace-nowrap">
              {mission.category}
            </div>
          </div>

          <div className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-start relative z-10">
            <div className="text-[22px]/[26px] box-border w-[250px] shrink-0 text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-extrabold text-left">
              {mission.title}
            </div>
            <div className="box-border w-fit shrink-0 h-fit flex flex-row gap-0 p-[8px_12px] justify-start items-start bg-[#F4EFE4] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-lg">
              <div className="text-[13px]/[normal] box-border text-[#C8901A] font-[Geist,system-ui,sans-serif] font-bold text-left whitespace-nowrap">
                {mission.points} pts
              </div>
            </div>
          </div>

          <div className="box-border w-fit h-fit shrink-0 flex flex-row gap-[16px] justify-start items-start relative z-10">
            {mission.timeLeft && (
              <div className="box-border w-fit shrink-0 h-fit flex flex-row gap-[6px] justify-start items-center">
                <Timer className="w-[13px] h-[13px] shrink-0" color="#8A7A69" />
                <div className="text-[12px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal text-left whitespace-nowrap">
                  {mission.timeLeft}
                </div>
              </div>
            )}
            <div className="box-border w-fit shrink-0 h-fit flex flex-row gap-[6px] justify-start items-center">
              {mission.kind === "solo" ? (
                <User className="w-[13px] h-[13px] shrink-0" color="#8A7A69" />
              ) : (
                <Users className="w-[13px] h-[13px] shrink-0" color="#8A7A69" />
              )}
              <div className="text-[12px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal text-left whitespace-nowrap">
                {mission.kind === "solo" ? "Solo mission" : "Group mission"}
              </div>
            </div>
          </div>

          <div className="text-[14px]/[22px] box-border w-full text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-normal text-left relative z-10">
            {mission.longDescription}
          </div>

          <button
            type="button"
            onClick={() => setShowHint((value) => !value)}
            className="box-border w-full h-fit shrink-0 flex flex-row gap-[10px] p-[14px] justify-start items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-2xl relative z-10"
          >
            <Lightbulb className="w-[16px] h-[16px] shrink-0" color="#C8901A" />
            <div className="box-border flex-1 h-fit flex flex-col gap-[2px] justify-start items-start">
              <div className="text-[13px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                Need a hint?
              </div>
              {showHint && (
                <div className="text-[12px]/[17px] box-border w-full text-[#8A7A69] font-[Geist,system-ui,sans-serif] font-normal text-left">
                  {mission.hint}
                </div>
              )}
            </div>
            {showHint ? (
              <ChevronUp className="w-[15px] h-[15px] shrink-0" color="#8A7A69" />
            ) : (
              <ChevronDown className="w-[15px] h-[15px] shrink-0" color="#8A7A69" />
            )}
          </button>

          <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[8px] justify-start items-start relative z-10">
            <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal tracking-[1px] text-left whitespace-nowrap">
              ADD A SHORT DESCRIPTION
            </div>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="text-[13px]/[20px] box-border w-full h-[80px] resize-none bg-[#FBF7F0] p-[14px] text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-normal text-left [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-2xl"
            />
          </div>

          <button
            type="button"
            onClick={() => router.push(`/trips/${tripId}/missions/${mission.id}/vote`)}
            className="box-border w-full h-[48px] shrink-0 flex flex-row gap-[8px] p-[16px_32px] justify-center items-center bg-[#121212] rounded-full relative z-10"
          >
            <div className="text-[15px]/[normal] box-border text-[#FBF7F0] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
              Mark complete
            </div>
            <Check className="w-[17px] h-[17px] shrink-0" color="#FBF7F0" />
          </button>
        </div>
      </div>
    </div>
  );
}
