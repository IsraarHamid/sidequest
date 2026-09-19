"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "cn";
import { api, type Trip, type User } from "@/lib/api";
import { PhotoStack } from "@/components/trips/photo-stack";
import { StampAvatar } from "@/components/trips/stamp-avatar";
import { TripTicket } from "@/components/trips/trip-ticket";
import { STICKERS } from "@/lib/stickers";

const actionClassName =
  "box-border flex h-12 w-fit shrink-0 flex-row items-center justify-center gap-2 rounded-full px-4 py-[14px] transition-transform duration-[160ms] [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";

const getToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// ponytail: old sticker plays its shrink-out then unmounts via a timeout —
// no animation library needed for a one-shot exit/enter pair.
const StickerCycle = () => {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);

  useEffect(() => {
    if (prevIndex === null) return;
    const timer = setTimeout(() => setPrevIndex(null), 180);
    return () => clearTimeout(timer);
  }, [prevIndex]);

  const handleClick = () => {
    setPrevIndex(index);
    setIndex((current) => (current + 1) % STICKERS.length);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Next sticker"
      className="relative grid h-[186px] w-[162px] place-items-center"
    >
      {prevIndex !== null && (
        <img
          key={`prev-${prevIndex}`}
          src={STICKERS[prevIndex]}
          alt=""
          aria-hidden="true"
          className="sticker-out col-start-1 row-start-1 h-[186px] w-[162px] object-contain"
        />
      )}
      <img
        key={`current-${index}`}
        src={STICKERS[index]}
        alt=""
        aria-hidden="true"
        className="sticker-in col-start-1 row-start-1 h-[186px] w-[162px] object-contain"
      />
    </button>
  );
};

export const TripsDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [coverByTrip, setCoverByTrip] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await api.me(); // 401 if not signed in
        if (cancelled) return;
        setUser(me);
        const [myTrips, myPhotos] = await Promise.all([api.myTrips(), api.myPhotos()]);
        if (cancelled) return;
        setTrips(myTrips);
        // Use each trip's first uploaded photo as its cover.
        const covers: Record<string, string> = {};
        for (const p of myPhotos) {
          if (p.trip_id && p.photo_url && !covers[p.trip_id]) covers[p.trip_id] = p.photo_url;
        }
        setCoverByTrip(covers);
      } catch (e) {
        if (cancelled) return;
        // ponytail: local dev — skip the /login redirect on 401 too, so the
        // site stays navigable without signing in. Remove for real auth gating.
        void e;
        setUser({
          id: "mock-user",
          display_name: "Test User",
          is_admin: false,
          auth_provider: "anonymous",
          preferences: { interests: [] },
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !user) {
    return (
      <main className="flex min-h-svh w-full items-center justify-center bg-[#F2F2ED]">
        <p className="font-sans text-[15px] text-[#8A7A69]">Loading…</p>
      </main>
    );
  }

  if (trips.length === 0) {
    return (
      <main className="flex min-h-svh w-full flex-col overflow-x-hidden bg-[#F2F2ED]">
        <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col items-center gap-[22px] p-[16px_20px_20px_20px]">
          <div className="box-border flex w-full flex-row items-center justify-between gap-[22px]">
            <StampAvatar
              initials={user.initials ?? "SQ"}
              color={user.avatar_color ?? "#3E6B4A"}
              label={`Open ${user.display_name}'s menu`}
              profileHref="/profile"
              preferencesHref="/login"
              logoutHref="/login?logout=1"
            />

            <div className="box-border flex h-fit flex-1 flex-row items-center justify-end gap-3">
              <Link
                href="/trips/new"
                aria-label="Create trip"
                className={cn(
                  actionClassName,
                  "bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px]",
                  "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_4px_12px_rgba(74,59,46,0.08)]",
                )}
              >
                <span className="font-sans text-[14px] font-semibold whitespace-nowrap text-[#4A3B2E]">
                  Create
                </span>
              </Link>
              <Link
                href="/trips/join"
                aria-label="Join trip"
                className={cn(
                  actionClassName,
                  "bg-[#121212]",
                  "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_4px_12px_rgba(18,18,18,0.18)]",
                )}
              >
                <span className="font-sans text-[14px] font-semibold whitespace-nowrap text-[#FBF7F0]">
                  Join
                </span>
                <Plus
                  aria-hidden="true"
                  className="h-[17px] w-[17px] shrink-0 text-[#FBF7F0]"
                  strokeWidth={2.5}
                />
              </Link>
            </div>
          </div>

          <p className="w-full text-center font-sans text-[22px] font-extrabold text-[#4A3B2E]/50">
            No trips yet
          </p>

          <div className="flex w-full flex-1 flex-col items-center justify-center gap-[22px] py-2">
            <Link href="/trips/new" aria-label="Create a new trip" className="relative block shrink-0">
              <div className="pointer-events-none">
                <TripTicket
                  startLocation=""
                  onStartLocationChange={() => {}}
                  endLocation=""
                  onEndLocationChange={() => {}}
                  dateRange={{ from: getToday(), to: undefined }}
                  onDateRangeChange={() => {}}
                  questType={null}
                  onQuestTypeChange={() => {}}
                />
              </div>
            </Link>
          </div>

          <StickerCycle />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-svh w-full flex-col overflow-x-hidden bg-[#F2F2ED]">
      <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col">
        <div className="box-border flex w-full shrink-0 flex-col items-start justify-start gap-[22px] p-[16px_20px_20px_20px]">
          <div className="box-border flex w-full shrink-0 flex-row items-center justify-between gap-[22px]">
            <StampAvatar
              initials={user.initials ?? "SQ"}
              color={user.avatar_color ?? "#3E6B4A"}
              label={`Open ${user.display_name}'s menu`}
              profileHref="/profile"
              preferencesHref="/login"
              logoutHref="/login?logout=1"
            />

            <div className="box-border flex h-fit flex-1 flex-row items-center justify-end gap-3">
              <Link
                href="/trips/new"
                aria-label="Create trip"
                className={cn(
                  actionClassName,
                  "bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px]",
                  "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_4px_12px_rgba(74,59,46,0.08)]",
                )}
              >
                <span className="font-sans text-[14px] font-semibold whitespace-nowrap text-[#4A3B2E]">
                  Create
                </span>
              </Link>
              <Link
                href="/trips/join"
                aria-label="Join trip"
                className={cn(
                  actionClassName,
                  "bg-[#121212]",
                  "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_4px_12px_rgba(18,18,18,0.18)]",
                )}
              >
                <span className="font-sans text-[14px] font-semibold whitespace-nowrap text-[#FBF7F0]">
                  Join
                </span>
                <Plus
                  aria-hidden="true"
                  className="h-[17px] w-[17px] shrink-0 text-[#FBF7F0]"
                  strokeWidth={2.5}
                />
              </Link>
            </div>
          </div>

          <div className="box-border flex w-full shrink-0 flex-col items-start justify-start gap-1">
            <p className="font-sans text-[13px] font-medium tracking-[1px] text-[#8A7A69] uppercase">
              Welcome{user.display_name ? `, ${user.display_name}` : ""}
            </p>
            <h1 className="font-sans text-[22px] font-extrabold text-[#4A3B2E]">
              Your trips
            </h1>
          </div>

          <div className="box-border flex w-full shrink-0 flex-col items-start justify-start gap-[37px]">
            {trips.map((trip) => (
              <PhotoStack
                key={trip.id}
                monthLabel={trip.destination ?? trip.name}
                destination={trip.destination ?? trip.name}
                href={`/trips/${trip.id}/missions`}
                layout="loose"
                imageUrl={coverByTrip[trip.id]}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};
