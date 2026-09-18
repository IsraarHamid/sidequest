"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Clock, Plus, Radio, Trophy } from "lucide-react";
import { Avatar } from "@/components/trip-quest/avatar";
import { BottomNav } from "@/components/trip-quest/bottom-nav";
import { CREW, TRIPS } from "@/lib/trip-quest-data";

function crewMember(id: string) {
  return CREW.find((member) => member.id === id);
}

export default function HomePage() {
  return (
    <div className="min-h-svh w-full bg-[#F4EFE4] flex flex-col">
      <div className="mx-auto w-full max-w-[430px] flex flex-col flex-1">
        <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[22px] p-[16px_20px_20px_20px] justify-start items-start flex-1">
          <div className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-center">
            <div className="box-border w-fit shrink-0 h-fit flex flex-col gap-[2px] justify-start items-start">
              <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal text-left whitespace-nowrap">
                Welcome back
              </div>
              <div className="text-[28px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-extrabold text-left whitespace-nowrap">
                Jackie
              </div>
            </div>
            <Avatar initials="JZ" color="#E85A1C" size={46} fontSize={15} />
          </div>

          <div className="box-border w-full h-fit shrink-0 flex flex-row gap-[12px] justify-start items-start">
            <Link
              href="/trips/new"
              className="box-border flex-1 h-[48px] flex flex-row gap-[8px] p-[14px_16px] justify-center items-center bg-[#121212] rounded-full"
            >
              <div className="text-[14px]/[normal] box-border text-[#FBF7F0] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                Create trip
              </div>
              <Plus className="w-[17px] h-[17px] shrink-0" color="#FBF7F0" />
            </Link>
            <Link
              href="/trips/join"
              className="box-border flex-1 h-[48px] flex flex-row gap-[8px] p-[14px_16px] justify-center items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-full"
            >
              <div className="text-[14px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                Join trip
              </div>
            </Link>
          </div>

          <div className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-center">
            <div className="text-[18px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
              Your trips
            </div>
            <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal text-left whitespace-nowrap">
              {TRIPS.length} active
            </div>
          </div>

          <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[16px] justify-start items-start">
            {TRIPS.map((trip) => (
              <div
                key={trip.id}
                className="box-border w-full h-fit shrink-0 [box-shadow:0px_1px_2px_0px_#4A3B2E14] flex flex-col gap-0 justify-start items-start bg-[#FBF7F0] rounded-3xl relative"
              >
                <div className="box-border w-full h-[130px] shrink-0 flex flex-row gap-0 justify-start items-start rounded-t-3xl overflow-hidden relative z-0 bg-gradient-to-br from-[#DCEBF5] to-[#C8901A33]" />
                <div className="box-border w-fit h-fit [transform:rotate(6deg)] [transform-origin:top_left] [box-shadow:0px_4px_10px_0px_#4A3B2E24] absolute left-[-10px] top-[104px] flex flex-row gap-[6px] p-[7px_13px] justify-start items-center bg-[#E8B62C] z-10">
                  {trip.status === "live" ? (
                    <Radio className="w-[13px] h-[13px] shrink-0" color="#4A3B2E" />
                  ) : (
                    <Clock className="w-[13px] h-[13px] shrink-0" color="#4A3B2E" />
                  )}
                  <div className="text-[12px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-bold text-left whitespace-nowrap">
                    {trip.statusLabel}
                  </div>
                </div>
                <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[13px] p-[22px_16px_16px_16px] justify-start items-start relative z-20">
                  <div className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-start">
                    <div className="box-border flex-1 h-fit flex flex-col gap-[4px] justify-start items-start">
                      <div className="text-[17px]/[normal] box-border w-full text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-left">
                        {trip.destination}
                      </div>
                      <div className="box-border w-fit h-fit shrink-0 flex flex-row gap-[6px] justify-start items-center">
                        <Calendar className="w-[12px] h-[12px] shrink-0" color="#8A7A69" />
                        <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal text-left whitespace-nowrap">
                          {trip.dates}
                        </div>
                      </div>
                    </div>
                    <div className="box-border w-fit shrink-0 h-fit flex flex-row gap-[5px] p-[6px_10px] justify-start items-center bg-[#F4EFE4] rounded-lg">
                      <Trophy className="w-[12px] h-[12px] shrink-0" color="#C8901A" />
                      <div className="text-[11px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-bold text-left whitespace-nowrap">
                        {trip.rankLabel}
                      </div>
                    </div>
                  </div>
                  <div className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-center">
                    <div className="box-border w-fit shrink-0 h-fit flex flex-row gap-[6px] justify-start items-center">
                      {trip.memberIds.map((memberId) => {
                        const member = crewMember(memberId);
                        if (!member) return null;
                        return (
                          <Avatar
                            key={memberId}
                            initials={member.initials}
                            color={member.color}
                            size={28}
                            fontSize={11}
                          />
                        );
                      })}
                      {trip.extraMemberCount > 0 && (
                        <div className="box-border w-[28px] shrink-0 h-[28px] flex flex-row gap-0 justify-center items-center bg-[#F4EFE4] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-full">
                          <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                            +{trip.extraMemberCount}
                          </div>
                        </div>
                      )}
                      <div className="text-[14px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-extrabold text-left whitespace-nowrap">
                        {trip.points.toLocaleString()} pts
                      </div>
                    </div>
                    <Link
                      href={`/trips/${trip.id}/missions`}
                      className="box-border w-fit shrink-0 h-fit flex flex-row gap-[5px] p-[8px_13px] justify-start items-center bg-[#121212] rounded-lg"
                    >
                      <div className="text-[12px]/[normal] box-border text-[#FBF7F0] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                        Continue
                      </div>
                      <ArrowRight className="w-[12px] h-[12px] shrink-0" color="#FBF7F0" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[12px]/[normal] box-border w-full text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal text-center">
            View 3 past trips
          </div>
        </div>

        <BottomNav tripId="lisbon-legends" />
      </div>
    </div>
  );
}
