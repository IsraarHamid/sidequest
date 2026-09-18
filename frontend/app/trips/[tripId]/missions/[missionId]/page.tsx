"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Camera, Check, ChevronDown, ChevronUp, Landmark, Lightbulb, Timer,
  User, Users, Utensils, type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/trip-quest/page-header";
import { api, isAuthError, type Mission } from "@/lib/api";

const ICON: Record<string, LucideIcon> = { Utensils, Camera, Users, Landmark };

export default function MissionDetailPage() {
  const router = useRouter();
  const { tripId, missionId } = useParams<{ tripId: string; missionId: string }>();
  const fileRef = useRef<HTMLInputElement>(null);

  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const all = await api.listMissions(tripId);
        setMission(all.find((m) => m.id === missionId) ?? null);
      } catch (e) {
        if (isAuthError(e)) router.replace("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [tripId, missionId, router]);

  async function onPickFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const { photo_url } = await api.uploadMissionPhoto(missionId, file);
      setPhotoUrl(photo_url);
    } catch {
      setError("Photo upload failed. Try a smaller image.");
    } finally {
      setUploading(false);
    }
  }

  async function markComplete() {
    setError(null);
    setCompleting(true);
    try {
      await api.completeMission(missionId, photoUrl ?? undefined);
      router.push(`/trips/${tripId}/missions`);
    } catch (e) {
      setError(
        e instanceof Error && /409/.test(e.message)
          ? "This mission has expired."
          : "Couldn't mark complete. Try again.",
      );
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-svh w-full bg-[#F4EFE4] flex items-center justify-center">
        <p className="font-sans text-[15px] text-[#8A7A69]">Loading…</p>
      </div>
    );
  }
  if (!mission) {
    return (
      <div className="min-h-svh w-full bg-[#F4EFE4] flex items-center justify-center">
        <p className="font-sans text-[15px] text-[#8A7A69]">Mission not found.</p>
      </div>
    );
  }

  const isGroup = mission.type === "group";
  const category = mission.is_secret ? "SECRET" : mission.type.toUpperCase();
  const CategoryIcon = ICON[isGroup ? "Users" : mission.is_secret ? "Camera" : "Utensils"];
  const accent = isGroup ? "#3E6B4A" : "#E8B62C";

  return (
    <div className="min-h-svh w-full bg-[#F4EFE4]">
      <div className="mx-auto w-full max-w-[430px]">
        <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[20px] p-[16px_20px_24px_20px] justify-start items-start">
          <PageHeader title="Mission" />

          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickFile} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="box-border w-full h-[220px] shrink-0 flex flex-col gap-[10px] justify-center items-center overflow-hidden bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-3xl relative z-10"
          >
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="Your proof" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <>
                <div className="box-border w-[52px] h-[52px] shrink-0 flex flex-row justify-center items-center bg-[#F4EFE4] rounded-full">
                  <Camera className="w-[24px] h-[24px] shrink-0" color="#8A7A69" />
                </div>
                <div className="text-[14px] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold">
                  {uploading ? "Uploading…" : "Take or upload a photo"}
                </div>
                <div className="text-[12px] box-border text-[#8A7A69] font-[Geist,system-ui,sans-serif]">
                  This is your proof for the group
                </div>
              </>
            )}
          </button>

          <div
            className="box-border w-fit h-fit [transform:rotate(7deg)] [transform-origin:top_left] [box-shadow:0px_4px_10px_0px_#4A3B2E24] absolute left-[36px] top-[116px] flex flex-row gap-[6px] p-[7px_13px] justify-start items-center z-20"
            style={{ backgroundColor: accent }}
          >
            <CategoryIcon className="w-[13px] h-[13px] shrink-0" color="#4A3B2E" />
            <div className="text-[12px] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-bold whitespace-nowrap">
              {category}
            </div>
          </div>

          <div className="box-border w-full h-fit shrink-0 flex flex-row gap-0 justify-between items-start relative z-10">
            <div className="text-[22px]/[26px] box-border w-[250px] shrink-0 text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-extrabold text-left">
              {mission.title}
            </div>
            <div className="box-border w-fit shrink-0 h-fit flex flex-row p-[8px_12px] bg-[#F4EFE4] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-lg">
              <div className="text-[13px] box-border text-[#C8901A] font-[Geist,system-ui,sans-serif] font-bold whitespace-nowrap">
                {mission.points} pts
              </div>
            </div>
          </div>

          <div className="box-border w-fit h-fit shrink-0 flex flex-row gap-[16px] justify-start items-start relative z-10">
            {mission.expires_at && (
              <div className="box-border w-fit shrink-0 h-fit flex flex-row gap-[6px] justify-start items-center">
                <Timer className="w-[13px] h-[13px] shrink-0" color="#8A7A69" />
                <div className="text-[12px] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif]">
                  {mission.is_expired ? "Expired" : "Timed"}
                </div>
              </div>
            )}
            <div className="box-border w-fit shrink-0 h-fit flex flex-row gap-[6px] justify-start items-center">
              {isGroup ? <Users className="w-[13px] h-[13px]" color="#8A7A69" /> : <User className="w-[13px] h-[13px]" color="#8A7A69" />}
              <div className="text-[12px] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif]">
                {isGroup ? "Group mission" : "Solo mission"}
              </div>
            </div>
          </div>

          {mission.description && (
            <div className="text-[14px]/[22px] box-border w-full text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-normal text-left relative z-10">
              {mission.description}
            </div>
          )}

          {mission.business_name && (
            <button
              type="button"
              onClick={() => setShowHint((v) => !v)}
              className="box-border w-full h-fit shrink-0 flex flex-row gap-[10px] p-[14px] justify-start items-center bg-[#FBF7F0] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-2xl relative z-10"
            >
              <Lightbulb className="w-[16px] h-[16px] shrink-0" color="#C8901A" />
              <div className="box-border flex-1 h-fit flex flex-col gap-[2px] justify-start items-start">
                <div className="text-[13px] box-border text-[#4A3B2E] font-[Geist,system-ui,sans-serif] font-semibold">
                  Checkpoint: {mission.business_name}
                </div>
                {showHint && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mission.business_name)}`}
                    target="_blank" rel="noreferrer"
                    className="text-[12px]/[17px] box-border w-full text-[#3E6B4A] underline font-[Geist,system-ui,sans-serif]"
                  >
                    Open in Google Maps
                  </a>
                )}
              </div>
              {showHint ? <ChevronUp className="w-[15px] h-[15px]" color="#8A7A69" /> : <ChevronDown className="w-[15px] h-[15px]" color="#8A7A69" />}
            </button>
          )}

          <div className="box-border w-full h-fit shrink-0 flex flex-col gap-[8px] justify-start items-start relative z-10">
            <div className="text-[11px] box-border text-[#8A7A69] font-['Geist_Mono',system-ui,sans-serif] tracking-[1px]">
              ADD A SHORT DESCRIPTION
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What happened at this stop?"
              className="text-[13px]/[20px] box-border w-full h-[80px] resize-none bg-[#FBF7F0] p-[14px] text-[#4A3B2E] font-[Geist,system-ui,sans-serif] [outline:1px_solid_#DDD2C0] [outline-offset:-0.5px] rounded-2xl placeholder:text-[#B7AA97]"
            />
          </div>

          {error && (
            <div className="text-[13px] box-border w-full text-[#D0392F] font-[Geist,system-ui,sans-serif] font-medium relative z-10">{error}</div>
          )}

          <button
            type="button"
            onClick={markComplete}
            disabled={completing || uploading}
            className="box-border w-full h-[48px] shrink-0 flex flex-row gap-[8px] p-[16px_32px] justify-center items-center bg-[#121212] rounded-full relative z-10 disabled:opacity-60"
          >
            <div className="text-[15px] box-border text-[#FBF7F0] font-[Geist,system-ui,sans-serif] font-semibold whitespace-nowrap">
              {completing ? "Completing…" : "Mark complete"}
            </div>
            <Check className="w-[17px] h-[17px] shrink-0" color="#FBF7F0" />
          </button>
        </div>
      </div>
    </div>
  );
}
