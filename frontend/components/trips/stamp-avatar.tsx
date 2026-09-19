"use client";

import Link from "next/link";
import { LogOut, SlidersHorizontal, User } from "lucide-react";
import { Menu } from "@base-ui/react/menu";
import { cn } from "cn";

type StampAvatarProps = {
  initials: string;
  color: string;
  label: string;
  profileHref: string;
  preferencesHref: string;
  logoutHref: string;
};

const triggerClassName = cn(
  "relative block h-[79px] w-[73px] shrink-0 outline-none",
  "transition-transform duration-[160ms] [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212]",
  "active:scale-[0.97]",
  "motion-reduce:transition-none motion-reduce:active:scale-100",
);

const itemClassName = cn(
  "box-border flex w-full cursor-default items-center gap-[10px] rounded-lg px-3 py-2.5 outline-none",
  "font-sans text-[15px] font-medium text-[#4A3B2E]",
  "transition-[background-color,transform] duration-200 ease",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#121212]",
  "active:scale-[0.97]",
  "data-highlighted:bg-[#DDD2C0]/40",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#DDD2C0]/40",
  "motion-reduce:transition-none motion-reduce:active:scale-100",
);

const logoutItemClassName = cn(
  itemClassName,
  "text-[#D0392F]",
  "data-highlighted:bg-[#D0392F]/8",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#D0392F]/8",
);

const scallopedPathD =
  "M0 0a5.21429 5.21429 0 0 0 10.42857 0 5.21429 5.21429 0 0 0 10.42857 0 5.21429 5.21429 0 0 0 10.42857 0 5.21429 5.21429 0 0 0 10.42858 0 5.21429 5.21429 0 0 0 10.42857 0 5.21429 5.21429 0 0 0 10.42857 0 5.21429 5.21429 0 0 0 10.42857 0 4.9375 4.9375 0 0 0 0 9.875 4.9375 4.9375 0 0 0 0 9.875 4.9375 4.9375 0 0 0 0 9.875 4.9375 4.9375 0 0 0 0 9.875 4.9375 4.9375 0 0 0 0 9.875 4.9375 4.9375 0 0 0 0 9.875 4.9375 4.9375 0 0 0 0 9.875 4.9375 4.9375 0 0 0 0 9.875 5.21429 5.21429 0 0 0-10.42857 0 5.21429 5.21429 0 0 0-10.42857 0 5.21429 5.21429 0 0 0-10.42857 0 5.21429 5.21429 0 0 0-10.42858 0 5.21429 5.21429 0 0 0-10.42857 0 5.21429 5.21429 0 0 0-10.42857 0 5.21429 5.21429 0 0 0-10.42857 0 4.9375 4.9375 0 0 0 0-9.875 4.9375 4.9375 0 0 0 0-9.875 4.9375 4.9375 0 0 0 0-9.875 4.9375 4.9375 0 0 0 0-9.875 4.9375 4.9375 0 0 0 0-9.875 4.9375 4.9375 0 0 0 0-9.875 4.9375 4.9375 0 0 0 0-9.875 4.9375 4.9375 0 0 0 0-9.875z";

/** Scalloped postage-stamp frame (73×79) — the shape shared by the interactive
 * StampAvatar menu trigger and any read-only preview of someone's avatar. */
export const StampFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative h-[79px] w-[73px] shrink-0">
    <svg
      viewBox="0 0 73 79"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="absolute inset-0 h-[79px] w-[73px] overflow-visible shadow-[0px_1px_2px_0px_#4A3B2E14]"
    >
      <path
        d={scallopedPathD}
        fill="#FBF7F0"
        stroke="#DDD2C0"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
    <div className="absolute top-2 left-2 z-[1]">{children}</div>
  </div>
);

/** Scalloped postage-stamp trigger. Opens the Pencil "Popup Menu"
 * (Profile, Adjust preferences, Logout) instead of linking directly. */
export const StampAvatar = ({
  initials,
  color,
  label,
  profileHref,
  preferencesHref,
  logoutHref,
}: StampAvatarProps) => {
  return (
    <Menu.Root modal>
      <Menu.Trigger aria-label={label} className={triggerClassName}>
        <svg
          viewBox="0 0 73 79"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="absolute inset-0 h-[79px] w-[73px] overflow-visible shadow-[0px_1px_2px_0px_#4A3B2E14]"
        >
          <path
            d={scallopedPathD}
            fill="#FBF7F0"
            stroke="#DDD2C0"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div
          className="absolute top-2 left-2 z-[1] flex h-[63px] w-[57px] items-center justify-center rounded-[12px] outline-2 -outline-offset-1 outline-[#FBF7F0]"
          style={{ backgroundColor: color }}
        >
          <span className="font-sans text-[15px] font-bold text-[#FBF7F0]">{initials}</span>
        </div>
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="start"
          sideOffset={8}
          className="z-50 outline-none"
        >
          <Menu.Popup
            className={cn(
              "box-border flex w-[220px] flex-col gap-0.5 rounded-2xl border border-[#DDD2C0] bg-[#F2F2ED] p-1",
              "shadow-[0_4px_16px_0_#4A3B2E24]",
              "origin-[var(--transform-origin)] will-change-[transform,opacity]",
              "transition-[opacity,transform] duration-200 [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)]",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
              "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
              "motion-reduce:transition-opacity motion-reduce:duration-200",
              "motion-reduce:data-[starting-style]:scale-100 motion-reduce:data-[ending-style]:scale-100",
            )}
          >
            <Menu.LinkItem
              closeOnClick
              label="Profile"
              className={itemClassName}
              render={<Link href={profileHref} />}
            >
              <User aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-[#4A3B2E]" />
              Profile
            </Menu.LinkItem>

            <Menu.LinkItem
              closeOnClick
              label="Adjust preferences"
              className={itemClassName}
              render={<Link href={preferencesHref} />}
            >
              <SlidersHorizontal
                aria-hidden="true"
                className="h-[18px] w-[18px] shrink-0 text-[#4A3B2E]"
              />
              Adjust preferences
            </Menu.LinkItem>

            <Menu.Separator className="box-border w-full p-1">
              <div aria-hidden="true" className="h-px w-full bg-[#DDD2C0]" />
            </Menu.Separator>

            <Menu.LinkItem
              closeOnClick
              label="Logout"
              className={logoutItemClassName}
              render={<Link href={logoutHref} />}
            >
              <LogOut aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-[#D0392F]" />
              Logout
            </Menu.LinkItem>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
};
