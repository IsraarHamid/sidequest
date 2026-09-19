"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { StampFrame } from "@/components/trips/stamp-avatar";
import { getTicketFgColor } from "@/components/trips/ticket-designer";
import type { PlacedSticker } from "@/components/trips/ticket-designer";
import { api, ensureUser, type Trip } from "@/lib/api";

// ponytail: the ticket design (stickers + colour) has no backend column yet
// — see the matching comment in create-trip-screen.tsx. Read it straight
// from localStorage, so this only renders the host's actual ticket when
// joiner and host share a browser (e.g. testing); otherwise it falls back
// to the default (white/black) ticket the Paper design itself shows.
const ticketDesignKey = (tripId: string) => `sidequest.ticketDesign.${tripId}`;

function readTicketDesign(tripId: string): { bgColor: string; stickers: PlacedSticker[] } | null {
  try {
    const raw = window.localStorage.getItem(ticketDesignKey(tripId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const CODE_LENGTH = 5;

export default function JoinTripPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [trip, setTrip] = useState<Trip | null>(null);
  const [design, setDesign] = useState<{ bgColor: string; stickers: PlacedSticker[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill the code from an invite link (?code=12345) without needing Suspense.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("code");
    if (c) setCode(c.replace(/\D/g, "").slice(0, CODE_LENGTH));
  }, []);

  async function handleJoin() {
    const clean = code.replace(/\D/g, "");
    if (clean.length !== CODE_LENGTH) {
      setError(`Enter the ${CODE_LENGTH}-digit trip code your crew shared.`);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await ensureUser();
      const joined = await api.joinTrip(clean);
      setTrip(joined);
      setDesign(readTicketDesign(joined.id));
    } catch {
      setError("No trip found for that code. Double-check it and try again.");
    } finally {
      setLoading(false);
    }
  }

  const host = trip?.members.find((m) => m.role === "host") ?? trip?.members[0];
  const codeDigits = Array.from({ length: CODE_LENGTH }, (_, i) => code[i]);

  return (
    <div className="min-h-svh w-full bg-[#F2F2ED]">
      <div className="mx-auto flex w-full max-w-[360px] flex-col items-center gap-[22px] px-5 pt-4 pb-6">
        <div className="flex w-full items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-[#F2F2ED]"
          >
            <ArrowLeft className="h-4 w-4" color="#4A3B2E" />
          </button>
          <div className="font-[Geist,system-ui,sans-serif] text-[19px] font-semibold text-[#4A3B2E]">
            Join a trip
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col items-center justify-center gap-[27px]">
          {!trip && (
            <>
              <div className="flex w-[254px] max-w-full flex-col items-center gap-[13px] rounded-[25px] bg-white px-5 py-[27px]">
                <label
                  htmlFor="trip-code"
                  className="text-center font-['Geist_Mono',system-ui,sans-serif] text-[11px] tracking-[1px] text-[#4A3B2E]"
                >
                  INVITE CODE
                </label>
                <div className="relative flex items-center justify-center gap-[6px]">
                  <input
                    id="trip-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleJoin();
                    }}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    maxLength={CODE_LENGTH}
                    aria-label="Invite code"
                    className="absolute inset-0 h-full w-full cursor-text opacity-0"
                  />
                  {codeDigits.map((d, i) => (
                    <span
                      key={i}
                      aria-hidden="true"
                      className="font-['Geist_Mono',system-ui,sans-serif] text-4xl/11 font-medium"
                      style={{ color: d ? "#4A3B2E" : "#4A3B2E33" }}
                    >
                      {d ?? "0"}
                    </span>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-center font-[Geist,system-ui,sans-serif] text-[13px] font-medium text-[#D0392F]">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handleJoin}
                disabled={loading}
                className="flex h-12 w-full max-w-[320px] shrink-0 items-center justify-center rounded-full bg-[#121212] px-8 disabled:opacity-60"
              >
                <span className="font-[Geist,system-ui,sans-serif] text-[15px] font-semibold text-[#FBF7F0]">
                  {loading ? "Finding…" : "Submit"}
                </span>
              </button>
            </>
          )}

          {trip && (
            <>
              {host && (
                <StampFrame>
                  <div
                    className="flex h-[63px] w-[57px] items-center justify-center rounded-xl outline-2 -outline-offset-1 outline-[#FBF7F0]"
                    style={{ backgroundColor: host.avatar_color ?? "#3E6B4A" }}
                  >
                    <span className="font-[Geist,system-ui,sans-serif] text-[15px] font-bold text-[#FBF7F0]">
                      {host.initials ?? host.display_name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                </StampFrame>
              )}

              <div className="flex w-[254px] max-w-full flex-col">
                <div
                  className="relative flex h-[262px] w-full flex-col items-center justify-end gap-6 overflow-hidden rounded-[25px] px-5 pb-10"
                  style={{ backgroundColor: design?.bgColor ?? "#FFFFFF" }}
                >
                  <div
                    className="text-center font-[Geist,system-ui,sans-serif] text-[54px]/[0.95] font-black tracking-[-0.03em] uppercase"
                    style={{ color: getTicketFgColor(design?.bgColor ?? "#FFFFFF") }}
                  >
                    Side
                    <br />
                    Quest
                  </div>
                  {design?.stickers.map((sticker) => (
                    <img
                      key={sticker.id}
                      src={sticker.src}
                      alt=""
                      className="absolute h-[56px] w-[56px] object-contain"
                      style={{
                        left: `${sticker.xPct}%`,
                        top: `${sticker.yPct}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  ))}
                  <div className="absolute bottom-0 left-6 h-px w-[206px] border-t border-dashed border-black" />
                </div>
                <div className="flex w-full flex-col items-center gap-[13px] rounded-[25px] bg-white px-5 py-[27px]">
                  <div className="text-center font-['Geist_Mono',system-ui,sans-serif] text-[11px] tracking-[1px] text-[#4A3B2E]">
                    INVITE CODE
                  </div>
                  <div className="flex items-center justify-center gap-[6px]">
                    {trip.join_code.split("").map((d, i) => (
                      <span
                        key={i}
                        className="font-['Geist_Mono',system-ui,sans-serif] text-4xl/11 font-medium text-[#4A3B2E]"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push(`/trips/${trip.id}/preferences`)}
                className="flex h-12 w-full max-w-[320px] shrink-0 items-center justify-center rounded-full bg-[#121212] px-8"
              >
                <span className="font-[Geist,system-ui,sans-serif] text-[15px] font-semibold text-[#FBF7F0]">
                  Join quest!
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
