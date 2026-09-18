"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Info, SearchCheck, TreePalm } from "lucide-react";
import { PageHeader } from "@/components/trip-quest/page-header";
import { Avatar } from "@/components/trip-quest/avatar";
import { CREW, DEFAULT_TRIP_ID, getTrip } from "@/lib/trip-quest-data";

const CODE_SLOTS = ["L", "I", "S", "4", "X", "9", ""];

export default function JoinTripPage() {
  const router = useRouter();
  const [found, setFound] = useState(false);
  const trip = getTrip(DEFAULT_TRIP_ID);
  const previewCrew = CREW.filter((member) => member.id !== "jackie");

  return (
    <div className="min-h-svh w-full bg-[#F4EFE4]">
      <div className="mx-auto w-full max-w-[430px]">
        <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[22px] p-[16px_20px_24px_20px] justify-start items-start">
          <PageHeader title="Join a trip" />

          <div className="box-border w-full h-[48px] shrink-0 flex flex-row gap-[4px] p-[4px] justify-start items-start bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-2xl">
            <Link
              href="/trips/new"
              className="box-border flex-1 h-full flex flex-row gap-0 justify-center items-center rounded-lg"
            >
              <div className="text-[14px]/[normal] box-border text-[#8A7A69] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                Create a trip
              </div>
            </Link>
            <div className="box-border flex-1 h-full flex flex-row gap-0 justify-center items-center bg-[#121212] rounded-lg">
              <div className="text-[14px]/[normal] box-border text-[#FBF7F0] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                Join a trip
              </div>
            </div>
          </div>

          <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[14px] justify-start items-start">
            <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal tracking-[1px] text-left whitespace-nowrap">
              TRIP CODE
            </div>
            <div className="box-border w-full h-fit shrink-0 flex flex-row gap-[8px] justify-start items-center">
              {CODE_SLOTS.map((char, index) =>
                index === 3 ? (
                  <div key="dash-3" className="contents">
                    <div className="text-[20px]/[normal] box-border text-[#8A7A69] font-[Geist,system-ui,sans-serif] font-bold text-left whitespace-nowrap">
                      –
                    </div>
                    <CodeSlot char={char} active={false} />
                  </div>
                ) : (
                  <CodeSlot key={index} char={char} active={char === ""} />
                ),
              )}
            </div>
            <div className="box-border w-full h-fit shrink-0 flex flex-row gap-[7px] justify-start items-center">
              <Info className="w-[14px] h-[14px] shrink-0" color="#8A7A69" />
              <div className="text-[13px]/[18px] box-border flex-1 text-[#8A7A69] font-[Geist,system-ui,sans-serif] font-normal text-left">
                Ask your crew for the 7-character code, or open their invite link.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFound(true)}
            className="box-border w-full h-[48px] shrink-0 flex flex-row gap-[8px] p-[16px_32px] justify-center items-center bg-[#121212] rounded-full"
          >
            <div className="text-[15px]/[normal] box-border text-[#FBF7F0] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
              Join trip
            </div>
            <ArrowRight className="w-[17px] h-[17px] shrink-0" color="#FBF7F0" />
          </button>

          {found && (
            <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[16px] p-[30px_20px_20px_20px] justify-start items-start bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-3xl relative">
              <div className="box-border w-fit h-fit [transform:rotate(8deg)] [transform-origin:top_left] [box-shadow:0px_4px_10px_0px_#4A3B2E24] absolute left-[-14px] top-[-16px] flex flex-row gap-[6px] p-[7px_13px] justify-start items-center bg-[#E8B62C] z-0">
                <SearchCheck className="w-[13px] h-[13px] shrink-0" color="#4A3B2E" />
                <div className="text-[12px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-bold text-left whitespace-nowrap">
                  TRIP FOUND!
                </div>
              </div>
              <div className="box-border w-full h-fit shrink-0 flex flex-row gap-[14px] justify-start items-center relative z-10">
                <div className="box-border w-[52px] shrink-0 h-[52px] flex flex-row gap-0 justify-center items-center bg-[#DCEBF5] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-2xl">
                  <TreePalm className="w-[24px] h-[24px] shrink-0" color="#3E6B4A" />
                </div>
                <div className="box-border flex-1 h-fit flex flex-col gap-[4px] justify-start items-start">
                  <div className="text-[21px]/[normal] box-border w-full text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-extrabold text-left">
                    {trip.name}
                  </div>
                  <div className="text-[13px]/[normal] box-border w-full text-[#8A7A69] font-[Geist,system-ui,sans-serif] font-medium text-left">
                    {trip.destination} · 12–18 Oct
                  </div>
                </div>
              </div>
              <div className="box-border w-full h-[1px] shrink-0 bg-[#DDD2C0] relative z-10" />
              <div className="box-border w-full h-fit shrink-0 flex flex-row gap-[10px] justify-start items-center relative z-10">
                <div className="box-border w-fit shrink-0 h-fit flex flex-row -space-x-[10px] justify-start items-center">
                  {previewCrew.map((member) => (
                    <Avatar key={member.id} initials={member.initials} color={member.color} size={34} fontSize={12} />
                  ))}
                </div>
                <div className="text-[13px]/[normal] box-border flex-1 text-[#8A7A69] font-[Geist,system-ui,sans-serif] font-medium text-left">
                  4 travellers already in
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push(`/trips/${trip.id}/preferences`)}
                className="box-border w-full h-[46px] shrink-0 flex flex-row gap-[8px] justify-center items-center bg-[#121212] rounded-full relative z-10"
              >
                <div className="text-[14px]/[normal] box-border text-[#FBF7F0] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                  Continue
                </div>
                <ArrowRight className="w-[15px] h-[15px] shrink-0" color="#FBF7F0" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CodeSlot({ char, active }: { char: string; active: boolean }) {
  return (
    <div
      className={`box-border flex-1 h-[56px] flex flex-row gap-0 justify-center items-center rounded-2xl ${
        active
          ? "bg-[#F4EFE4] [outline:2px_solid_#4A3B2E] [outline-offset:-1px]"
          : "bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px]"
      }`}
    >
      {active ? (
        <div className="box-border w-[2px] h-[26px] bg-[#C8901A] rounded-[2px]" />
      ) : (
        <div className="text-[24px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-extrabold text-left whitespace-nowrap">
          {char}
        </div>
      )}
    </div>
  );
}
