export const STICKERS = [
  ...Array.from({ length: 25 }, (_, i) => `/trip_quest-assets/stickers/Sticker_${i + 1}.png`),
  ...Array.from(
    { length: 18 },
    (_, i) => `/trip_quest-assets/stickers/sticker_2_${String(i + 1).padStart(2, "0")}.png`,
  ),
];

export const shuffleStickers = (stickers: string[]) => {
  const shuffled = [...stickers];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
