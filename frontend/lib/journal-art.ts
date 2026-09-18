export const JOURNAL_COVER_DESIGN = {
  width: 354,
  height: 512,
} as const;

export type JournalSticker = {
  id: "boots" | "suitcase" | "train" | "cat";
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotationDeg: number;
  layer: number;
  className: string;
};

export const JOURNAL_STICKERS: readonly JournalSticker[] = [
  {
    id: "boots",
    src: "/journal/sticker-boots.png",
    x: 8.82,
    y: -26.03,
    width: 178,
    height: 140,
    rotationDeg: -5.02,
    layer: 1,
    className:
      "pointer-events-none absolute top-[-5.08%] left-[2.49%] z-[1] h-[27.34%] w-[50.28%] max-w-none rotate-[-5.02deg] select-none",
  },
  {
    id: "suitcase",
    src: "/journal/sticker-suitcase.png",
    x: 265.2,
    y: 275.58,
    width: 120,
    height: 111,
    rotationDeg: -3.34,
    layer: 1,
    className:
      "pointer-events-none absolute top-[53.82%] left-[74.92%] z-[1] h-[21.68%] w-[33.9%] max-w-none rotate-[-3.34deg] select-none",
  },
  {
    id: "train",
    src: "/journal/sticker-train.png",
    x: 12.81,
    y: 277.22,
    width: 113,
    height: 106,
    rotationDeg: -1.67,
    layer: 3,
    className:
      "pointer-events-none absolute top-[54.14%] left-[3.62%] z-[3] h-[20.7%] w-[31.92%] max-w-none rotate-[-1.67deg] select-none",
  },
  {
    id: "cat",
    src: "/journal/sticker-cat.png",
    x: 242.17,
    y: 1.79,
    width: 127,
    height: 145,
    rotationDeg: -3.34,
    layer: 3,
    className:
      "pointer-events-none absolute top-[0.35%] left-[68.41%] z-[3] h-[28.32%] w-[35.88%] max-w-none rotate-[-3.34deg] select-none",
  },
];
