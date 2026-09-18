"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Flame } from "lucide-react";
import { BottomNav } from "@/components/trip-quest/bottom-nav";
import { MissionCard } from "@/components/trip-quest/mission-card";
import { api, isAuthError, type Mission as ApiMission, type Trip } from "@/lib/api";
import type { Mission as CardMission } from "@/lib/trip-quest-data";

function toCard(m: ApiMission, tripId: string): CardMission {
  const kind = m.type === "group" ? "group" : "solo";
  const completed = m.status === "completed";
  return {
    id: m.id,
    tripId,
    category: m.is_secret ? "SECRET" : m.type.toUpperCase(),
    icon: m.type === "group" ? "Users" : m.is_secret ? "Camera" : "Utensils",
    title: m.title,
    shortDescription: m.description ?? "",
    longDescription: m.description ?? "",
    hint: "",
    points: m.points,
    timeLeft: m.is_expired ? "Expired" : m.expires_at ? "Timed" : "",
    kind,
    kindLabel: m.is_secret ? "SECRET MISSION" : kind === "group" ? "WHOLE CREW" : "SOLO MISSION",
    status: completed ? "completed" : "not-started",
    statusLabel: completed ? "Completed" : m.is_expired ? "Expired" : "Not started",
    accentColor: "#E8B62C",
  };
}

export default function MissionsListPage() {
  const router = useRouter();
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [missions, setMissions] = useState<ApiMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [t, ms] = await Promise.all([api.getTrip(tripId), api.listMissions(tripId)]);
      setTrip(t);
      setMissions(ms);
    } catch (e) {
      if (isAuthError(e)) router.replace("/login");
      else setError("Couldn't load missions. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [tripId, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const ms = await api.startTrip(tripId);
      setMissions(ms);
    } catch {
      setError("Couldn't generate missions. Try again.");
    } finally {
      setGenerating(false);
    }
  }

  const solo = missions.filter((m) => m.type !== "group" && m.status !== "completed").map((m) => toCard(m, tripId));
  const group = missions.filter((m) => m.type === "group" && m.status !== "completed").map((m) => toCard(m, tripId));
  const completed = missions.filter((m) => m.status === "completed").map((m) => toCard(m, tripId));

  return (
    <div className="min-h-svh w-full bg-[#F4EFE4] flex flex-col">
      <div className="mx-auto w-full max-w-[430px] flex flex-col flex-1">
        <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[20px] p-[16px_20px_20px_20px] justify-start items-start flex-1">
          <div className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-center">
            <div className="box-border w-fit shrink-0 h-fit flex flex-col gap-[2px] justify-start items-start">
              <div className="text-[10px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal tracking-[1px] text-left whitespace-nowrap">
                {(trip?.destination || trip?.name || "").toUpperCase()}
              </div>
              <div className="text-[26px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-extrabold text-left whitespace-nowrap">
                Missions
              </div>
            </div>
            <div className="box-border w-fit shrink-0 h-fit flex flex-row gap-[6px] p-[8px_12px] justify-start items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-lg">
              <Flame className="w-[14px] h-[14px] shrink-0" color="#C8901A" />
              <div className="text-[12px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-bold text-left whitespace-nowrap uppercase">
                {trip?.status ?? "trip"}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="w-full py-16 text-center font-sans text-[15px] text-[#8A7A69]">Loading missions…</div>
          ) : missions.length === 0 ? (
            <div className="box-border w-full flex flex-col items-center gap-3 rounded-3xl border border-[#DDD2C0] bg-[#FBF7F0] px-6 py-10 text-center">
              <p className="font-sans text-[16px] font-semibold text-[#4A3B2E]">No missions yet</p>
              <p className="font-sans text-[14px] text-[#8A7A69]">
                Generate AI missions for your crew based on everyone&apos;s preferences.
              </p>
              {error && <p className="font-sans text-[13px] text-[#D0392F]">{error}</p>}
              <button
                type="button"
                onClick={generate}
                disabled={generating}
                className="mt-1 flex h-11 items-center justify-center rounded-full bg-[#121212] px-6 font-sans text-[14px] font-semibold text-[#FBF7F0] disabled:opacity-60"
              >
                {generating ? "Generating…" : "Generate missions"}
              </button>
            </div>
          ) : (
            <>
              <SectionHeader title="My missions" note={`${solo.length} open`} />
              <div className="box-border w-full flex flex-col gap-[14px]">
                {solo.map((m) => <MissionCard key={m.id} mission={m} tripId={tripId} />)}
              </div>

              {group.length > 0 && (
                <>
                  <SectionHeader title="Group mission" note={`${group.length} active`} />
                  <div className="box-border w-full flex flex-col gap-[14px]">
                    {group.map((m) => <MissionCard key={m.id} mission={m} tripId={tripId} />)}
                  </div>
                </>
              )}

              {completed.length > 0 && (
                <>
                  <SectionHeader title="Completed" note={`${completed.length} missions`} />
                  <div className="box-border w-full flex flex-col gap-[14px]">
                    {completed.map((m) => <MissionCard key={m.id} mission={m} tripId={tripId} />)}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <BottomNav tripId={tripId} />
      </div>
    </div>
  );
}

function SectionHeader({ title, note }: { title: string; note: string }) {
  return (
    <div className="box-border w-full flex flex-row justify-between items-center">
      <div className="text-[16px] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold">{title}</div>
      <div className="text-[11px] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif]">{note}</div>
    </div>
  );
}
