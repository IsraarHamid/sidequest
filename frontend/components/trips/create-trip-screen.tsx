"use client";

import { useState, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "cn";
import { DEFAULT_TRIP_ID, getTrip } from "@/lib/trip-quest-data";

const DEFAULT_START_DATE = "2026-10-12";
const DEFAULT_END_DATE = "2026-10-18";
const actionClassName = cn(
  "box-border flex h-12 w-full shrink-0 flex-row items-center justify-center rounded-full px-8",
  "font-sans text-[15px] font-semibold text-[#FBF7F0]",
  "transition-transform duration-[160ms] [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212]",
  "active:scale-[0.97]",
  "motion-reduce:transition-none motion-reduce:active:scale-100",
);

const formatTicketDate = (isoDate: string) => {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);
};

const TicketDateField = ({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  onChange: (value: string) => void;
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <label className="relative flex h-full cursor-pointer flex-col gap-2">
      <span className="font-mono text-[11px] tracking-[1px] text-[#4A3B2E]">{label}</span>
      <span className="font-mono text-[14px] font-medium whitespace-nowrap text-[#4A3B2E]">
        {formatTicketDate(value)}
      </span>
      <input
        type="date"
        value={value}
        min={min}
        required
        aria-label={label}
        onChange={handleChange}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </label>
  );
};

export const CreateTripScreen = () => {
  const router = useRouter();
  const trip = getTrip(DEFAULT_TRIP_ID);
  const [location, setLocation] = useState(trip.destination);
  const [startDate, setStartDate] = useState(DEFAULT_START_DATE);
  const [endDate, setEndDate] = useState(DEFAULT_END_DATE);

  const handleLocationChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLocation(event.target.value);
  };

  const handleLocationFocus = (event: FocusEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const caret = input.value.length;
    requestAnimationFrame(() => {
      input.setSelectionRange(caret, caret);
    });
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    if (endDate < value) {
      setEndDate(value);
    }
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
  };

  const handleCreateTrip = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!location.trim()) return;
    router.push(`/trips/${trip.id}/preferences`);
  };

  return (
    <main className="flex min-h-svh w-full flex-col overflow-x-hidden bg-[#F2F2ED]">
      <form
        onSubmit={handleCreateTrip}
        className="mx-auto flex w-full max-w-[430px] flex-1 flex-col"
      >
        <div className="box-border flex w-full flex-1 flex-col items-center gap-[22px] p-[16px_20px_24px_20px]">
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

          <div
            className="login-rise relative flex w-[254px] max-w-full shrink-0 flex-col"
            aria-label="Trip ticket"
          >
            <div className="box-border flex h-[262px] w-full flex-col items-center gap-6 overflow-hidden rounded-[25px] bg-white pt-[61px] pr-[35px] pl-5">
              <div className="flex w-full flex-col">
                <label htmlFor="trip-location" className="flex flex-col">
                  <span className="font-mono text-[11px] tracking-[1px] text-[#4A3B2E]">
                    LOCATION
                  </span>
                  <input
                    id="trip-location"
                    type="text"
                    required
                    value={location}
                    spellCheck={false}
                    autoComplete="off"
                    onChange={handleLocationChange}
                    onFocus={handleLocationFocus}
                    className="w-full border-0 bg-transparent p-0 font-mono text-[15px] font-medium text-[#4A3B2E] caret-[#4A3B2E] outline-none selection:bg-[#DDD2C0] selection:text-[#4A3B2E] focus-visible:outline-none"
                  />
                </label>
              </div>

              <div className="flex h-10 w-full flex-row justify-between">
                <TicketDateField
                  label="START"
                  value={startDate}
                  onChange={handleStartDateChange}
                />
                <TicketDateField
                  label="END"
                  value={endDate}
                  min={startDate}
                  onChange={handleEndDateChange}
                />
              </div>

              <div className="flex w-full flex-col gap-2">
                <div className="flex w-full flex-row justify-between gap-2">
                  <span className="font-mono text-[11px] tracking-[1px] text-[#8A7A69]">
                    SOLO
                  </span>
                  <span className="font-mono text-[11px] tracking-[1px] text-[#8A7A69]">
                    TOGETHER
                  </span>
                </div>
                <div aria-hidden="true" className="relative h-[17px] w-full">
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="absolute inset-y-0 left-0 w-[85px] bg-black/50" />
                </div>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-[262px] right-6 left-6 z-10 -translate-y-1/2 border-t border-dashed border-[#F2F2ED]"
            />

            <div
              aria-hidden="true"
              className="h-[195px] w-full overflow-hidden rounded-[25px] bg-white"
            />
          </div>

          <button
            type="submit"
            className={cn(
              actionClassName,
              "bg-[#121212]",
              "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_4px_12px_rgba(18,18,18,0.18)]",
            )}
          >
            Create trip
          </button>
        </div>
      </form>
    </main>
  );
};
