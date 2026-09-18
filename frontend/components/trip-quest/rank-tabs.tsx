"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, BookMarked } from "lucide-react";

export function RankTabs({ tripId }: { tripId: string }) {
  const pathname = usePathname();
  const isPassport = pathname.includes("/passport");

  return (
    <div className="box-border w-full h-[48px] shrink-0 flex flex-row gap-[4px] p-[4px] justify-start items-start bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-2xl">
      <Link
        href={`/trips/${tripId}/leaderboard`}
        className={`box-border flex-1 h-full flex flex-row gap-[6px] justify-center items-center rounded-lg ${
          !isPassport ? "bg-[#121212]" : ""
        }`}
      >
        <Trophy className="w-[14px] h-[14px] shrink-0" color={!isPassport ? "#FBF7F0" : "#8A7A69"} />
        <div
          className={`text-[13px]/[normal] box-border font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap ${
            !isPassport ? "text-[#FBF7F0]" : "text-[#8A7A69]"
          }`}
        >
          Leaderboard
        </div>
      </Link>
      <Link
        href={`/trips/${tripId}/passport`}
        className={`box-border flex-1 h-full flex flex-row gap-[6px] justify-center items-center rounded-lg ${
          isPassport ? "bg-[#121212]" : ""
        }`}
      >
        <BookMarked className="w-[14px] h-[14px] shrink-0" color={isPassport ? "#FBF7F0" : "#8A7A69"} />
        <div
          className={`text-[13px]/[normal] box-border font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap ${
            isPassport ? "text-[#FBF7F0]" : "text-[#8A7A69]"
          }`}
        >
          Passport
        </div>
      </Link>
    </div>
  );
}
