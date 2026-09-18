"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type DateRange } from "react-day-picker";
import { ArrowLeft } from "lucide-react";
import { cn } from "cn";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
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

const formatTicketDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);
};

const dateFieldClassName = cn(
  "flex h-full cursor-pointer flex-col gap-2 bg-transparent p-0 outline-none",
  "transition-transform duration-[160ms] [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212]",
  "active:scale-[0.97]",
  "motion-reduce:transition-none motion-reduce:active:scale-100",
);

const pickerContentClassName = cn(
  "w-auto border-0 bg-[#F2F2ED] p-0 shadow-[0_4px_16px_0_#4A3B2E24] ring-[#DDD2C0]",
  "origin-(--transform-origin)",
);

type DateField = "start" | "end";

const TicketDateRange = ({
  range,
  onRangeChange,
}: {
  range: DateRange;
  onRangeChange: (range: DateRange) => void;
}) => {
  const [openField, setOpenField] = useState<DateField | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setOpenField(null);
    }
  };

  const handleOpenStart = () => {
    setOpenField("start");
  };

  const handleOpenEnd = () => {
    setOpenField("end");
  };

  const handleSelect = (next: DateRange | undefined) => {
    const nextRange = next ?? { from: undefined, to: undefined };
    onRangeChange(nextRange);
    if (nextRange.from && nextRange.to) {
      setOpenField(null);
    }
  };

  const renderCalendar = () => (
    <>
      <PopoverTitle className="sr-only">Select trip dates</PopoverTitle>
      <Calendar
        mode="range"
        selected={range}
        onSelect={handleSelect}
        defaultMonth={range.from ?? getToday()}
        autoFocus
        className="bg-[#F2F2ED] text-[#4A3B2E]"
      />
    </>
  );

  return (
    <div className="flex h-10 w-full flex-row justify-between">
      <Popover
        open={openField === "start"}
        onOpenChange={(open) => {
          if (open) {
            handleOpenStart();
            return;
          }
          handleOpenChange(false);
        }}
      >
        <PopoverTrigger
          type="button"
          aria-label="START"
          aria-haspopup="dialog"
          className={dateFieldClassName}
        >
          <span className="font-mono text-[11px] tracking-[1px] text-[#4A3B2E]">START</span>
          <span
            className={cn(
              "font-mono text-[14px] font-medium whitespace-nowrap text-[#4A3B2E]",
              !range.from && "opacity-20",
            )}
          >
            {range.from ? formatTicketDate(range.from) : "SELECT DATE"}
          </span>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={8}
          className={cn(pickerContentClassName, "origin-top-left")}
        >
          {renderCalendar()}
        </PopoverContent>
      </Popover>

      <Popover
        open={openField === "end"}
        onOpenChange={(open) => {
          if (open) {
            handleOpenEnd();
            return;
          }
          handleOpenChange(false);
        }}
      >
        <PopoverTrigger
          type="button"
          aria-label="END"
          aria-haspopup="dialog"
          className={cn(dateFieldClassName, "items-end text-right")}
        >
          <span className="font-mono text-[11px] tracking-[1px] text-[#4A3B2E]">END</span>
          <span
            className={cn(
              "font-mono text-[14px] font-medium whitespace-nowrap text-[#4A3B2E]",
              !range.to && "opacity-20",
            )}
          >
            {range.to ? formatTicketDate(range.to) : "SELECT DATE"}
          </span>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          side="bottom"
          sideOffset={8}
          className={cn(pickerContentClassName, "origin-top-right")}
        >
          {renderCalendar()}
        </PopoverContent>
      </Popover>
    </div>
  );
};

const soloTogetherLabelClassName = cn(
  "font-mono tracking-[1px] transition-[color,font-size] duration-200 ease",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212]",
  "motion-reduce:transition-none",
);

const getSoloTogetherLabelClassName = (isSelected: boolean) =>
  cn(
    soloTogetherLabelClassName,
    isSelected ? "text-[19px] font-medium text-black" : "text-[11px] text-[#8A7A69]",
  );

const SoloTogetherToggle = ({
  isTogether,
  onChange,
}: {
  isTogether: boolean;
  onChange: (isTogether: boolean) => void;
}) => {
  const handleSelectSolo = () => {
    onChange(false);
  };

  const handleSelectTogether = () => {
    onChange(true);
  };

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <span className="font-mono text-[11px] tracking-[1px] text-[#8A7A69]">QUEST TYPES</span>
      <div
        role="radiogroup"
        aria-label="Quest type"
        className="flex w-full flex-row items-center justify-between gap-2"
      >
        <button
          type="button"
          role="radio"
          aria-checked={!isTogether}
          onClick={handleSelectSolo}
          className={getSoloTogetherLabelClassName(!isTogether)}
        >
          SOLO
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={isTogether}
          onClick={handleSelectTogether}
          className={getSoloTogetherLabelClassName(isTogether)}
        >
          TOGETHER
        </button>
      </div>
    </div>
  );
};

export const CreateTripScreen = () => {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ from: getToday(), to: undefined });
  const [isTogether, setIsTogether] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLocation(event.target.value);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

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

          <div
            className="login-rise relative flex w-[254px] max-w-full shrink-0 flex-col"
            aria-label="Trip ticket"
          >
            <div className="box-border flex h-[262px] w-full flex-col items-center justify-end gap-6 overflow-hidden rounded-[25px] bg-white pt-[61px] pr-[35px] pb-[19px] pl-5">
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
                    placeholder="ENTER LOCATION"
                    spellCheck={false}
                    autoComplete="off"
                    onChange={handleLocationChange}
                    className="w-full border-0 bg-transparent p-0 font-mono text-[15px] font-medium text-[#4A3B2E] caret-[#4A3B2E] outline-none placeholder:text-[#4A3B2E]/20 selection:bg-[#DDD2C0] selection:text-[#4A3B2E] focus-visible:outline-none"
                  />
                </label>
              </div>

              <TicketDateRange range={dateRange} onRangeChange={handleDateRangeChange} />
            </div>

            <div className="box-border flex h-[120px] w-full flex-col items-center justify-center overflow-hidden rounded-[25px] bg-white px-5">
              <SoloTogetherToggle isTogether={isTogether} onChange={setIsTogether} />
            </div>
          </div>

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
