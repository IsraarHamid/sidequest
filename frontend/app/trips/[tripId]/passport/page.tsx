"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Camera, CircleCheck, CircleDashed, MoonStar, Users, Utensils, Zap, type LucideIcon,
} from "lucide-react";
import { BottomNav } from "@/components/trip-quest/bottom-nav";
import { RankTabs } from "@/components/trip-quest/rank-tabs";
import { Avatar } from "@/components/trip-quest/avatar";
import { api, type Badge, type Trip, type User, type UserPhoto } from "@/lib/api";

const BADGE_ICONS: Record<string, LucideIcon> = { Utensils, Camera, Zap, Users, MoonStar };

export default function PassportPage() {
  const router = useRouter();
  const { tripId } = useParams<{ tripId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [missionsDone, setMissionsDone] = useState(0);
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [me, myTrips, pass, myPhotos] = await Promise.all([
          api.me(), api.myTrips(), api.passport(), api.myPhotos(),
        ]);
        setUser(me); setTrips(myTrips);
        setBadges(pass.badges); setMissionsDone(pass.missions_completed);
        setPhotos(myPhotos);
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading || !user) {
    return (
      <div className="min-h-svh w-full bg-[#F4EFE4] flex items-center justify-center">
        <p className="font-sans text-[15px] text-[#8A7A69]">Loading passport…</p>
      </div>
    );
  }

  return (
    <div className="min-h-svh w-full bg-[#F4EFE4] flex flex-col">
      <div className="mx-auto w-full max-w-[430px] flex flex-col flex-1">
        <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[20px] p-[16px_20px_20px_20px] justify-start items-start flex-1">
          <div className="text-[10px] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] tracking-[1px]">YOUR TRAVEL PASSPORT</div>

          <RankTabs tripId={tripId} />

          <div className="box-border w-full flex flex-row gap-[14px] justify-start items-center">
            <Avatar initials={user.initials ?? "SQ"} color={user.avatar_color ?? "#3E6B4A"} size={56} fontSize={18} />
            <div className="box-border w-fit shrink-0 h-fit flex flex-col gap-[2px] justify-start items-start">
              <div className="text-[19px] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-extrabold">{user.display_name}&apos;s passport</div>
              <div className="text-[11px] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif]">
                {trips.length} destination{trips.length === 1 ? "" : "s"} · {badges.length} badge{badges.length === 1 ? "" : "s"} · {missionsDone} missions
              </div>
            </div>
          </div>

          <div className="text-[11px] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] tracking-[1px]">DESTINATIONS</div>
          <div className="box-border w-full flex flex-col gap-[10px]">
            {trips.length === 0 ? (
              <p className="font-sans text-[13px] text-[#8A7A69]">No trips yet.</p>
            ) : trips.map((t) => (
              <div key={t.id} className="box-border w-full flex flex-row gap-[12px] p-[12px_14px] justify-start items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-2xl">
                {t.status === "arrived" || t.status === "ended"
                  ? <CircleCheck className="w-[18px] h-[18px] shrink-0" color="#3E6B4A" />
                  : <CircleDashed className="w-[18px] h-[18px] shrink-0" color="#8A7A69" />}
                <div className="box-border flex-1 h-fit flex flex-col gap-[1px] justify-start items-start">
                  <div className="text-[14px] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold">{t.destination || t.name}</div>
                  <div className="text-[11px] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] uppercase">{t.status}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] tracking-[1px]">BADGES EARNED</div>
          <div className="box-border w-full flex flex-row flex-wrap gap-[12px] justify-start items-start">
            {badges.length === 0 ? (
              <p className="font-sans text-[13px] text-[#8A7A69]">Complete a mission to earn your first badge.</p>
            ) : badges.map((b) => {
              const Icon = BADGE_ICONS[b.icon] ?? Utensils;
              return (
                <div key={b.code} className="box-border grow basis-[28%] h-fit flex flex-col gap-[8px] p-[14px] justify-start items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-3xl">
                  <div className="box-border w-[40px] h-[40px] shrink-0 flex flex-row justify-center items-center bg-black rounded-full">
                    <Icon className="w-[19px] h-[19px] shrink-0" color="#E8B62C" />
                  </div>
                  <div className="text-[11px] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-center">{b.name}</div>
                </div>
              );
            })}
          </div>

          {photos.length > 0 && (
            <>
              <div className="text-[11px] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] tracking-[1px]">YOUR PHOTOS</div>
              <div className="box-border w-full grid grid-cols-3 gap-[10px]">
                {photos.slice(0, 6).map((p, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={p.photo_url} alt={p.mission_title ?? "photo"} className="h-[100px] w-full rounded-2xl object-cover" />
                ))}
              </div>
            </>
          )}
        </div>

        <BottomNav tripId={tripId} />
      </div>
    </div>
  );
}
