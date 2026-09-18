"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Camera, Laugh, Plus, Sparkles, Trophy, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/trip-quest/page-header";
import { api, isAuthError, type Mission, type RankingCount } from "@/lib/api";

const CATEGORIES: { id: string; label: string; icon: LucideIcon; color: string }[] = [
  { id: "funniest", label: "Funniest", icon: Laugh, color: "#E85A1C" },
  { id: "best_photo", label: "Best photo", icon: Camera, color: "#7FB8E0" },
  { id: "most_creative", label: "Most creative", icon: Sparkles, color: "#E87FA8" },
];

export default function VoteMissionPage() {
  const router = useRouter();
  const { tripId, missionId } = useParams<{ tripId: string; missionId: string }>();
  const [mission, setMission] = useState<Mission | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [voted, setVoted] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [all, ranks] = await Promise.all([api.listMissions(tripId), api.getRankings(missionId)]);
        setMission(all.find((m) => m.id === missionId) ?? null);
        setCounts(Object.fromEntries(ranks.map((r: RankingCount) => [r.category, r.count])));
      } catch (e) {
        if (isAuthError(e)) router.replace("/login");
      }
    })();
  }, [tripId, missionId, router]);

  async function vote(category: string) {
    if (voted || busy) return;
    setBusy(true);
    try {
      const updated = await api.rankMission(missionId, category);
      setCounts(Object.fromEntries(updated.map((r) => [r.category, r.count])));
      setVoted(category);
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-svh w-full bg-[#F4EFE4]">
      <div className="mx-auto w-full max-w-[430px]">
        <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[18px] p-[16px_20px_24px_20px] justify-start items-start">
          <PageHeader title="Rate this mission" />

          <div className="box-border w-full flex flex-col gap-[2px]">
            <div className="text-[12px] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] tracking-[1px]">COMPLETED MISSION</div>
            <div className="text-[20px] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-extrabold">{mission?.title ?? "…"}</div>
          </div>

          <div className="text-[11px] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] tracking-[1px]">CAST YOUR VOTE</div>

          <div className="box-border w-full flex flex-col gap-[10px]">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isVoted = voted === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => vote(cat.id)}
                  disabled={voted !== null || busy}
                  className="box-border w-full flex flex-row gap-[12px] p-[12px_14px] justify-start items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-2xl disabled:opacity-100"
                >
                  <div className="box-border w-[34px] shrink-0 h-[34px] flex flex-row justify-center items-center bg-black rounded-full">
                    <Icon className="w-[16px] h-[16px] shrink-0" color={cat.color} />
                  </div>
                  <div className="box-border flex-1 h-fit flex flex-col gap-[1px] justify-start items-start">
                    <div className="text-[14px] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold">{cat.label}</div>
                    <div className="text-[11px] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif]">{counts[cat.id] ?? 0} votes</div>
                  </div>
                  <div className={`box-border w-[40px] shrink-0 h-[40px] flex flex-row justify-center items-center rounded-full ${isVoted ? "bg-[#121212]" : "bg-[#F4EFE4] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px]"}`}>
                    <Plus className="w-[16px] h-[16px] shrink-0" color={isVoted ? "#FBF7F0" : "#4A3B2E"} />
                  </div>
                </button>
              );
            })}
          </div>

          {voted && (
            <>
              <div className="box-border w-full flex flex-row gap-[8px] p-[16px] justify-center items-center bg-[#121212] rounded-3xl">
                <Trophy className="w-[18px] h-[18px] shrink-0" color="#E8B62C" />
                <div className="text-[14px] box-border text-[#FBF7F0] font-[Geist,system-ui,sans-serif] font-semibold">Vote counted — nice one!</div>
              </div>
              <button
                type="button"
                onClick={() => router.push(`/trips/${tripId}/missions`)}
                className="box-border w-full h-[48px] flex flex-row gap-[8px] p-[16px_32px] justify-center items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-full"
              >
                <div className="text-[15px] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold">Back to missions</div>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
