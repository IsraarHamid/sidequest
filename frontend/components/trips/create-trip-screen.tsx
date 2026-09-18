"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type DateRange } from "react-day-picker";
import { ArrowLeft } from "lucide-react";
import { cn } from "cn";
import { TripTicket, type QuestType } from "@/components/trips/trip-ticket";
import { api, ensureUser } from "@/lib/api";

const actionClassName = cn(
  "box-border flex h-12 w-full shrink-0 flex-row items-center justify-center rounded-full px-8",
  "font-sans text-[15px] font-semibold text-[#FBF7F0]",
  "transition-transform duration-[160ms] [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212]",
  "active:scale-[0.97]",
  "motion-reduce:transition-none motion-reduce:active:scale-100",
);

const getToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export const CreateTripScreen = () => {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ from: getToday(), to: undefined });
  const [questType, setQuestType] = useState<QuestType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTrip = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = location.trim();
    if (!name || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await ensureUser();
      const fmt = (d?: Date) =>
        d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : undefined;
      const created = await api.createTrip({
        name,
        destination: name,
        start_date: fmt(dateRange.from),
        end_date: fmt(dateRange.to),
      });
      router.push(`/trips/${created.id}/preferences`);
    } catch {
      setError("Couldn't create the trip. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-svh w-full flex-col overflow-x-hidden bg-[#F2F2ED]">
      <form
        onSubmit={handleCreateTrip}
        className="mx-auto flex w-full max-w-[430px] flex-1 flex-col"
      >
        <div className="box-border flex w-full flex-1 flex-col items-center justify-between gap-[22px] p-[16px_20px_24px_20px]">
          <header className="box-border flex w-full flex-row items-center gap-3">
            <Link
              href="/"
              aria-label="Go back"
              className={cn(
                "flex size-[38px] shrink-0 items-center justify-center rounded-lg bg-[#F2F2ED]",
                "transition-transform duration-[160ms] [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212]",
                "active:scale-[0.97]",
                "motion-reduce:transition-none motion-reduce:active:scale-100",
              )}
            >
              <ArrowLeft aria-hidden="true" className="size-4 text-[#4A3B2E]" />
            </Link>
            <h1 className="font-sans text-[19px] font-semibold whitespace-nowrap text-[#4A3B2E]">
              Create a new trip
            </h1>
          </header>

          <TripTicket
            location={location}
            onLocationChange={setLocation}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            questType={questType}
            onQuestTypeChange={setQuestType}
          />

          <div className="flex w-full flex-col items-center gap-3">
            {error && (
              <p className="font-sans text-[13px] font-medium text-[#D0392F]">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={cn(
                actionClassName,
                "bg-[#121212] disabled:opacity-60",
                "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_4px_12px_rgba(18,18,18,0.18)]",
              )}
            >
              {submitting ? "Creating…" : "Create trip"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
};
