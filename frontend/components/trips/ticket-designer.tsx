"use client";

import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "cn";
import { Wordmark } from "@/components/ui/wordmark";
import { STICKERS, shuffleStickers } from "@/lib/stickers";

export type PlacedSticker = { id: string; src: string; xPct: number; yPct: number };

// bg -> fg pairs: fg is a tint/shade of the same hue as bg, not a flat
// black/white, per the design comment ("foreground colours similar to each
// colour but high accessibility").
export const COLOR_SWATCHES: { bg: string; fg: string }[] = [
  { bg: "#DC2525", fg: "#FDE7E3" },
  { bg: "#F9CC15", fg: "#4A3300" },
  { bg: "#2C803D", fg: "#E3F5E7" },
  { bg: "#2563EB", fg: "#E6EEFF" },
  { bg: "#7C3AED", fg: "#F1E9FF" },
  { bg: "#DB2777", fg: "#FDE3F0" },
  { bg: "#FFFFFF", fg: "#171717" },
  { bg: "#000000", fg: "#FBF7F0" },
];

export const getTicketFgColor = (bgColor: string) =>
  COLOR_SWATCHES.find((c) => c.bg === bgColor)?.fg ?? "#171717";

const STICKER_SIZE = 56; // px, placed-on-ticket size

const clampPct = (value: number) => Math.min(92, Math.max(8, value));

const rectToPct = (rect: DOMRect, clientX: number, clientY: number) => ({
  xPct: clampPct(((clientX - rect.left) / rect.width) * 100),
  yPct: clampPct(((clientY - rect.top) / rect.height) * 100),
});

const CODE_LENGTH = 5;

export const TicketDesigner = ({
  stickers,
  onStickersChange,
  bgColor,
  onBgColorChange,
  inviteCode,
}: {
  stickers: PlacedSticker[];
  onStickersChange: (stickers: PlacedSticker[]) => void;
  bgColor: string;
  onBgColorChange: (color: string) => void;
  inviteCode?: string | null;
}) => {
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ src: string; x: number; y: number; movingId: string | null } | null>(
    null,
  );
  const idPrefix = useId();
  const nextIndex = useRef(0);

  // ponytail: shuffled client-side only (not at module scope) so SSR/hydration
  // markup matches; the marquee re-orders itself right after mount instead.
  const [pickerStickers, setPickerStickers] = useState(STICKERS);
  useEffect(() => {
    setPickerStickers(shuffleStickers(STICKERS));
  }, []);
  const pickerTrack = [...pickerStickers, ...pickerStickers];

  const fgColor = getTicketFgColor(bgColor);

  const beginDrag = (
    event: ReactPointerEvent<HTMLElement>,
    src: string,
    movingId: string | null,
  ) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ src, x: event.clientX, y: event.clientY, movingId });
  };

  const handleMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!drag) return;
    setDrag({ ...drag, x: event.clientX, y: event.clientY });
  };

  const handleEnd = (event: ReactPointerEvent<HTMLElement>) => {
    if (!drag) return;
    const rect = dropZoneRef.current?.getBoundingClientRect();
    const overTicket =
      rect &&
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (overTicket && rect) {
      const { xPct, yPct } = rectToPct(rect, event.clientX, event.clientY);
      if (drag.movingId) {
        onStickersChange(
          stickers.map((s) => (s.id === drag.movingId ? { ...s, xPct, yPct } : s)),
        );
      } else {
        onStickersChange([
          ...stickers,
          { id: `${idPrefix}-${nextIndex.current++}`, src: drag.src, xPct, yPct },
        ]);
      }
    } else if (drag.movingId) {
      // dropped outside the ticket: remove it
      onStickersChange(stickers.filter((s) => s.id !== drag.movingId));
    }
    setDrag(null);
  };

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div
        className="no-scrollbar w-full overflow-hidden px-8 py-2"
        aria-label="Sticker picker — drag a sticker onto the ticket"
      >
        <div className="sticker-marquee flex w-max gap-6">
          {pickerTrack.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              draggable={false}
              onPointerDown={(event) => beginDrag(event, src, null)}
              onPointerMove={handleMove}
              onPointerUp={handleEnd}
              className="h-18 w-18 shrink-0 cursor-grab touch-none object-contain select-none active:cursor-grabbing"
            />
          ))}
        </div>
      </div>

      <div className="flex w-[254px] max-w-full shrink-0 flex-col">
        <div
          ref={dropZoneRef}
          className="@container relative flex h-[262px] w-full items-center justify-center overflow-hidden rounded-t-[25px] transition-colors duration-200"
          style={{ backgroundColor: bgColor }}
        >
          <Wordmark className="px-5 text-center" style={{ color: fgColor }} />
          {stickers.map((sticker) => (
            <img
              key={sticker.id}
              src={sticker.src}
              alt=""
              draggable={false}
              onPointerDown={(event) => beginDrag(event, sticker.src, sticker.id)}
              onPointerMove={handleMove}
              onPointerUp={handleEnd}
              className="sticker-drop absolute cursor-grab touch-none object-contain select-none active:cursor-grabbing"
              style={{
                left: `${sticker.xPct}%`,
                top: `${sticker.yPct}%`,
                width: STICKER_SIZE,
                height: STICKER_SIZE,
              }}
            />
          ))}
        </div>

        <div className="box-border flex h-[120px] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-b-[25px] bg-white px-5">
          <span className="font-mono text-[11px] tracking-[1px] text-[#4A3B2E]">INVITE CODE</span>
          <div className="flex items-end gap-1.5">
            {Array.from({ length: CODE_LENGTH }).map((_, i) => {
              const digit = inviteCode ? inviteCode[i] : undefined;
              return (
                <span
                  key={i}
                  className={cn(
                    "font-mono text-4xl leading-none font-medium",
                    digit ? "text-[#4A3B2E]" : "text-[#4A3B2E]/20",
                  )}
                >
                  {digit ?? "0"}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid w-48 grid-cols-4 gap-2.25">
        {COLOR_SWATCHES.map((swatch) => (
          <button
            key={swatch.bg}
            type="button"
            aria-label={`Ticket colour ${swatch.bg}`}
            aria-pressed={bgColor === swatch.bg}
            onClick={() => onBgColorChange(swatch.bg)}
            style={{ backgroundColor: swatch.bg }}
            className={cn(
              "h-10.75 w-10 shrink-0 rounded-xs transition-transform duration-150",
              swatch.bg === "#FFFFFF" && "outline outline-1 outline-black",
              bgColor === swatch.bg && "outline outline-2 outline-offset-2 outline-[#121212]",
            )}
          />
        ))}
      </div>

      {drag && (
        <img
          src={drag.src}
          alt=""
          className="pointer-events-none fixed z-50 object-contain opacity-90"
          style={{
            left: drag.x,
            top: drag.y,
            width: STICKER_SIZE,
            height: STICKER_SIZE,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
    </div>
  );
};
