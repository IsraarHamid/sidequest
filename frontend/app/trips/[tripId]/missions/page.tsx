"use client";

import { useParams } from "next/navigation";
import { Flame } from "lucide-react";
import { BottomNav } from "@/components/trip-quest/bottom-nav";
import { MissionCard } from "@/components/trip-quest/mission-card";
import { MISSIONS, getTrip } from "@/lib/trip-quest-data";

export default function MissionsListPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const trip = getTrip(tripId);

  const soloMissions = MISSIONS.filter(
    (mission) => mission.kind === "solo" && mission.status !== "completed",
  );
  const groupMissions = MISSIONS.filter(
    (mission) => mission.kind === "group" && mission.status !== "completed",
  );
  const completedMissions = MISSIONS.filter((mission) => mission.status === "completed");

  return (
    <div className="min-h-svh w-full bg-[#F4EFE4] flex flex-col">
      <div className="mx-auto w-full max-w-[430px] flex flex-col flex-1">
        <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[20px] p-[16px_20px_20px_20px] justify-start items-start flex-1">
          <div className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-center">
            <div className="box-border w-fit shrink-0 h-fit flex flex-col gap-[2px] justify-start items-start">
              <div className="text-[10px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal tracking-[1px] text-left whitespace-nowrap">
                {trip.destination.toUpperCase()}
              </div>
              <div className="text-[26px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-extrabold text-left whitespace-nowrap">
                Missions
              </div>
            </div>
            <div className="box-border w-fit shrink-0 h-fit flex flex-row gap-[6px] p-[8px_12px] justify-start items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-lg">
              <Flame className="w-[14px] h-[14px] shrink-0" color="#C8901A" />
              <div className="text-[12px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-bold text-left whitespace-nowrap">
                {trip.dayLabel}
              </div>
            </div>
          </div>

          <div className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-center">
            <div className="text-[16px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
              My missions
            </div>
            <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal text-left whitespace-nowrap">
              {soloMissions.length} open
            </div>
          </div>
          <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[14px] justify-start items-start">
            {soloMissions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} tripId={trip.id} />
            ))}
          </div>

          <div className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-center">
            <div className="text-[16px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
              Group mission
            </div>
            <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal text-left whitespace-nowrap">
              {groupMissions.length} active
            </div>
          </div>
          <div className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-start items-start">
            {groupMissions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} tripId={trip.id} />
            ))}
          </div>

          <div className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-center">
            <div className="text-[16px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
              Completed
            </div>
            <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal text-left whitespace-nowrap">
              {completedMissions.length} missions
            </div>
          </div>
          <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[14px] justify-start items-start">
            {completedMissions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} tripId={trip.id} />
            ))}
          </div>
        </div>

        <BottomNav tripId={trip.id} />
      </div>
    </div>
  );
}
