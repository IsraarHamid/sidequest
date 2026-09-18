import {
  CanvasTexture,
  Color,
  LinearFilter,
  LinearMipmapLinearFilter,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from "three";
import {
  JOURNAL_COVER_DESIGN,
  JOURNAL_STICKERS,
  type JournalSticker,
} from "@/lib/journal-art";

export const DEFAULT_JOURNAL_COLOR = "#416E51";

export const JOURNAL_COLOR_PRESETS = [
  { id: "forest", label: "Forest", hex: "#416E51" },
  { id: "ocean", label: "Ocean", hex: "#2F5D73" },
  { id: "wine", label: "Wine", hex: "#7A3340" },
  { id: "midnight", label: "Midnight", hex: "#243056" },
  { id: "sand", label: "Sand", hex: "#C2A36B" },
  { id: "clay", label: "Clay", hex: "#C45C38" },
  { id: "ink", label: "Ink", hex: "#2B2724" },
] as const;

export const JOURNAL_BOOK = {
  width: 1.62,
  height: 2.28,
  depth: 0.2,
} as const;

const COVER_WIDTH = 1024;
const COVER_HEIGHT = 1448;
const GOCHI_FAMILY = "Gochi Hand";

let gochiFontPromise: Promise<void> | null = null;
let stickerImagesPromise: Promise<Map<JournalSticker["id"], HTMLImageElement>> | null =
  null;

const hexToColor = (hex: string) => new Color(hex);

const toCssHex = (color: Color) => `#${color.getHexString()}`;

const shiftLightness = (hex: string, amount: number) => {
  const color = hexToColor(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  color.setHSL(hsl.h, hsl.s, Math.min(1, Math.max(0, hsl.l + amount)));
  return toCssHex(color);
};

export const deriveSpineColor = (coverHex: string) =>
  shiftLightness(coverHex, -0.08);

export const deriveTitleColor = (coverHex: string) => {
  if (coverHex.toLowerCase() === DEFAULT_JOURNAL_COLOR.toLowerCase()) {
    return "#21C45D";
  }

  const color = hexToColor(coverHex);
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);

  if (hsl.l < 0.16) return "#F4EFE4";
  if (hsl.l > 0.62) return "#1F1A16";

  color.setHSL(hsl.h, Math.min(0.78, hsl.s + 0.42), Math.min(0.56, hsl.l + 0.2));
  return toCssHex(color);
};

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
};

const geistFamily = () => {
  if (typeof document === "undefined") return "ui-sans-serif, system-ui, sans-serif";
  const variable = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-geist-sans")
    .trim();
  return variable
    ? `${variable}, ui-sans-serif, system-ui, sans-serif`
    : "ui-sans-serif, system-ui, sans-serif";
};

export const loadJournalFonts = async () => {
  if (typeof document === "undefined") return;

  if (!gochiFontPromise) {
    gochiFontPromise = (async () => {
      const face = new FontFace(
        GOCHI_FAMILY,
        "url(/fonts/GochiHand-Regular.ttf)",
        { weight: "400", style: "normal", display: "swap" },
      );
      const loaded = await face.load();
      document.fonts.add(loaded);
      await Promise.all([
        document.fonts.load(`400 120px "${GOCHI_FAMILY}"`),
        document.fonts.load(`900 200px ${geistFamily()}`),
        document.fonts.ready,
      ]);
    })().catch(() => {
      gochiFontPromise = null;
    });
  }

  await gochiFontPromise;
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load journal sticker ${src}.`));
    image.src = src;
  });

const loadJournalStickerImages = async () => {
  if (!stickerImagesPromise) {
    stickerImagesPromise = Promise.all(
      JOURNAL_STICKERS.map(async (sticker) => {
        const image = await loadImage(sticker.src);
        return [sticker.id, image] as const;
      }),
    )
      .then((entries) => new Map(entries))
      .catch((error) => {
        stickerImagesPromise = null;
        throw error;
      });
  }

  return stickerImagesPromise;
};

const fitFontSize = (
  ctx: CanvasRenderingContext2D,
  text: string,
  font: (size: number) => string,
  maxWidth: number,
  maxSize: number,
  minSize: number,
) => {
  let size = maxSize;
  ctx.font = font(size);
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = font(size);
  }
  return size;
};

const drawSticker = (
  ctx: CanvasRenderingContext2D,
  sticker: JournalSticker,
  image: HTMLImageElement | undefined,
  scaleX: number,
  scaleY: number,
) => {
  if (!image) return;

  ctx.save();
  ctx.translate(sticker.x * scaleX, sticker.y * scaleY);
  ctx.rotate((sticker.rotationDeg * Math.PI) / 180);
  ctx.drawImage(image, 0, 0, sticker.width * scaleX, sticker.height * scaleY);
  ctx.restore();
};

export const paintJournalCover = (
  ctx: CanvasRenderingContext2D,
  coverColor: string,
  ownerName: string,
  stickerImages: ReadonlyMap<JournalSticker["id"], HTMLImageElement> = new Map(),
) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const scaleX = width / JOURNAL_COVER_DESIGN.width;
  const scaleY = height / JOURNAL_COVER_DESIGN.height;
  const sans = geistFamily();
  const titleColor = deriveTitleColor(coverColor);
  const name = ownerName.trim() || "Traveller";
  const titleSize = 70.337 * scaleY;

  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = titleColor;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = `900 ${titleSize}px ${sans}`;
  ctx.letterSpacing = `${-2.398 * scaleX}px`;
  ctx.fillText("SIDE", 73.95 * scaleX, 150.3 * scaleY);
  ctx.letterSpacing = `${-3.996 * scaleX}px`;
  ctx.fillText("QUEST", 73.99 * scaleX, 204.65 * scaleY);
  ctx.letterSpacing = "0px";

  const plateWidth = 274 * scaleX;
  const plateHeight = 94 * scaleY;
  const plateX = 47.5 * scaleX;
  const plateY = 391.26 * scaleY;

  ctx.shadowColor = "rgba(18, 18, 18, 0.08)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  roundRect(ctx, plateX, plateY, plateWidth, plateHeight, 16 * scaleX);
  ctx.fillStyle = "#FBF7F0";
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = "#DDD2C0";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = "center";
  const nameMaxWidth = plateWidth - 32 * scaleX;
  const nameSize = fitFontSize(
    ctx,
    name,
    (size) => `400 ${size}px "${GOCHI_FAMILY}", cursive`,
    nameMaxWidth,
    55 * scaleY,
    28 * scaleY,
  );
  ctx.fillStyle = "#4A3B2E";
  ctx.font = `400 ${nameSize}px "${GOCHI_FAMILY}", cursive`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(name, plateX + plateWidth / 2, plateY + 47 * scaleY);

  const ruleY = plateY + 57 * scaleY;
  ctx.strokeStyle = "#262626";
  ctx.lineWidth = 2 * scaleY;
  ctx.beginPath();
  ctx.moveTo(plateX + 14.5 * scaleX, ruleY);
  ctx.lineTo(plateX + plateWidth - 14.5 * scaleX, ruleY);
  ctx.stroke();

  ctx.fillStyle = "#000000";
  ctx.font = `300 ${16 * scaleY}px ${sans}`;
  ctx.letterSpacing = `${-0.5 * scaleX}px`;
  ctx.textBaseline = "middle";
  ctx.fillText("This book belongs to", plateX + plateWidth / 2, plateY + 76 * scaleY);
  ctx.letterSpacing = "0px";

  for (const sticker of JOURNAL_STICKERS) {
    if (sticker.layer !== 1) continue;
    drawSticker(ctx, sticker, stickerImages.get(sticker.id), scaleX, scaleY);
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.09)";
  ctx.fillRect(10.24 * scaleX, 0, 11 * scaleX, height);

  for (const sticker of JOURNAL_STICKERS) {
    if (sticker.layer !== 3) continue;
    drawSticker(ctx, sticker, stickerImages.get(sticker.id), scaleX, scaleY);
  }
};

export const createJournalCoverTexture = async (
  coverColor: string,
  ownerName: string,
): Promise<Texture> => {
  const canvas = document.createElement("canvas");
  canvas.width = COVER_WIDTH;
  canvas.height = COVER_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create a 2D canvas for the journal cover.");
  }

  const stickerImages = await loadJournalStickerImages().catch(
    () => new Map<JournalSticker["id"], HTMLImageElement>(),
  );
  paintJournalCover(ctx, coverColor, ownerName, stickerImages);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
};

export const createPageEdgeTexture = (): Texture => {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create a 2D canvas for the page edges.");
  }

  ctx.fillStyle = "#F7F1E6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#E4D8C4";
  ctx.lineWidth = 1;
  for (let y = 2; y < canvas.height; y += 3) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1, 10);
  texture.needsUpdate = true;
  return texture;
};
