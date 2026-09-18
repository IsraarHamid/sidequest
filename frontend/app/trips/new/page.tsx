"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Copy, MapPin, PartyPopper, Share2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/trip-quest/page-header";
import { DEFAULT_TRIP_ID, getTrip } from "@/lib/trip-quest-data";

export default function CreateTripPage() {
  const router = useRouter();
  const [created, setCreated] = useState(false);
  const trip = getTrip(DEFAULT_TRIP_ID);

  return (
    <div className="min-h-svh w-full bg-[#F4EFE4]">
      <div className="mx-auto w-full max-w-[430px]">
        <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[22px] p-[16px_20px_24px_20px] justify-start items-start">
          <PageHeader title="New trip" />

          <div className="box-border w-full h-[48px] shrink-0 flex flex-row gap-[4px] p-[4px] justify-start items-start bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-2xl">
            <div className="box-border flex-1 h-full flex flex-row gap-0 justify-center items-center bg-[#121212] rounded-lg">
              <div className="text-[14px]/[normal] box-border text-[#FBF7F0] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                Create a trip
              </div>
            </div>
            <Link
              href="/trips/join"
              className="box-border flex-1 h-full flex flex-row gap-0 justify-center items-center rounded-lg"
            >
              <div className="text-[14px]/[normal] box-border text-[#8A7A69] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                Join a trip
              </div>
            </Link>
          </div>

          {!created && (
            <>
              <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[16px] justify-start items-start">
                <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[8px] justify-start items-start">
                  <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal tracking-[1px] text-left whitespace-nowrap">
                    TRIP NAME
                  </div>
                  <div className="box-border w-full h-[52px] shrink-0 flex flex-row gap-[10px] p-[0px_16px] justify-start items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-2xl">
                    <Sparkles className="w-[16px] h-[16px] shrink-0" color="#8A7A69" />
                    <input
                      defaultValue={trip.name}
                      className="text-[15px]/[normal] box-border w-full bg-transparent text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-medium text-left outline-none"
                    />
                  </div>
                </div>
                <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[8px] justify-start items-start">
                  <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal tracking-[1px] text-left whitespace-nowrap">
                    DESTINATION
                  </div>
                  <div className="box-border w-full h-[52px] shrink-0 flex flex-row gap-[10px] p-[0px_16px] justify-start items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-2xl">
                    <MapPin className="w-[16px] h-[16px] shrink-0" color="#8A7A69" />
                    <input
                      defaultValue={trip.destination}
                      className="text-[15px]/[normal] box-border w-full bg-transparent text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-medium text-left outline-none"
                    />
                  </div>
                </div>
                <div className="box-border w-full h-fit shrink-0 flex flex-row gap-[12px] justify-start items-start">
                  <div className="box-border flex-1 h-fit flex flex-col gap-[8px] justify-start items-start">
                    <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal tracking-[1px] text-left whitespace-nowrap">
                      START DATE
                    </div>
                    <div className="box-border w-full h-[52px] shrink-0 flex flex-row gap-[8px] p-[0px_14px] justify-start items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-2xl">
                      <Calendar className="w-[15px] h-[15px] shrink-0" color="#8A7A69" />
                      <div className="text-[14px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-medium text-left whitespace-nowrap">
                        12 Oct
                      </div>
                    </div>
                  </div>
                  <div className="box-border flex-1 h-fit flex flex-col gap-[8px] justify-start items-start">
                    <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal tracking-[1px] text-left whitespace-nowrap">
                      END DATE
                    </div>
                    <div className="box-border w-full h-[52px] shrink-0 flex flex-row gap-[8px] p-[0px_14px] justify-start items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-2xl">
                      <Calendar className="w-[15px] h-[15px] shrink-0" color="#8A7A69" />
                      <div className="text-[14px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-medium text-left whitespace-nowrap">
                        18 Oct
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCreated(true)}
                className="box-border w-full h-[48px] shrink-0 flex flex-row gap-[8px] p-[16px_32px] justify-center items-center bg-[#121212] rounded-full"
              >
                <div className="text-[15px]/[normal] box-border text-[#FBF7F0] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                  Create trip
                </div>
                <Sparkles className="w-[17px] h-[17px] shrink-0" color="#FBF7F0" />
              </button>
            </>
          )}

          {created && (
            <>
              <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[14px] p-[34px_20px_20px_20px] justify-start items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-3xl relative">
                <div className="box-border w-fit h-fit [transform:rotate(8deg)] [transform-origin:top_left] [box-shadow:0px_4px_10px_0px_#4A3B2E24] absolute left-[-14px] top-[-16px] flex flex-row gap-[6px] p-[7px_13px] justify-start items-center bg-[#E8B62C] z-0">
                  <PartyPopper className="w-[13px] h-[13px] shrink-0" color="#4A3B2E" />
                  <div className="text-[12px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-bold text-left whitespace-nowrap">
                    YOU&apos;RE IN!
                  </div>
                </div>
                <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal tracking-[1px] text-left whitespace-nowrap relative z-10">
                  SHARE THIS CODE WITH YOUR CREW
                </div>
                <div className="text-[32px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-extrabold tracking-[2px] text-left whitespace-nowrap relative z-10">
                  {trip.inviteCode}
                </div>
                <div className="box-border w-full h-fit shrink-0 flex flex-row gap-[10px] justify-start items-start relative z-10">
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(trip.inviteCode)}
                    className="box-border flex-1 h-[46px] flex flex-row gap-[7px] justify-center items-center bg-[#F4EFE4] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-full"
                  >
                    <Copy className="w-[15px] h-[15px] shrink-0" color="#4A3B2E" />
                    <div className="text-[13px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                      Copy code
                    </div>
                  </button>
                  <button
                    type="button"
                    className="box-border flex-1 h-[46px] flex flex-row gap-[7px] justify-center items-center bg-[#121212] rounded-full"
                  >
                    <Share2 className="w-[15px] h-[15px] shrink-0" color="#FBF7F0" />
                    <div className="text-[13px]/[normal] box-border text-[#FBF7F0] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                      Share link
                    </div>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push(`/trips/${trip.id}/preferences`)}
                className="box-border w-full h-[48px] shrink-0 flex flex-row gap-[8px] p-[16px_32px] justify-center items-center bg-[#121212] rounded-full"
              >
                <div className="text-[15px]/[normal] box-border text-[#FBF7F0] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                  Continue
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
