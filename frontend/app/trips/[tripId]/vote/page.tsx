"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, Heart } from "lucide-react";
import { BottomNav } from "@/components/trip-quest/bottom-nav";
import { api, isAuthError, type Mission } from "@/lib/api";

export default function VoteHubPage() {
  const router = useRouter();
  const { tripId } = useParams<{ tripId: string }>();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const all = await api.listMissions(tripId);
        setMissions(all.filter((m) => m.status === "completed"));
      } catch (e) {
        if (isAuthError(e)) router.replace("/login");
        else setError("Couldn't load missions to rate.");
      } finally {
        setLoading(false);
      }
    })();
  }, [tripId, router]);

  return (
    <div className="min-h-svh w-full bg-[#F2F2ED] flex flex-col">
      <div className="mx-auto w-full max-w-[430px] flex flex-col flex-1">
        <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[18px] p-[16px_20px_20px_20px] justify-start items-start flex-1">
          <div className="box-border w-full flex flex-col gap-[2px]">
            <div className="text-[10px] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] tracking-[1px]">RATE YOUR CREW</div>
            <div className="text-[26px] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-extrabold">Vote</div>
          </div>

          {loading ? (
            <div className="w-full py-16 text-center font-sans text-[15px] text-[#8A7A69]">Loading…</div>
          ) : error ? (
            <div className="w-full py-10 text-center font-sans text-[14px] text-[#D0392F]">{error}</div>
          ) : missions.length === 0 ? (
            <div className="box-border w-full flex flex-col items-center gap-2 rounded-3xl border border-[#DDD2C0] bg-[#FBF7F0] px-6 py-10 text-center">
              <Heart className="w-[22px] h-[22px]" color="#C8901A" />
              <p className="font-sans text-[15px] font-semibold text-[#4A3B2E]">Nothing to rate yet</p>
              <p className="font-sans text-[13px] text-[#8A7A69]">Once the crew completes missions, rate the funniest, best photo and most creative here.</p>
            </div>
          ) : (
            <div className="box-border w-full flex flex-col gap-[12px]">
              {missions.map((m) => (
                <Link
                  key={m.id}
                  href={`/trips/${tripId}/missions/${m.id}/vote`}
                  className="box-border w-full flex flex-row gap-[12px] p-[16px] justify-start items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-2xl"
                >
                  <div className="box-border flex-1 h-fit flex flex-col gap-[3px]">
                    <div className="text-[15px] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold">{m.title}</div>
                    <div className="text-[11px] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] uppercase">{m.type} · {m.points} pts</div>
                  </div>
                  <ChevronRight className="w-[18px] h-[18px] shrink-0" color="#8A7A69" />
                </Link>
              ))}
            </div>
          )}
        </div>
        <BottomNav tripId={tripId} />
      </div>
    </div>
  );
}
