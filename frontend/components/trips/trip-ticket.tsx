"use client";

import { useState } from "react";
import { type DateRange } from "react-day-picker";
import { cn } from "cn";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";

export type QuestType = "solo" | "together";

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

const questTypeLabelClassName = cn(
  "font-mono leading-none tracking-[1px] transition-[color,font-size] duration-200 ease",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212]",
  "motion-reduce:transition-none",
);

const getQuestTypeLabelClassName = (isSelected: boolean) =>
  cn(
    questTypeLabelClassName,
    isSelected ? "text-[19px] text-black" : "text-[11px] text-[#8A7A69]",
  );

const QuestTypeToggle = ({
  value,
  onChange,
}: {
  value: QuestType | null;
  onChange: (value: QuestType) => void;
}) => {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <span className="font-mono text-[11px] leading-none tracking-[1px] text-[#8A7A69]">
        QUEST TYPES
      </span>
      <div
        role="radiogroup"
        aria-label="Quest type"
        className="flex w-full flex-row items-center justify-between gap-2"
      >
        <button
          type="button"
          role="radio"
          aria-checked={value === "solo"}
          onClick={() => onChange("solo")}
          className={getQuestTypeLabelClassName(value === "solo")}
        >
          SOLO
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={value === "together"}
          onClick={() => onChange("together")}
          className={getQuestTypeLabelClassName(value === "together")}
        >
          TOGETHER
        </button>
      </div>
    </div>
  );
};

const placeInputClassName =
  "w-full border-0 bg-transparent p-0 font-mono text-[15px] font-medium text-[#4A3B2E] caret-[#4A3B2E] outline-none placeholder:text-[#4A3B2E]/20 selection:bg-[#DDD2C0] selection:text-[#4A3B2E] focus-visible:outline-none";

export const TripTicket = ({
  origin,
  onOriginChange,
  destination,
  onDestinationChange,
  dateRange,
  onDateRangeChange,
  questType,
  onQuestTypeChange,
}: {
  origin: string;
  onOriginChange: (value: string) => void;
  destination: string;
  onDestinationChange: (value: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  questType: QuestType | null;
  onQuestTypeChange: (value: QuestType) => void;
}) => {
  return (
    <div className="login-rise relative flex w-[254px] max-w-full shrink-0 flex-col" aria-label="Trip ticket">
      <div className="box-border flex h-[262px] w-full flex-col items-center justify-end gap-4 overflow-hidden rounded-[25px] bg-white pt-[40px] pr-[35px] pb-[19px] pl-5">
        <div className="flex w-full flex-col">
          <label htmlFor="trip-origin" className="flex flex-col">
            <span className="font-mono text-[11px] tracking-[1px] text-[#4A3B2E]">FROM</span>
            <input
              id="trip-origin"
              type="text"
              required
              value={origin}
              placeholder="START LOCATION"
              spellCheck={false}
              autoComplete="off"
              onChange={(event) => onOriginChange(event.target.value)}
              className={placeInputClassName}
            />
          </label>
        </div>

        <div className="flex w-full flex-col">
          <label htmlFor="trip-destination" className="flex flex-col">
            <span className="font-mono text-[11px] tracking-[1px] text-[#4A3B2E]">TO</span>
            <input
              id="trip-destination"
              type="text"
              required
              value={destination}
              placeholder="END LOCATION"
              spellCheck={false}
              autoComplete="off"
              onChange={(event) => onDestinationChange(event.target.value)}
              className={placeInputClassName}
            />
          </label>
        </div>

        <TicketDateRange range={dateRange} onRangeChange={onDateRangeChange} />
      </div>

      <div className="box-border flex h-[120px] w-full flex-col items-center justify-center overflow-hidden rounded-[25px] bg-white px-5">
        <QuestTypeToggle value={questType} onChange={onQuestTypeChange} />
      </div>
    </div>
  );
};
