"use client";

import type { RefObject } from "react";
import { cn } from "cn";

export const DEVICE_SCREEN = {
  width: 393,
  height: 852,
} as const;

const BEZEL = 11;
const FRAME_WIDTH = DEVICE_SCREEN.width + BEZEL * 2;
const FRAME_HEIGHT = DEVICE_SCREEN.height + BEZEL * 2;

type DevicePreviewProps = {
  src: string;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  label: string;
  path: string;
};

export const DevicePreview = ({
  src,
  iframeRef,
  label,
  path,
}: DevicePreviewProps) => {
  return (
    <div
      className="flex shrink-0 flex-col items-center gap-3"
      style={{ width: FRAME_WIDTH }}
    >
      <div
        className="relative shrink-0 rounded-[48px] bg-[#1A1612] p-[11px] ring-1 ring-[#FBF7F0]/10"
        style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT }}
      >
        <div
          aria-hidden="true"
          className="absolute top-[118px] -left-[3px] h-[28px] w-[3px] rounded-l-sm bg-[#2C2722]"
        />
        <div
          aria-hidden="true"
          className="absolute top-[164px] -left-[3px] h-[52px] w-[3px] rounded-l-sm bg-[#2C2722]"
        />
        <div
          aria-hidden="true"
          className="absolute top-[228px] -left-[3px] h-[52px] w-[3px] rounded-l-sm bg-[#2C2722]"
        />
        <div
          aria-hidden="true"
          className="absolute top-[176px] -right-[3px] h-[72px] w-[3px] rounded-r-sm bg-[#2C2722]"
        />

        <div
          className="relative overflow-hidden rounded-[37px] bg-[#F2F2ED]"
          style={{
            width: DEVICE_SCREEN.width,
            height: DEVICE_SCREEN.height,
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[11px] left-1/2 z-10 h-[34px] w-[118px] -translate-x-1/2 rounded-full bg-[#1A1612]"
          />

          <iframe
            ref={iframeRef}
            src={src}
            title={`${label} preview`}
            className="h-full w-full border-0 bg-[#F2F2ED]"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[8px] left-1/2 z-10 h-[5px] w-[128px] -translate-x-1/2 rounded-full bg-[#4A3B2E]/30"
          />
        </div>
      </div>

      <p
        className={cn(
          "font-mono text-[11px] tracking-[0.04em] text-[#8A7A69]",
          "whitespace-nowrap",
        )}
      >
        {label}
        <span className="text-[#8A7A69]/60"> · {path}</span>
      </p>
    </div>
  );
};
