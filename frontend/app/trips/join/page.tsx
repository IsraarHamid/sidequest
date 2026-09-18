"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Info, SearchCheck, TreePalm } from "lucide-react";
import { PageHeader } from "@/components/trip-quest/page-header";
import { Avatar } from "@/components/trip-quest/avatar";
import { api, ensureUser, type Trip } from "@/lib/api";

export default function JoinTripPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill the code from an invite link (?code=12345) without needing Suspense.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("code");
    if (c) setCode(c.replace(/\D/g, "").slice(0, 5));
  }, []);

  async function handleJoin() {
    const clean = code.replace(/\D/g, "");
    if (clean.length !== 5) {
      setError("Enter the 5-digit trip code your crew shared.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await ensureUser();
      const joined = await api.joinTrip(clean);
      setTrip(joined);
    } catch {
      setError("No trip found for that code. Double-check it and try again.");
    } finally {
      setLoading(false);
    }
  }

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
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleJoin();
              }}
              placeholder="12345"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={5}
              className="text-[28px]/[normal] box-border w-full h-[64px] bg-[#FBF7F0] [outline:2px_solid_#4A3B2E] [outline-offset:-1px] rounded-2xl px-[18px] text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-extrabold tracking-[6px] text-center outline-none placeholder:text-[#DDD2C0] placeholder:tracking-[6px]"
            />
            <div className="box-border w-full h-fit shrink-0 flex flex-row gap-[7px] justify-start items-center">
              <Info className="w-[14px] h-[14px] shrink-0" color="#8A7A69" />
              <div className="text-[13px]/[18px] box-border flex-1 text-[#8A7A69] font-[Geist,system-ui,sans-serif] font-normal text-left">
                Ask your crew for the trip code, or open their invite link.
              </div>
            </div>
          </div>

          {error && (
            <div className="text-[13px]/[18px] box-border w-full text-[#D0392F] font-[Geist,system-ui,sans-serif] font-medium text-left">
              {error}
            </div>
          )}

          {!trip && (
            <button
              type="button"
              onClick={handleJoin}
              disabled={loading}
              className="box-border w-full h-[48px] shrink-0 flex flex-row gap-[8px] p-[16px_32px] justify-center items-center bg-[#121212] rounded-full disabled:opacity-60"
            >
              <div className="text-[15px]/[normal] box-border text-[#FBF7F0] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                {loading ? "Finding…" : "Join trip"}
              </div>
              <ArrowRight className="w-[17px] h-[17px] shrink-0" color="#FBF7F0" />
            </button>
          )}

          {trip && (
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
                    {trip.destination ?? "Destination TBD"}
                  </div>
                </div>
              </div>
              <div className="box-border w-full h-[1px] shrink-0 bg-[#DDD2C0] relative z-10" />
              <div className="box-border w-full h-fit shrink-0 flex flex-row gap-[10px] justify-start items-center relative z-10">
                <div className="box-border w-fit shrink-0 h-fit flex flex-row -space-x-[10px] justify-start items-center">
                  {trip.members.slice(0, 4).map((m) => (
                    <Avatar
                      key={m.user_id}
                      initials={m.display_name.slice(0, 2).toUpperCase()}
                      color="#3E6B4A"
                      size={34}
                      fontSize={12}
                    />
                  ))}
                </div>
                <div className="text-[13px]/[normal] box-border flex-1 text-[#8A7A69] font-[Geist,system-ui,sans-serif] font-medium text-left">
                  {trip.members.length} traveller{trip.members.length === 1 ? "" : "s"} in
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
