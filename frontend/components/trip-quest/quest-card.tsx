import { cn } from "@/lib/utils";

const STICKER_COUNT = 12;

/** Deterministic per-quest sticker so the same quest always shows the same one, but different quests vary. */
function stickerUrlForQuest(questId: string) {
  let hash = 0;
  for (let i = 0; i < questId.length; i++) hash = (hash * 31 + questId.charCodeAt(i)) | 0;
  const index = (Math.abs(hash) % STICKER_COUNT) + 1;
  return `/trip_quest-assets/stickers/Sticker_${index}.png`;
}

export type QuestCardData = {
  id: string;
  title: string;
  description: string;
  points: number;
};

export type QuestCardVariant =
  | "default" // no action yet, just the quest preview with its sticker
  | "mark-done" // expanded with a "Mark as done" action
  | "take-photo" // expanded with a "Take a photo" action
  | "done" // submitted, no photo attached
  | "done-photo"; // submitted with a photo

export function QuestCard({
  quest,
  variant,
  photoUrl,
  onAction,
  className,
}: {
  quest: QuestCardData;
  variant: QuestCardVariant;
  photoUrl?: string;
  onAction?: () => void;
  className?: string;
}) {
  const isSubmitted = variant === "done" || variant === "done-photo";
  const actionLabel = variant === "mark-done" ? "Mark as done" : variant === "take-photo" ? "Take a photo" : null;

  return (
    <div
      className={cn(
        "box-border w-[278px] shrink-0 overflow-clip rounded-[26px] flex flex-col items-center gap-[17px] p-5 relative",
        "[box-shadow:0px_2px_3px_#5694D033] bg-[#5694D0] border-t border-t-[#FFFFFF75]",
        !isSubmitted && "justify-between",
        className,
      )}
      style={!isSubmitted ? { height: actionLabel ? 274 : 161 } : undefined}
    >
      <div className="flex flex-col items-start self-stretch relative z-10">
        <div className="text-[19px]/[150%] self-stretch font-[Geist,system-ui,sans-serif] font-semibold text-[#F2F2ED]">
          {quest.title}
        </div>
        <div className="text-[14px]/[150%] self-stretch font-[Geist,system-ui,sans-serif] text-[#F2F2ED]">
          {quest.description}
        </div>
      </div>

      <div className="text-[13px]/[150%] self-stretch font-[Geist,system-ui,sans-serif] font-semibold text-[#F2F2ED] relative z-10">
        {quest.points}pts
      </div>

      {!isSubmitted && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={stickerUrlForQuest(quest.id)}
          alt=""
          className="w-[146px] h-[130px] absolute top-[65px] -right-[26px] object-contain object-center"
        />
      )}

      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="flex w-fit justify-center items-center py-1.5 px-4 rounded-full gap-2 relative z-10 bg-[#121212CC]"
        >
          <div className="text-[14px]/[150%] w-max font-[Geist,system-ui,sans-serif] font-semibold text-[#FBF7F0]">
            {actionLabel}
          </div>
        </button>
      )}

      {variant === "done" && (
        <div
          className="text-[30px]/[150%] w-fit text-[#FBF7F0] relative z-10"
          style={{ fontFamily: "var(--font-gochi-hand), cursive" }}
        >
          DONE!
        </div>
      )}

      {variant === "done-photo" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt="Quest proof"
          className="overflow-clip w-[246px] h-[186px] shrink-0 bg-white object-cover relative z-10"
        />
      )}
    </div>
  );
}
