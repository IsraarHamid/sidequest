"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Camera, Laugh, Plus, Sparkles, Trophy, Upload, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/trip-quest/page-header";
import { Avatar } from "@/components/trip-quest/avatar";
import { CREW, VOTE_CATEGORIES, getMission } from "@/lib/trip-quest-data";

const VOTE_ICONS: Record<string, LucideIcon> = { Laugh, Camera, Sparkles };

export default function VoteMissionPage() {
  const router = useRouter();
  const { tripId, missionId } = useParams<{ tripId: string; missionId: string }>();
  const mission = getMission(missionId);
  const [votedCategoryId, setVotedCategoryId] = useState<string | null>(null);
  const jackie = CREW.find((member) => member.id === "jackie")!;

  return (
    <div className="min-h-svh w-full bg-[#F4EFE4]">
      <div className="mx-auto w-full max-w-[430px]">
        <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[18px] p-[16px_20px_24px_20px] justify-start items-start">
          <PageHeader title="Rate this mission" />

          <div className="box-border w-full h-fit shrink-0 flex flex-row gap-[12px] justify-start items-center">
            <Avatar initials={jackie.initials} color={jackie.color} size={44} fontSize={15} />
            <div className="box-border w-fit shrink-0 h-fit flex flex-col gap-[2px] justify-start items-start">
              <div className="text-[14px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                {jackie.name} completed
              </div>
              <div className="text-[12px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal text-left whitespace-nowrap">
                {mission.title}
              </div>
            </div>
          </div>

          <div className="box-border w-full h-fit shrink-0 [box-shadow:0px_1px_2px_0px_#4A3B2E14] flex flex-row gap-0 p-[8px] justify-start items-start bg-[#FBF7F0] rounded-3xl relative">
            <div className="box-border flex-1 h-[280px] flex flex-row gap-0 justify-start items-start rounded-2xl overflow-hidden bg-gradient-to-br from-[#C8901A33] to-[#3E6B4A33]" />
          </div>

          <div className="box-border w-fit h-fit [transform:rotate(8deg)] [transform-origin:top_left] [box-shadow:0px_4px_10px_0px_#4A3B2E24] absolute left-[10px] top-[118px] flex flex-row gap-[6px] p-[7px_13px] justify-start items-center bg-[#E8B62C] z-10">
            <Upload className="w-[13px] h-[13px] shrink-0" color="#4A3B2E" />
            <div className="text-[12px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-bold text-left whitespace-nowrap">
              SUBMITTED
            </div>
          </div>

          <div className="box-border w-full h-fit shrink-0 flex flex-row gap-0 p-[16px] justify-start items-start bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-3xl relative">
            <div className="text-[22px]/[28px] box-border flex-1 text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-normal text-left">
              &ldquo;{mission.draftNote ?? mission.shortDescription}&rdquo;
            </div>
          </div>

          <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal tracking-[1px] text-left whitespace-nowrap">
            CAST YOUR VOTE
          </div>

          <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[10px] justify-start items-start">
            {VOTE_CATEGORIES.map((category) => {
              const Icon = VOTE_ICONS[category.icon] ?? Sparkles;
              const voted = votedCategoryId === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setVotedCategoryId(category.id)}
                  disabled={votedCategoryId !== null}
                  className="box-border w-full h-fit shrink-0 flex flex-row gap-[12px] p-[12px_14px] justify-start items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-2xl disabled:opacity-100"
                >
                  <div className="box-border w-[34px] shrink-0 h-[34px] flex flex-row gap-0 justify-center items-center bg-black rounded-full">
                    <Icon className="w-[16px] h-[16px] shrink-0" color={category.color} />
                  </div>
                  <div className="box-border flex-1 h-fit flex flex-col gap-[1px] justify-start items-start">
                    <div className="text-[14px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                      {category.label}
                    </div>
                    <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal text-left whitespace-nowrap">
                      {category.votes + (voted ? 1 : 0)} votes
                    </div>
                  </div>
                  <div
                    className={`box-border w-[40px] shrink-0 h-[40px] flex flex-row gap-0 justify-center items-center rounded-full ${
                      voted
                        ? "bg-[#121212]"
                        : "bg-[#F4EFE4] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px]"
                    }`}
                  >
                    <Plus className="w-[16px] h-[16px] shrink-0" color={voted ? "#FBF7F0" : "#4A3B2E"} />
                  </div>
                </button>
              );
            })}
          </div>

          {votedCategoryId && (
            <>
              <div className="box-border w-full h-fit shrink-0 flex flex-row gap-[8px] p-[16px] justify-center items-center bg-[#121212] rounded-3xl">
                <Trophy className="w-[18px] h-[18px] shrink-0" color="#E8B62C" />
                <div className="text-[14px]/[normal] box-border text-[#FBF7F0] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                  {mission.points} pts awarded to {jackie.name}
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push(`/trips/${tripId}/missions`)}
                className="box-border w-full h-[48px] shrink-0 flex flex-row gap-[8px] p-[16px_32px] justify-center items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-full"
              >
                <div className="text-[15px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                  Back to missions
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
