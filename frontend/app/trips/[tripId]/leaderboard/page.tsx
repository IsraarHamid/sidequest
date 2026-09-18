"use client";

import { useParams } from "next/navigation";
import { Medal, Zap } from "lucide-react";
import { BottomNav } from "@/components/trip-quest/bottom-nav";
import { RankTabs } from "@/components/trip-quest/rank-tabs";
import { Avatar } from "@/components/trip-quest/avatar";
import { CREW, LEADERBOARD, getTrip } from "@/lib/trip-quest-data";

export default function LeaderboardPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const trip = getTrip(tripId);
  const leader = CREW.find((member) => member.id === LEADERBOARD[0].memberId);

  return (
    <div className="min-h-svh w-full bg-[#F4EFE4] flex flex-col">
      <div className="mx-auto w-full max-w-[430px] flex flex-col flex-1">
        <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[18px] p-[16px_20px_20px_20px] justify-start items-start flex-1">
          <div className="text-[10px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal tracking-[1px] text-left whitespace-nowrap">
            {trip.name.toUpperCase()}
          </div>

          <RankTabs tripId={trip.id} />

          {leader && (
            <div className="box-border w-full h-fit shrink-0 flex flex-row gap-[12px] p-[16px] justify-start items-center bg-[#C8901A1F] [outline:1px_solid_#C8901A] [outline-offset:-0.5px] rounded-3xl relative">
              <div className="box-border w-[40px] shrink-0 h-[40px] flex flex-row gap-0 justify-center items-center bg-[#E8B62C] rounded-full">
                <Medal className="w-[19px] h-[19px] shrink-0" color="#4A3B2E" />
              </div>
              <div className="box-border flex-1 h-fit flex flex-col gap-[1px] justify-start items-start">
                <div className="text-[14px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                  {leader.name} finished first!
                </div>
                <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal text-left whitespace-nowrap">
                  +50 pt speed bonus
                </div>
              </div>
              <div className="box-border w-fit h-fit [transform:rotate(6deg)] [transform-origin:top_left] [box-shadow:0px_4px_10px_0px_#4A3B2E24] absolute left-[-18px] top-[62px] flex flex-row gap-[6px] p-[7px_13px] justify-start items-center bg-[#E8B62C]">
                <Zap className="w-[13px] h-[13px] shrink-0" color="#4A3B2E" />
                <div className="text-[12px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-bold text-left whitespace-nowrap">
                  BONUS
                </div>
              </div>
            </div>
          )}

          <div className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-center mt-[10px]">
            <div className="text-[16px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
              Rankings
            </div>
            <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal text-left whitespace-nowrap">
              Day 4 of 6
            </div>
          </div>

          <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[10px] justify-start items-start">
            {LEADERBOARD.map((row) => {
              const member = CREW.find((crewMember) => crewMember.id === row.memberId);
              if (!member) return null;
              const isFirst = row.rank === 1;
              return (
                <div
                  key={row.memberId}
                  className={`box-border w-full h-fit shrink-0 flex flex-row gap-[14px] p-[14px_16px] justify-start items-center rounded-2xl ${
                    isFirst
                      ? "bg-[#C8901A14] [outline:1px_solid_#C8901A] [outline-offset:-0.5px]"
                      : "bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px]"
                  }`}
                >
                  <div
                    className={`text-[18px]/[normal] box-border w-[22px] shrink-0 font-[Geist,system-ui,sans-serif] font-extrabold text-center ${
                      isFirst ? "text-[#C8901A]" : "text-[#8A7A69]"
                    }`}
                  >
                    {row.rank}
                  </div>
                  <Avatar initials={member.initials} color={member.color} />
                  <div className="box-border flex-1 h-fit flex flex-col gap-[2px] justify-start items-start">
                    <div className="text-[15px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                      {member.name}
                    </div>
                    <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal text-left whitespace-nowrap">
                      {row.missionsCount} missions · {row.badgesCount} badge{row.badgesCount === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div className="text-[18px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-extrabold text-left whitespace-nowrap">
                    {row.points.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <BottomNav tripId={trip.id} />
      </div>
    </div>
  );
}
