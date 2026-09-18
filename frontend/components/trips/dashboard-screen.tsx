import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "cn";
import { CREW, DEFAULT_TRIP_ID, getTrip } from "@/lib/trip-quest-data";
import { PhotoStack } from "@/components/trips/photo-stack";
import { StampAvatar } from "@/components/trips/stamp-avatar";

type Album = {
  id: string;
  monthLabel: string;
  tripId: string;
  layout: "loose" | "compact";
};

const ALBUMS: Album[] = [
  { id: "march-a", monthLabel: "March 2025", tripId: "lisbon-legends", layout: "loose" },
  { id: "march-b", monthLabel: "March 2025", tripId: "lisbon-legends", layout: "compact" },
  { id: "april", monthLabel: "April 2025", tripId: "lisbon-legends", layout: "compact" },
];

const actionClassName =
  "box-border flex h-12 w-fit shrink-0 flex-row items-center justify-center gap-2 rounded-full px-4 py-[14px] transition-transform duration-[160ms] [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";

export const TripsDashboard = () => {
  const owner = CREW.find((member) => member.id === "jackie") ?? CREW[0];

  return (
    <main className="flex min-h-svh w-full flex-col overflow-x-hidden bg-[#F2F2ED]">
      <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col">
        <div className="box-border flex w-full shrink-0 flex-col items-start justify-start gap-[22px] p-[16px_20px_20px_20px]">
          <div className="box-border flex w-full shrink-0 flex-row items-center justify-between gap-[22px]">
            <StampAvatar
              initials={owner.initials}
              color={owner.color}
              label={`Open ${owner.name}'s menu`}
              profileHref={`/trips/${DEFAULT_TRIP_ID}/passport`}
              preferencesHref={`/trips/${DEFAULT_TRIP_ID}/preferences`}
              logoutHref="/login"
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

          <div className="box-border flex w-full shrink-0 flex-col items-start justify-start gap-[37px]">
            {ALBUMS.map((album) => {
              const trip = getTrip(album.tripId);
              return (
                <PhotoStack
                  key={album.id}
                  monthLabel={album.monthLabel}
                  destination={trip.destination}
                  href={`/trips/${trip.id}/missions`}
                  layout={album.layout}
                />
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
};
