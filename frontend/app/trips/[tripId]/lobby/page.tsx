"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Copy, Ticket, Users, WandSparkles } from "lucide-react";
import { PageHeader } from "@/components/trip-quest/page-header";
import { Avatar } from "@/components/trip-quest/avatar";
import { api, type Trip } from "@/lib/api";

export default function TripLobbyPage() {
  const router = useRouter();
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setTrip(await api.getTrip(tripId));
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [tripId, router]);

  if (loading || !trip) {
    return (
      <div className="min-h-svh w-full bg-[#F4EFE4] flex items-center justify-center">
        <p className="font-sans text-[15px] text-[#8A7A69]">Loading lobby…</p>
      </div>
    );
  }

  const dates = trip.start_date
    ? `${trip.start_date}${trip.end_date ? ` – ${trip.end_date}` : ""}`
    : "Dates TBD";

  return (
    <div className="min-h-svh w-full bg-[#F4EFE4]">
      <div className="mx-auto w-full max-w-[430px]">
        <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[20px] p-[16px_20px_24px_20px] justify-start items-start">
          <PageHeader title="Trip Lobby" />

          <div className="box-border w-full h-fit shrink-0 [box-shadow:0px_1px_2px_0px_#4A3B2E14] flex flex-col gap-0 justify-start items-start bg-[#FBF7F0] rounded-3xl relative">
            <div className="box-border w-full h-[150px] shrink-0 rounded-t-3xl overflow-hidden relative z-0 bg-gradient-to-br from-[#DCEBF5] to-[#C8901A33]" />
            <div className="box-border w-fit h-fit [transform:rotate(6deg)] [transform-origin:top_left] [box-shadow:0px_4px_10px_0px_#4A3B2E24] absolute left-[-10px] top-[124px] flex flex-row gap-[6px] p-[7px_13px] justify-start items-center bg-[#E8B62C] z-10">
              <Users className="w-[13px] h-[13px] shrink-0" color="#4A3B2E" />
              <div className="text-[12px] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-bold">LOBBY</div>
            </div>
            <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[6px] p-[22px_16px_16px_16px] justify-start items-start relative z-20">
              <div className="text-[22px] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-extrabold">
                {trip.destination || trip.name}
              </div>
              <div className="box-border w-fit h-fit shrink-0 flex flex-row gap-[6px] justify-start items-center">
                <Calendar className="w-[13px] h-[13px] shrink-0" color="#8A7A69" />
                <div className="text-[12px] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif]">{dates}</div>
              </div>
            </div>
          </div>

          <div className="box-border w-full h-fit shrink-0 flex flex-row p-[13px_16px] justify-between items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-2xl">
            <div className="box-border w-fit shrink-0 h-fit flex flex-row gap-[10px] justify-start items-center">
              <Ticket className="w-[16px] h-[16px] shrink-0" color="#C8901A" />
              <div className="box-border w-fit shrink-0 h-fit flex flex-col gap-[1px] justify-start items-start">
                <div className="text-[10px] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] tracking-[1px]">INVITE CODE</div>
                <div className="text-[18px] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-extrabold tracking-[1px]">{trip.join_code}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { navigator.clipboard?.writeText(trip.join_code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              aria-label="Copy invite code"
              className="box-border w-fit shrink-0 h-[36px] px-3 flex flex-row gap-[6px] justify-center items-center bg-[#F4EFE4] rounded-lg"
            >
              <Copy className="w-[15px] h-[15px] shrink-0" color="#4A3B2E" />
              {copied && <span className="text-[11px] text-[#3E6B4A] font-sans font-semibold">Copied</span>}
            </button>
          </div>

          <div className="box-border w-full h-fit shrink-0 flex flex-row justify-between items-center">
            <div className="text-[17px] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold">Crew</div>
            <div className="text-[11px] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif]">{trip.members.length} travellers</div>
          </div>

          <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[10px] justify-start items-start">
            {trip.members.map((m) => (
              <div key={m.user_id} className="box-border w-full flex flex-row gap-[12px] p-[12px_14px] justify-start items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-2xl">
                <Avatar initials={m.initials ?? "SQ"} color={m.avatar_color ?? "#3E6B4A"} />
                <div className="box-border flex-1 h-fit flex flex-col gap-[3px] justify-start items-start">
                  <div className="text-[14px] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold">{m.display_name}</div>
                  <div className="text-[11px] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] uppercase">{m.role}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => router.push(`/trips/${tripId}/missions`)}
            className="box-border w-full h-[56px] shrink-0 flex flex-row gap-[9px] justify-center items-center bg-[#121212] rounded-full"
          >
            <WandSparkles className="w-[18px] h-[18px] shrink-0" color="#FBF7F0" />
            <div className="text-[16px] box-border text-[#FBF7F0] font-[Geist,system-ui,sans-serif] font-semibold">Generate missions</div>
          </button>
        </div>
      </div>
    </div>
  );
}
