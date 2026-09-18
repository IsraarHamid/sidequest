"use client";

import dynamic from "next/dynamic";

type TravelJournalProps = {
  ownerName: string;
  coverColor: string;
};

const TravelJournalCanvas = dynamic(
  () =>
    import("@/components/journal/travel-journal-canvas").then(
      (mod) => mod.TravelJournalCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-full w-full bg-[#F2F2ED]"
        aria-label="Loading travel journal"
      />
    ),
  },
);

export const TravelJournal = ({ ownerName, coverColor }: TravelJournalProps) => {
  return (
    <div
      className="h-full w-full"
      role="img"
      aria-label={`${ownerName}'s SideQuest travel journal`}
    >
      <TravelJournalCanvas ownerName={ownerName} coverColor={coverColor} />
    </div>
  );
};
