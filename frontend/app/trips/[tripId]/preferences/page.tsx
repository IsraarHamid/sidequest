"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Camera,
  Check,
  Circle,
  CircleCheck,
  Compass,
  Drama,
  Feather,
  Flame,
  Landmark,
  MoonStar,
  Mountain,
  Palette,
  ShoppingBag,
  Trees,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/trip-quest/page-header";
import { api } from "@/lib/api";
import {
  DEFAULT_SELECTED_INTERESTS,
  DEFAULT_SELECTED_VIBE,
  INTEREST_OPTIONS,
  VIBES,
} from "@/lib/trip-quest-data";

const INTEREST_ICONS: Record<string, LucideIcon> = {
  Utensils,
  Trees,
  ShoppingBag,
  Landmark,
  MoonStar,
  Mountain,
  Camera,
  Drama,
};

const VIBE_ICONS: Record<string, LucideIcon> = {
  Feather,
  Compass,
  Flame,
  Palette,
};

export default function PreferencesPage() {
  const router = useRouter();
  const { tripId } = useParams<{ tripId: string }>();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(DEFAULT_SELECTED_INTERESTS);
  const [selectedVibe, setSelectedVibe] = useState<string>(DEFAULT_SELECTED_VIBE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleInterest(id: string) {
    setSelectedInterests((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function savePreferences() {
    setError(null);
    setSaving(true);
    try {
      await api.setPreferences({
        interests: selectedInterests,
        adventure_level: selectedVibe,
      });
      router.push(`/trips/${tripId}/missions`);
    } catch {
      setError("Couldn't save preferences. Are you signed in?");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-svh w-full bg-[#F2F2ED]">
      <div className="mx-auto w-full max-w-[430px]">
        <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[24px] p-[16px_20px_24px_20px] justify-start items-start">
          <PageHeader title="Your preferences" />

          <div className="text-[14px]/[21px] box-border w-full text-[#8A7A69] font-[Geist,system-ui,sans-serif] font-normal text-left">
            Help the AI build missions you&apos;ll actually enjoy.
          </div>

          <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal tracking-[1px] text-left whitespace-nowrap">
            WHAT ARE YOU INTO?
          </div>
          <div className="box-border w-full h-fit shrink-0 flex flex-row flex-wrap gap-[10px] justify-start items-start">
            {INTEREST_OPTIONS.map((interest) => {
              const Icon = INTEREST_ICONS[interest.icon];
              const active = selectedInterests.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  className={`box-border w-fit shrink-0 h-fit flex flex-row gap-[7px] p-[10px_15px] justify-start items-center rounded-full ${
                    active
                      ? "bg-[#C8901A1F] [outline:1px_solid_#C8901A] [outline-offset:-0.5px]"
                      : "bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px]"
                  }`}
                >
                  <Icon className="w-[15px] h-[15px] shrink-0" color={active ? "#C8901A" : "#8A7A69"} />
                  <div
                    className={`text-[13px]/[normal] box-border font-[Geist,system-ui,sans-serif] font-medium text-left whitespace-nowrap ${
                      active ? "text-[#C8901A]" : "text-[#4A3B2E]"
                    }`}
                  >
                    {interest.label}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-[11px]/[normal] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] font-normal tracking-[1px] text-left whitespace-nowrap">
            PICK YOUR VIBE
          </div>
          <div className="box-border w-full h-fit shrink-0 flex flex-row flex-wrap gap-[10px] justify-start items-start">
            {VIBES.map((vibe) => {
              const Icon = VIBE_ICONS[vibe.icon];
              const active = selectedVibe === vibe.id;
              return (
                <button
                  key={vibe.id}
                  type="button"
                  onClick={() => setSelectedVibe(vibe.id)}
                  className={`box-border grow basis-[45%] h-fit flex flex-col gap-[8px] p-[14px] justify-start items-start rounded-3xl ${
                    active
                      ? "bg-[#C8901A1F] [outline:2px_solid_#C8901A] [outline-offset:-1px]"
                      : "bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px]"
                  }`}
                >
                  <div className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-center">
                    <Icon className="w-[19px] h-[19px] shrink-0" color={active ? "#C8901A" : "#4A3B2E"} />
                    {active ? (
                      <CircleCheck className="w-[16px] h-[16px] shrink-0" color="#C8901A" />
                    ) : (
                      <Circle className="w-[16px] h-[16px] shrink-0 opacity-0" />
                    )}
                  </div>
                  <div className="text-[14px]/[normal] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
                    {vibe.label}
                  </div>
                  <div className="text-[11px]/[15px] box-border w-full text-[#8A7A69] font-[Geist,system-ui,sans-serif] font-normal text-left">
                    {vibe.description}
                  </div>
                </button>
              );
            })}
          </div>

          {error && (
            <div className="text-[13px]/[18px] box-border w-full text-[#D0392F] font-[Geist,system-ui,sans-serif] font-medium text-left">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={savePreferences}
            disabled={saving}
            className="box-border w-full h-[48px] shrink-0 flex flex-row gap-[8px] p-[16px_32px] justify-center items-center bg-[#121212] rounded-full disabled:opacity-60"
          >
            <div className="text-[15px]/[normal] box-border text-[#FBF7F0] font-[Geist,system-ui,sans-serif] font-semibold text-left whitespace-nowrap">
              {saving ? "Saving…" : "Save preferences"}
            </div>
            <Check className="w-[17px] h-[17px] shrink-0" color="#FBF7F0" />
          </button>
        </div>
      </div>
    </div>
  );
}
