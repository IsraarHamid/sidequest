"use client";

import { useState, type ChangeEvent, type KeyboardEvent } from "react";
import { cn } from "cn";
import { TravelJournal } from "@/components/journal/travel-journal";
import {
  DEFAULT_JOURNAL_COLOR,
  JOURNAL_COLOR_PRESETS,
} from "@/lib/journal-cover";
import { CREW } from "@/lib/trip-quest-data";

const ownerName = CREW[0]?.name ?? "Traveller";

export default function JournalPage() {
  const [coverColor, setCoverColor] = useState(DEFAULT_JOURNAL_COLOR);

  const handleColorInput = (event: ChangeEvent<HTMLInputElement>) => {
    setCoverColor(event.target.value);
  };

  const handleSelectPreset = (hex: string) => {
    setCoverColor(hex);
  };

  const handlePresetKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    hex: string,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelectPreset(hex);
    }
  };

  return (
    <main className="relative min-h-svh w-full overflow-hidden bg-[#F2F2ED]">
      <div className="absolute inset-x-0 top-0 bottom-[188px]">
        <TravelJournal ownerName={ownerName} coverColor={coverColor} />
      </div>

      <section
        className="absolute inset-x-0 bottom-0 z-10 px-5 pb-8 pt-3"
        aria-label="Journal cover colour"
      >
        <div className="rounded-3xl border border-[#DDD2C0] bg-[#FBF7F0] p-4 shadow-[0_8px_24px_rgba(74,59,46,0.08)]">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[11px] tracking-[0.14em] text-[#8A7A69] uppercase">
                Cover colour
              </p>
              <p className="truncate font-hand text-[28px] leading-none text-[#4A3B2E]">
                {ownerName}
              </p>
            </div>
            <label className="relative size-10 shrink-0 overflow-hidden rounded-full outline-none focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#121212]">
              <span className="sr-only">Pick a custom cover colour</span>
              <span
                aria-hidden="true"
                className="block size-10 rounded-full border border-[#4A3B2E]/20"
                style={{ backgroundColor: coverColor }}
              />
              <input
                type="color"
                value={coverColor}
                onChange={handleColorInput}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {JOURNAL_COLOR_PRESETS.map((preset) => {
              const isActive = coverColor.toLowerCase() === preset.hex.toLowerCase();
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-label={`Set cover colour to ${preset.label}`}
                  aria-pressed={isActive}
                  tabIndex={0}
                  onClick={() => handleSelectPreset(preset.hex)}
                  onKeyDown={(event) => handlePresetKeyDown(event, preset.hex)}
                  className={cn(
                    "size-8 rounded-full outline-none",
                    "transition-transform duration-[160ms] [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)]",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212]",
                    "active:scale-[0.97] motion-reduce:transform-none",
                    isActive &&
                      "ring-2 ring-[#121212] ring-offset-2 ring-offset-[#FBF7F0]",
                    "[@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.06]",
                  )}
                  style={{ backgroundColor: preset.hex }}
                />
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
