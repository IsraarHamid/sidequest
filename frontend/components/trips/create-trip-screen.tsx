"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type DateRange } from "react-day-picker";
import { ArrowLeft } from "lucide-react";
import { cn } from "cn";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { DEFAULT_TRIP_ID, getTrip } from "@/lib/trip-quest-data";

const GRID_COLUMNS = 35;
const GRID_ROWS = 3;
const DEFAULT_SOLO_COLUMNS = 15;
const GRID_CELLS = Array.from({ length: GRID_COLUMNS * GRID_ROWS }, (_, index) => {
  const column = index % GRID_COLUMNS;
  const row = Math.floor(index / GRID_COLUMNS);
  return {
    index,
    isBlack: (column + row) % 2 === 0,
  };
});

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

const snapColumnFromClientX = (clientX: number, rect: DOMRect) => {
  if (rect.width <= 0) return 0;
  const ratio = (clientX - rect.left) / rect.width;
  return Math.min(GRID_COLUMNS, Math.max(0, Math.round(ratio * GRID_COLUMNS)));
};

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

const MixSlider = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (columns: number) => void;
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleValueFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    onChange(snapColumnFromClientX(clientX, track.getBoundingClientRect()));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    handleValueFromClientX(event.clientX);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    handleValueFromClientX(event.clientX);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDragging(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      onChange(Math.max(0, value - 1));
      return;
    }
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      onChange(Math.min(GRID_COLUMNS, value + 1));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      onChange(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      onChange(GRID_COLUMNS);
    }
  };

  const soloPercent = Math.round((value / GRID_COLUMNS) * 100);

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label="Solo to together mix"
      aria-valuemin={0}
      aria-valuemax={GRID_COLUMNS}
      aria-valuenow={value}
      aria-valuetext={`${soloPercent}% solo`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative h-[17px] w-full cursor-pointer touch-none select-none overflow-hidden outline-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212]",
      )}
    >
      <div
        aria-hidden="true"
        className="grid h-full w-full grid-cols-[repeat(35,minmax(0,1fr))] grid-rows-3"
      >
        {GRID_CELLS.map((cell) => (
          <div
            key={cell.index}
            className={cell.isBlack ? "bg-black" : "bg-transparent"}
          />
        ))}
      </div>
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-full origin-left bg-black will-change-transform",
          !isDragging &&
            "transition-transform duration-[160ms] [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)]",
          "motion-reduce:transition-none",
        )}
        style={{ transform: `scaleX(${value / GRID_COLUMNS})` }}
      />
    </div>
  );
};

export const CreateTripScreen = () => {
  const router = useRouter();
  const trip = getTrip(DEFAULT_TRIP_ID);
  const [location, setLocation] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ from: getToday(), to: undefined });
  const [soloColumns, setSoloColumns] = useState(DEFAULT_SOLO_COLUMNS);

  const handleLocationChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLocation(event.target.value);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  const handleSoloColumnsChange = (columns: number) => {
    setSoloColumns(columns);
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
                    placeholder="ENTER LOCATION"
                    spellCheck={false}
                    autoComplete="off"
                    onChange={handleLocationChange}
                    className="w-full border-0 bg-transparent p-0 font-mono text-[15px] font-medium text-[#4A3B2E] caret-[#4A3B2E] outline-none placeholder:text-[#4A3B2E]/20 selection:bg-[#DDD2C0] selection:text-[#4A3B2E] focus-visible:outline-none"
                  />
                </label>
              </div>

              <TicketDateRange range={dateRange} onRangeChange={handleDateRangeChange} />

              <div className="flex w-full flex-col gap-2">
                <div className="flex w-full flex-row justify-between gap-2">
                  <span className="font-mono text-[11px] tracking-[1px] text-[#8A7A69]">
                    SOLO
                  </span>
                  <span className="font-mono text-[11px] tracking-[1px] text-[#8A7A69]">
                    TOGETHER
                  </span>
                </div>
                <MixSlider value={soloColumns} onChange={handleSoloColumnsChange} />
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
