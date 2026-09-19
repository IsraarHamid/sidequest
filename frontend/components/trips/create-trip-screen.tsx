"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type DateRange } from "react-day-picker";
import { ArrowLeft } from "lucide-react";
import { cn } from "cn";
import { TripTicket, type QuestType } from "@/components/trips/trip-ticket";
import { TicketDesigner, type PlacedSticker } from "@/components/trips/ticket-designer";
import { api, ensureUser, joinLink, type Trip } from "@/lib/api";

const actionClassName = cn(
  "box-border flex h-12 w-full shrink-0 flex-row items-center justify-center rounded-full px-8",
  "font-sans text-[15px] font-semibold text-[#FBF7F0]",
  "transition-transform duration-[160ms] [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212]",
  "active:scale-[0.97]",
  "motion-reduce:transition-none motion-reduce:active:scale-100",
);

const backButtonClassName = cn(
  "flex size-[38px] shrink-0 items-center justify-center rounded-lg bg-[#F2F2ED]",
  "transition-transform duration-[160ms] [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212]",
  "active:scale-[0.97]",
  "motion-reduce:transition-none motion-reduce:active:scale-100",
);

const getToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// ponytail: the trip's ticket design (stickers + colour) has nowhere to live
// on the backend yet — Trip/TripCreate have no columns for it, and adding
// them means a Supabase migration this session can't run. Persisting it
// client-side keeps the feature usable today; wire it to a real column (and
// have the joiner's screen read it) once that migration lands.
const ticketDesignKey = (tripId: string) => `sidequest.ticketDesign.${tripId}`;

export const CreateTripScreen = () => {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "ticket">("details");
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ from: getToday(), to: undefined });
  const [questType, setQuestType] = useState<QuestType | null>(null);
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [createdTrip, setCreatedTrip] = useState<Trip | null>(null);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shared, setShared] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!startLocation.trim() || !endLocation.trim() || creating) return;
    if (createdTrip) {
      setStep("ticket");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await ensureUser();
      const fmt = (d?: Date) =>
        d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : undefined;
      const created = await api.createTrip({
        name: endLocation.trim(),
        origin: startLocation.trim(),
        destination: endLocation.trim(),
        quest_type: questType ?? undefined,
        start_date: fmt(dateRange.from),
        end_date: fmt(dateRange.to),
      });
      setCreatedTrip(created);
      setStep("ticket");
    } catch {
      setError("Couldn't create the trip. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleShareInvite = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      if (!createdTrip) return;
      try {
        window.localStorage.setItem(
          ticketDesignKey(createdTrip.id),
          JSON.stringify({ bgColor, stickers }),
        );
      } catch {
        /* ignore (private mode etc.) */
      }
      const url = joinLink(createdTrip.join_code);
      if (navigator.share) {
        await navigator.share({
          title: `${createdTrip.name} invite`,
          text: `Join my SideQuest trip with code ${createdTrip.join_code}.`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
      }
      router.push(`/trips/${createdTrip.id}/preferences`);
    } catch {
      setError("Couldn't share the invite. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-svh w-full flex-col overflow-x-hidden bg-[#F2F2ED]">
      <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col">
        <div className="box-border flex w-full flex-1 flex-col items-center gap-[22px] p-[16px_20px_24px_20px]">
          <header className="box-border flex w-full shrink-0 flex-row items-center gap-3">
            {step === "details" ? (
              <Link href="/" aria-label="Go back" className={backButtonClassName}>
                <ArrowLeft aria-hidden="true" className="size-4 text-[#4A3B2E]" />
              </Link>
            ) : (
              <button
                type="button"
                aria-label="Back"
                onClick={() => setStep("details")}
                className={backButtonClassName}
              >
                <ArrowLeft aria-hidden="true" className="size-4 text-[#4A3B2E]" />
              </button>
            )}
            <h1 className="font-sans text-[19px] font-semibold whitespace-nowrap text-[#4A3B2E]">
              Create a new trip
            </h1>
          </header>

          {step === "details" ? (
            <form
              onSubmit={handleContinue}
              className="flex w-full flex-1 flex-col items-center justify-between gap-[22px]"
            >
              <div className="flex flex-1 items-center justify-center">
                <TripTicket
                  startLocation={startLocation}
                  onStartLocationChange={setStartLocation}
                  endLocation={endLocation}
                  onEndLocationChange={setEndLocation}
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  questType={questType}
                  onQuestTypeChange={setQuestType}
                />
              </div>
              <button type="submit" className={cn(actionClassName, "bg-[#121212]")}>
                {creating ? "Creating…" : "Continue"}
              </button>
              {error && <p className="font-sans text-[13px] font-medium text-[#D0392F]">{error}</p>}
            </form>
          ) : (
            <div className="flex w-full flex-1 flex-col items-center justify-between gap-[22px]">
              <div className="flex flex-1 items-center justify-center">
                <TicketDesigner
                  stickers={stickers}
                  onStickersChange={setStickers}
                  bgColor={bgColor}
                  onBgColorChange={setBgColor}
                  inviteCode={createdTrip?.join_code}
                />
              </div>

              <div className="flex w-full flex-col items-center gap-3">
                {error && <p className="font-sans text-[13px] font-medium text-[#D0392F]">{error}</p>}
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleShareInvite}
                  className={cn(
                    actionClassName,
                    "bg-[#121212] disabled:opacity-60",
                    "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_4px_12px_rgba(18,18,18,0.18)]",
                  )}
                >
                  {submitting ? "Sharing…" : shared ? "Invite shared" : "Share invite"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
