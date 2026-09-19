"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { type DateRange } from "react-day-picker";
import { cn } from "cn";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { CITY_COUNTRY_OPTIONS } from "@/lib/cities";

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

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const fuzzyScore = (value: string, query: string) => {
  const normalizedValue = normalize(value);
  const normalizedQuery = normalize(query).trim();
  if (!normalizedQuery) return 0;
  if (normalizedValue.startsWith(normalizedQuery)) return 0;
  if (normalizedValue.includes(normalizedQuery)) return 1;

  let valueIndex = -1;
  let gaps = 0;
  for (const character of normalizedQuery) {
    const nextIndex = normalizedValue.indexOf(character, valueIndex + 1);
    if (nextIndex === -1) return null;
    gaps += nextIndex - valueIndex - 1;
    valueIndex = nextIndex;
  }
  return 2 + gaps;
};

const LocationField = ({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const suggestions = useMemo(() => {
    const matches: Array<{ option: string; index: number; score: number }> = [];
    CITY_COUNTRY_OPTIONS.forEach((option, index) => {
      const score = fuzzyScore(option, value);
      if (score !== null) matches.push({ option, index, score });
    });
    return matches.sort((a, b) => a.score - b.score || a.index - b.index).slice(0, 6);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!fieldRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      if (suggestions.length === 0) return;
      event.preventDefault();
      setOpen(true);
      setHighlightedIndex((index) => Math.min(index + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && open && suggestions[highlightedIndex]) {
      event.preventDefault();
      onChange(suggestions[highlightedIndex].option);
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={fieldRef} className="relative">
      <label htmlFor={id} className="flex flex-col">
        <span className="font-mono text-[11px] tracking-[1px] text-[#4A3B2E]">{label}</span>
        <input
          id={id}
          type="text"
          required
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-suggestions`}
          aria-activedescendant={open && suggestions.length > 0 ? `${id}-option-${highlightedIndex}` : undefined}
          value={value}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
            setHighlightedIndex(0);
          }}
          className="w-full border-0 bg-transparent p-0 font-mono text-[15px] font-medium text-[#4A3B2E] caret-[#4A3B2E] outline-none placeholder:text-[#4A3B2E]/20 selection:bg-[#DDD2C0] selection:text-[#4A3B2E] focus-visible:outline-none"
        />
      </label>

      {open && suggestions.length > 0 && (
        <div
          id={`${id}-suggestions`}
          role="listbox"
          aria-label={`${label.toLowerCase()} suggestions`}
          className="absolute top-full left-0 z-30 mt-2 w-[calc(100%+24px)] overflow-hidden rounded-xl border border-[#DDD2C0] bg-[#F2F2ED] p-1 shadow-[0_4px_16px_0_#4A3B2E24]"
        >
          {suggestions.map(({ option }, index) => (
            <button
              key={option}
              id={`${id}-option-${index}`}
              type="button"
              role="option"
              aria-selected={index === highlightedIndex}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(option);
                setOpen(false);
                setHighlightedIndex(0);
              }}
              className={cn(
                "flex w-full items-center rounded-lg px-3 py-2 text-left font-mono text-[12px] text-[#4A3B2E]",
                "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#4A3B2E]",
                index === highlightedIndex && "bg-[#DDD2C0]",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const TripTicket = ({
  startLocation,
  onStartLocationChange,
  endLocation,
  onEndLocationChange,
  dateRange,
  onDateRangeChange,
  questType,
  onQuestTypeChange,
}: {
  startLocation: string;
  onStartLocationChange: (value: string) => void;
  endLocation: string;
  onEndLocationChange: (value: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  questType: QuestType | null;
  onQuestTypeChange: (value: QuestType) => void;
}) => {
  return (
    <div className="login-rise relative flex w-[254px] max-w-full shrink-0 flex-col" aria-label="Trip ticket">
      <div className="box-border flex h-[314px] w-full flex-col items-center justify-end gap-6 overflow-visible rounded-[25px] bg-white pt-[45px] pr-[35px] pb-[19px] pl-5">
        <div className="flex w-full flex-col gap-4">
          <LocationField
            id="trip-start-location"
            label="START LOCATION"
            placeholder="ENTER START LOCATION"
            value={startLocation}
            onChange={onStartLocationChange}
          />
          <LocationField
            id="trip-end-location"
            label="END LOCATION"
            placeholder="ENTER END LOCATION"
            value={endLocation}
            onChange={onEndLocationChange}
          />
        </div>

        <TicketDateRange range={dateRange} onRangeChange={onDateRangeChange} />
      </div>

      <div className="box-border flex h-[120px] w-full flex-col items-center justify-center overflow-hidden rounded-[25px] bg-white px-5">
        <QuestTypeToggle value={questType} onChange={onQuestTypeChange} />
      </div>
    </div>
  );
};
