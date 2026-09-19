"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Medal } from "lucide-react";
import { BottomNav } from "@/components/trip-quest/bottom-nav";
import { RankTabs } from "@/components/trip-quest/rank-tabs";
import { Avatar } from "@/components/trip-quest/avatar";
import { api, isAuthError, type LeaderboardEntry, type Trip } from "@/lib/api";

const COLORS = ["#E85A1C", "#3E6B4A", "#E87FA8", "#7FB8E0", "#C8901A", "#D0392F"];

function initialsOf(name: string) {
  const parts = (name || "").split(" ").filter(Boolean);
  if (parts.length === 0) return "SQ";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [lb, t] = await Promise.all([api.leaderboard(tripId), api.getTrip(tripId)]);
        setRows(lb);
        setTrip(t);
      } catch (e) {
        if (isAuthError(e)) router.replace("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [tripId, router]);

  const memberMeta = new Map(
    (trip?.members ?? []).map((m) => [m.user_id, { initials: m.initials, color: m.avatar_color }]),
  );
  const meta = (id: string, name: string, i: number) => {
    const m = memberMeta.get(id);
    return { initials: m?.initials || initialsOf(name), color: m?.color || COLORS[i % COLORS.length] };
  };
  const leader = rows[0];

  return (
    <div className="min-h-svh w-full bg-[#F2F2ED] flex flex-col">
      <div className="mx-auto w-full max-w-[430px] flex flex-col flex-1">
        <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[18px] p-[16px_20px_20px_20px] justify-start items-start flex-1">
          <div className="text-[10px] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] tracking-[1px] uppercase">
            {trip?.name ?? "Trip"}
          </div>

          <RankTabs tripId={tripId} />

          {loading ? (
            <div className="w-full py-16 text-center font-sans text-[15px] text-[#8A7A69]">Loading rankings…</div>
          ) : rows.length === 0 ? (
            <div className="w-full py-16 text-center font-sans text-[14px] text-[#8A7A69]">
              No points yet — complete a mission to get on the board.
            </div>
          ) : (
            <>
              {leader && leader.total_points > 0 && (
                <div className="box-border w-full h-fit shrink-0 flex flex-row gap-[12px] p-[16px] justify-start items-center bg-[#C8901A1F] [outline:1px_solid_#C8901A] [outline-offset:-0.5px] rounded-3xl">
                  <div className="box-border w-[40px] shrink-0 h-[40px] flex flex-row justify-center items-center bg-[#E8B62C] rounded-full">
                    <Medal className="w-[19px] h-[19px] shrink-0" color="#4A3B2E" />
                  </div>
                  <div className="box-border flex-1 h-fit flex flex-col gap-[1px] justify-start items-start">
                    <div className="text-[14px] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold">
                      {leader.display_name} is in the lead!
                    </div>
                    <div className="text-[11px] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif]">
                      {leader.total_points.toLocaleString()} pts
                    </div>
                  </div>
                </div>
              )}

              <div className="box-border w-full flex flex-row justify-between items-center mt-[10px]">
                <div className="text-[16px] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold">Rankings</div>
                <div className="text-[11px] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] uppercase">{trip?.status}</div>
              </div>

              <div className="box-border w-full flex flex-col gap-[10px]">
                {rows.map((row, i) => {
                  const isFirst = i === 0;
                  const m = meta(row.user_id, row.display_name, i);
                  return (
                    <div
                      key={row.user_id}
                      className={`box-border w-full flex flex-row gap-[14px] p-[14px_16px] justify-start items-center rounded-2xl ${
                        isFirst
                          ? "bg-[#C8901A14] [outline:1px_solid_#C8901A] [outline-offset:-0.5px]"
                          : "bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px]"
                      }`}
                    >
                      <div className={`text-[18px] box-border w-[22px] shrink-0 font-[Geist,system-ui,sans-serif] font-extrabold text-center ${isFirst ? "text-[#C8901A]" : "text-[#8A7A69]"}`}>
                        {i + 1}
                      </div>
                      <Avatar initials={m.initials} color={m.color} />
                      <div className="box-border flex-1 h-fit flex flex-col gap-[2px] justify-start items-start">
                        <div className="text-[15px] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold">
                          {row.display_name}
                        </div>
                      </div>
                      <div className="text-[18px] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-extrabold whitespace-nowrap">
                        {row.total_points.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <BottomNav tripId={tripId} />
      </div>
    </div>
  );
}
