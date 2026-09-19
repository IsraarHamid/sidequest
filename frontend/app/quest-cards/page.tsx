import { QuestCard } from "@/components/trip-quest/quest-card";
import { MISSIONS } from "@/lib/trip-quest-data";

const [snack, rooftop, feast, viewpoint] = MISSIONS;

export default function QuestCardsPage() {
  return (
    <div className="min-h-svh w-full bg-[#F2F2ED] flex flex-wrap content-start gap-6 p-8">
      <QuestCard
        quest={{ id: snack.id, title: snack.title, description: snack.shortDescription, points: snack.points }}
        variant="default"
      />
      <QuestCard
        quest={{ id: rooftop.id, title: rooftop.title, description: rooftop.shortDescription, points: rooftop.points }}
        variant="mark-done"
      />
      <QuestCard
        quest={{ id: feast.id, title: feast.title, description: feast.shortDescription, points: feast.points }}
        variant="take-photo"
      />
      <QuestCard
        quest={{ id: viewpoint.id, title: viewpoint.title, description: viewpoint.shortDescription, points: viewpoint.points }}
        variant="done"
      />
      <QuestCard
        quest={{ id: "quest-card-photo-demo", title: snack.title, description: snack.shortDescription, points: snack.points }}
        variant="done-photo"
        photoUrl="/trip_quest-assets/stickers/Sticker_2.png"
      />
    </div>
  );
}
