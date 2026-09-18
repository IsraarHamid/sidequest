import Link from "next/link";
import { cn } from "cn";

type PhotoStackLayout = "loose" | "compact";

type PhotoStackProps = {
  monthLabel: string;
  destination: string;
  href: string;
  layout: PhotoStackLayout;
  imageUrl?: string | null;
};

const polaroidClassName =
  "bg-[#CCCCCC] bg-cover bg-center border-[9px] border-solid border-white";

const coverStyle = (url?: string | null) =>
  url ? { backgroundImage: `url("${url}")` } : undefined;

/** Three polaroids piled like a scrapbook spread. Pencil rotates from the
 * top-left of each frame — `origin-top-left` is required so the pile sits
 * where the design put it, not around each photo's center. */
export const PhotoStack = ({
  monthLabel,
  destination,
  href,
  layout,
  imageUrl,
}: PhotoStackProps) => {
  return (
    <Link
      href={href}
      aria-label={`${destination}, ${monthLabel}`}
      className={cn(
        "flex w-full shrink-0 flex-col items-center gap-[13px] outline-none",
        "transition-transform duration-[200ms] [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)]",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#121212]",
        "active:scale-[0.97]",
        "motion-reduce:transition-none motion-reduce:active:scale-100",
      )}
    >
      <span className="font-sans text-[16px] font-normal whitespace-nowrap text-[#4A3B2E]">
        {monthLabel}
      </span>
      <div
        className={cn(
          "relative w-[334.175px] max-w-full shrink-0",
          layout === "loose" ? "h-[236.239px]" : "h-[206.239px]",
        )}
      >
        <div
          aria-hidden="true"
          style={coverStyle(imageUrl)}
          className={cn(
            polaroidClassName,
            "absolute left-[24.963px] z-0 h-[170px] w-[164px] origin-top-left rotate-[8.444deg]",
            layout === "loose" ? "top-[44px]" : "top-[14px]",
            "motion-reduce:rotate-0",
          )}
        />
        <div
          aria-hidden="true"
          style={coverStyle(imageUrl)}
          className={cn(
            polaroidClassName,
            "absolute top-0 left-[170.628px] z-[1] h-[170px] w-[164px] origin-top-left rotate-[4.26deg]",
            "motion-reduce:rotate-0",
          )}
        />
        <div
          aria-hidden="true"
          style={coverStyle(imageUrl)}
          className={cn(
            polaroidClassName,
            "absolute top-px left-[45px] z-[2] h-[197px] w-[250px]",
          )}
        />
      </div>
    </Link>
  );
};
