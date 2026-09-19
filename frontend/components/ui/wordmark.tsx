import type { CSSProperties } from "react";
import { cn } from "cn";

/** Renders inside a `@container` ancestor — sizes with cqw so it scales with its parent. */
export function Wordmark({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <p className={cn("font-sans leading-[1.05] font-black text-black", className)} style={style}>
      <span className="block text-[19.87cqw] tracking-[-0.677cqw]">SIDE</span>
      <span className="-mt-[0.28em] block text-[19.87cqw] tracking-[-1.13cqw]">
        QUEST
      </span>
    </p>
  );
}
