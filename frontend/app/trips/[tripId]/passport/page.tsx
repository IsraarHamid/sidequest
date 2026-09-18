"use client";

import { useParams } from "next/navigation";
import {
  Camera,
  CircleCheck,
  CircleDashed,
  MoonStar,
  Users,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { BottomNav } from "@/components/trip-quest/bottom-nav";
import { RankTabs } from "@/components/trip-quest/rank-tabs";
import { Avatar } from "@/components/trip-quest/avatar";
import {
  BADGES,
  CREW,
  FAVOURITE_MISSION_TYPES,
  PASSPORT_DESTINATIONS,
  getTrip,
} from "@/lib/trip-quest-data";

const BADGE_ICONS: Record<string, LucideIcon> = { Utensils, Camera, Zap, Users, MoonStar };

export default function PassportPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const trip = getTrip(tripId);
  const jackie = CREW.find((member) => member.id === "jackie")!;

  return (
    <div className="min-h-svh w-full bg-[#F4EFE4] flex flex-col">
      <div className="mx-auto w-full max-w-[430px] flex flex-col flex-1">
        <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[20px] p-[16px_20px_20px_20px] justify-start items-start flex-1">
          <div className="text-[10px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal tracking-[1px] text-left whitespace-nowrap">
            YOUR TRAVEL PASSPORT
          </div>

          <RankTabs tripId={trip.id} />

          <div className="box-border w-full h-fit shrink-0 flex flex-row gap-[14px] justify-start items-center">
            <Avatar initials={jackie.initials} color={jackie.color} size={56} fontSize={18} />
            <div className="box-border w-fit shrink-0 h-fit flex flex-col gap-[2px] justify-start items-start">
              <div className="text-[19px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-extrabold text-left whitespace-nowrap">
                {jackie.name}&apos;s passport
              </div>
              <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal text-left whitespace-nowrap">
                {PASSPORT_DESTINATIONS.length} destinations · {BADGES.length} badges
              </div>
            </div>
          </div>

          <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal tracking-[1px] text-left whitespace-nowrap">
            DESTINATIONS
          </div>
          <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[10px] justify-start items-start">
            {PASSPORT_DESTINATIONS.map((destination) => (
              <div
                key={destination.id}
                className="box-border w-full h-fit shrink-0 flex flex-row gap-[12px] p-[12px_14px] justify-start items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-2xl"
              >
                {destination.status === "completed" ? (
                  <CircleCheck className="w-[18px] h-[18px] shrink-0" color="#3E6B4A" />
                ) : (
                  <CircleDashed className="w-[18px] h-[18px] shrink-0" color="#8A7A69" />
                )}
                <div className="box-border flex-1 h-fit flex flex-col gap-[1px] justify-start items-start">
                  <div className="text-[14px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                    {destination.name}
                  </div>
                  <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal text-left whitespace-nowrap">
                    {destination.statLabel}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal tracking-[1px] text-left whitespace-nowrap">
            BADGES EARNED
          </div>
          <div className="box-border w-full h-fit shrink-0 flex flex-row flex-wrap gap-[12px] justify-start items-start">
            {BADGES.map((badge) => {
              const Icon = BADGE_ICONS[badge.icon] ?? Utensils;
              return (
                <div
                  key={badge.id}
                  className="box-border grow basis-[28%] h-fit flex flex-col gap-[8px] p-[14px] justify-start items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-3xl"
                >
                  <div className="box-border w-[40px] h-[40px] shrink-0 flex flex-row gap-0 justify-center items-center bg-black rounded-full">
                    <Icon className="w-[19px] h-[19px] shrink-0" color={badge.color} />
                  </div>
                  <div className="text-[11px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-center whitespace-nowrap">
                    {badge.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal tracking-[1px] text-left whitespace-nowrap">
            FAVOURITE MISSION TYPES
          </div>
          <div className="box-border w-full h-fit shrink-0 flex flex-row gap-[10px] justify-start items-start">
            {FAVOURITE_MISSION_TYPES.map((type) => (
              <div
                key={type.id}
                className="box-border flex-1 h-fit flex flex-col gap-[4px] p-[12px_10px] justify-start items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-2xl"
              >
                <div className="text-[18px]/[normal] box-border text-[#C8901A] font-[Geist,system-ui,sans-serif] font-extrabold text-left whitespace-nowrap">
                  {type.percentage}%
                </div>
                <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-[Geist,system-ui,sans-serif] font-medium text-left whitespace-nowrap">
                  {type.label}
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal tracking-[1px] text-left whitespace-nowrap">
            Best photos
          </div>
          <div className="box-border w-full h-fit shrink-0 flex flex-row gap-[10px] justify-start items-start">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="box-border flex-1 h-[100px] flex flex-row gap-0 justify-start items-start rounded-2xl overflow-hidden bg-gradient-to-br from-[#C8901A33] to-[#3E6B4A33]"
              />
            ))}
          </div>
        </div>

        <BottomNav tripId={trip.id} />
      </div>
    </div>
  );
}
