"use client";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import type { Mission } from "@/lib/trip-quest-data";

// ponytail: fixed color+sticker pairs, matches the Paper "Quests" mock instead of a full theming system
const STICKERS = "/trip_quest-assets/stickers";
const STYLES = [
  { from: "#6C93D6", to: "#4E76C0", sticker: `${STICKERS}/Sticker_3.png` }, // blue / camera
  { from: "#6BB088", to: "#4F9A71", sticker: `${STICKERS}/Sticker_13.png` }, // green / palm tree
  { from: "#4E9A94", to: "#3D8580", sticker: `${STICKERS}/Sticker_16.png` }, // teal / binoculars
  { from: "#D9825F", to: "#C0623F", sticker: `${STICKERS}/sticker_2_03.png` }, // orange / pizza
  { from: "#9C7FD1", to: "#7E5FB8", sticker: `${STICKERS}/sticker_2_08.png` }, // purple / beers
  { from: "#D673A8", to: "#BD4F8A", sticker: `${STICKERS}/Sticker_12.png` }, // pink / ice cream
];

function styleFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return STYLES[hash % STYLES.length];
}

export function MissionCard({ mission, tripId }: { mission: Mission; tripId: string }) {
  const isCompleted = mission.status === "completed";
  const { from, to, sticker } = styleFor(mission.id);

  return (
    <Link
      href={`/trips/${tripId}/missions/${mission.id}`}
      className={`box-border w-full min-h-[168px] shrink-0 flex flex-col gap-[10px] p-[24px] justify-start items-start rounded-[28px] relative overflow-hidden text-white ${
        isCompleted ? "opacity-55" : ""
      }`}
      style={{ backgroundImage: `linear-gradient(155deg, ${from}, ${to})` }}
    >
      {isCompleted && (
        <div className="absolute right-[16px] top-[16px] w-[24px] h-[24px] rounded-full bg-white/25 flex items-center justify-center z-10">
          <Check className="w-[13px] h-[13px]" color="#FFFFFF" />
        </div>
      )}

      <div className="text-[22px]/[26px] box-border max-w-[66%] font-[Geist,system-ui,sans-serif] font-bold text-left relative z-10">
        {mission.title}
      </div>

      <div className="text-[15px]/[21px] box-border max-w-[62%] font-[Geist,system-ui,sans-serif] font-medium text-left text-white/85 relative z-10">
        {mission.shortDescription}
      </div>

      <div className="text-[15px]/[normal] box-border font-[Geist,system-ui,sans-serif] font-bold text-left mt-auto relative z-10">
        {mission.points}pts
      </div>

      <Image
        src={sticker}
        alt=""
        width={110}
        height={110}
        className="absolute right-[-6px] bottom-[-10px] [transform:rotate(-8deg)] [filter:drop-shadow(0_4px_6px_rgba(0,0,0,0.25))] pointer-events-none"
      />
    </Link>
  );
}
