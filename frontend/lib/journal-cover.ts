import {
  CanvasTexture,
  Color,
  LinearFilter,
  LinearMipmapLinearFilter,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from "three";

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
        document.fonts.ready,
      ]);
    })().catch(() => {
      gochiFontPromise = null;
    });
  }

  await gochiFontPromise;
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

export const paintJournalCover = (
  ctx: CanvasRenderingContext2D,
  coverColor: string,
  ownerName: string,
) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const sans = geistFamily();
  const titleColor = deriveTitleColor(coverColor);
  const name = ownerName.trim() || "Traveller";

  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
  ctx.fillRect(36, 0, 22, height);
  ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
  ctx.fillRect(58, 0, 3, height);

  ctx.fillStyle = titleColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const titleSize = fitFontSize(
    ctx,
    "SIDE QUEST",
    (size) => `800 ${size}px ${sans}`,
    width * 0.78,
    108,
    64,
  );
  ctx.font = `800 ${titleSize}px ${sans}`;
  ctx.fillText("SIDE QUEST", width * 0.54, height * 0.695);

  const plateWidth = width * 0.72;
  const plateHeight = 236;
  const plateX = (width - plateWidth) * 0.58;
  const plateY = height * 0.745;

  ctx.shadowColor = "rgba(18, 18, 18, 0.08)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  roundRect(ctx, plateX, plateY, plateWidth, plateHeight, 28);
  ctx.fillStyle = "#FBF7F0";
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = "#DDD2C0";
  ctx.lineWidth = 2;
  ctx.stroke();

  const nameMaxWidth = plateWidth - 48;
  const nameSize = fitFontSize(
    ctx,
    name,
    (size) => `400 ${size}px "${GOCHI_FAMILY}", cursive`,
    nameMaxWidth,
    118,
    44,
  );
  ctx.fillStyle = "#4A3B2E";
  ctx.font = `400 ${nameSize}px "${GOCHI_FAMILY}", cursive`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(name, plateX + plateWidth / 2, plateY + 118);

  const ruleY = plateY + 148;
  ctx.strokeStyle = "#262626";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(plateX + 36, ruleY);
  ctx.lineTo(plateX + plateWidth - 36, ruleY);
  ctx.stroke();

  ctx.fillStyle = "#121212";
  ctx.font = `300 28px ${sans}`;
  ctx.textBaseline = "middle";
  ctx.fillText("This book belongs to", plateX + plateWidth / 2, plateY + 188);
};

export const createJournalCoverTexture = (
  coverColor: string,
  ownerName: string,
): Texture => {
  const canvas = document.createElement("canvas");
  canvas.width = COVER_WIDTH;
  canvas.height = COVER_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create a 2D canvas for the journal cover.");
  }

  paintJournalCover(ctx, coverColor, ownerName);

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
