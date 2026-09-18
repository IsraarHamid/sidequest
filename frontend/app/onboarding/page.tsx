"use client";

import { useRouter } from "next/navigation";
import { Compass, MapPin, Sparkles, User } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="min-h-svh w-full bg-[#F4EFE4]">
      <div className="mx-auto w-full max-w-[430px]">
        <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[26px] p-[20px_20px_24px_20px] justify-start items-start">
          <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[14px] p-[6px_0px_0px_0px] justify-start items-start">
            <div className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-start">
              <div className="box-border w-[56px] shrink-0 h-[56px] flex flex-row gap-0 justify-center items-center bg-[#121212] rounded-2xl">
                <Compass className="w-[28px] h-[28px] shrink-0" color="#FBF7F0" />
              </div>
              <div className="box-border relative w-[120px] h-[46px] shrink-0">
                <div className="box-border w-fit h-fit [transform:rotate(-8deg)] [transform-origin:top_left] [box-shadow:0px_4px_10px_0px_#4A3B2E24] absolute left-0 top-[16px] flex flex-row gap-[6px] p-[7px_13px] justify-start items-center bg-[#E8B62C]">
                  <MapPin className="w-[13px] h-[13px] shrink-0" color="#4A3B2E" />
                  <div className="text-[12px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-bold text-left whitespace-nowrap">
                    QUEST TIME
                  </div>
                </div>
              </div>
            </div>
            <div className="text-[44px]/[46px] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-extrabold tracking-[-0.5px] text-left whitespace-nowrap">
              Trip Quest
            </div>
            <div className="text-[15px]/[23px] box-border w-full text-[#8A7A69] font-[Geist,system-ui,sans-serif] font-normal text-left">
              Turn your next trip into a game. AI-made missions, real points, bragging rights.
            </div>
          </div>

          <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[8px] justify-start items-start">
            <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal tracking-[1px] text-left whitespace-nowrap">
              YOUR NAME
            </div>
            <div className="box-border w-full h-[52px] shrink-0 flex flex-row gap-[10px] p-[0px_16px] justify-start items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-2xl">
              <User className="w-[16px] h-[16px] shrink-0" color="#8A7A69" />
              <input
                defaultValue="Jackie"
                className="text-[15px]/[normal] box-border w-full bg-transparent text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-medium text-left outline-none"
              />
            </div>
          </div>

          <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[10px] justify-start items-start">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="box-border w-full h-[48px] shrink-0 flex flex-row gap-[8px] p-[16px_32px] justify-center items-center bg-[#121212] rounded-full"
            >
              <div className="text-[15px]/[normal] box-border text-[#FBF7F0] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                Create account
              </div>
              <Sparkles className="w-[17px] h-[17px] shrink-0" color="#FBF7F0" />
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="box-border w-full h-[48px] shrink-0 flex flex-row gap-[8px] p-[15px_32px] justify-center items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-full"
            >
              <div className="text-[15px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                Continue on Google
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
