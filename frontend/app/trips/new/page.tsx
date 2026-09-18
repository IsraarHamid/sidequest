"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Copy, MapPin, PartyPopper, Share2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/trip-quest/page-header";
import { api, ensureUser, joinLink } from "@/lib/api";

export default function CreateTripPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [created, setCreated] = useState<{ id: string; join_code: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    setError(null);
    setLoading(true);
    try {
      await ensureUser();
      const trip = await api.createTrip({
        name: name.trim() || "Our trip",
        destination: destination.trim() || undefined,
      });
      setCreated({ id: trip.id, join_code: trip.join_code });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the trip.");
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    if (!created) return;
    const url = joinLink(created.join_code);
    const text = `Join my SideQuest trip! Code: ${created.join_code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "SideQuest", text, url });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

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
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Cape Town Crew"
                      className="text-[15px]/[normal] box-border w-full bg-transparent text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-medium text-left outline-none placeholder:text-[#B7AA97]"
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
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Hermanus, South Africa"
                      className="text-[15px]/[normal] box-border w-full bg-transparent text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-medium text-left outline-none placeholder:text-[#B7AA97]"
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

              {error && (
                <div className="text-[13px]/[18px] box-border w-full text-[#D0392F] font-[Geist,system-ui,sans-serif] font-medium text-left">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleCreate}
                disabled={loading}
                className="box-border w-full h-[48px] shrink-0 flex flex-row gap-[8px] p-[16px_32px] justify-center items-center bg-[#121212] rounded-full disabled:opacity-60"
              >
                <div className="text-[15px]/[normal] box-border text-[#FBF7F0] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                  {loading ? "Creating…" : "Create trip"}
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
                  {created.join_code}
                </div>
                <div className="box-border w-full h-fit shrink-0 flex flex-row gap-[10px] justify-start items-start relative z-10">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(created.join_code);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    className="box-border flex-1 h-[46px] flex flex-row gap-[7px] justify-center items-center bg-[#F4EFE4] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-full"
                  >
                    <Copy className="w-[15px] h-[15px] shrink-0" color="#4A3B2E" />
                    <div className="text-[13px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                      {copied ? "Copied!" : "Copy code"}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
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
                onClick={() => router.push(`/trips/${created.id}/preferences`)}
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
