"use client";

import type { KeyboardEvent } from "react";
import {
  BookOpen,
  Compass,
  Heart,
  LogIn,
  Map,
  PanelLeft,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trophy,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "cn";
import {
  SANDBOX_SCREEN_GROUPS,
  type SandboxScreen,
} from "@/lib/sandbox-screens";

const SCREEN_ICONS: Record<string, LucideIcon> = {
  login: LogIn,
  onboarding: Sparkles,
  home: Map,
  "new-trip": Plus,
  "join-trip": UserPlus,
  lobby: Users,
  preferences: SlidersHorizontal,
  missions: Target,
  mission: Compass,
  vote: Heart,
  leaderboard: Trophy,
  passport: BookOpen,
};

type SandboxSidebarProps = {
  isOpen: boolean;
  activeScreenId: string | null;
  onToggle: () => void;
  onSelectScreen: (href: string) => void;
};

export const SandboxSidebar = ({
  isOpen,
  activeScreenId,
  onToggle,
  onSelectScreen,
}: SandboxSidebarProps) => {
  const handleToggle = () => {
    onToggle();
  };

  const handleSelectScreen = (screen: SandboxScreen) => {
    onSelectScreen(screen.href);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    screen: SandboxScreen,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelectScreen(screen);
    }
  };

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col overflow-hidden border-r border-[#FBF7F0]/8 bg-[#161310]",
        "transition-[width] duration-[250ms] [transition-timing-function:cubic-bezier(0.215,0.61,0.355,1)]",
        "motion-reduce:transition-none",
        isOpen ? "w-[272px]" : "w-16",
      )}
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-[#FBF7F0]/8",
          isOpen ? "justify-between px-3" : "justify-center px-2",
        )}
      >
        {isOpen ? (
          <div className="min-w-0 pl-1">
            <p className="truncate text-[13px] font-semibold tracking-[-0.01em] text-[#FBF7F0]">
              SideQuest
            </p>
            <p className="font-mono text-[10px] tracking-[0.12em] text-[#8A7A69] uppercase">
              Sandbox
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleToggle}
          aria-label={isOpen ? "Collapse screen list" : "Expand screen list"}
          aria-expanded={isOpen}
          aria-controls="sandbox-screen-nav"
          className={cn(
            "flex size-8 items-center justify-center rounded-lg text-[#FBF7F0]",
            "outline-none transition-[background-color,color] duration-200 ease",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8B62C]",
            "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#FBF7F0]/8",
          )}
        >
          <PanelLeft className="size-4" />
        </button>
      </div>

      <nav
        id="sandbox-screen-nav"
        aria-label="App screens"
        className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto py-4"
      >
        {SANDBOX_SCREEN_GROUPS.map((group) => (
          <div key={group.id} className="flex flex-col gap-1 px-2">
            {isOpen ? (
              <p className="px-2 pb-1 font-mono text-[10px] tracking-[0.14em] text-[#8A7A69] uppercase">
                {group.label}
              </p>
            ) : (
              <span className="sr-only">{group.label}</span>
            )}

            {group.screens.map((screen) => {
              const Icon = SCREEN_ICONS[screen.id] ?? Compass;
              const isActive = screen.id === activeScreenId;

              return (
                <button
                  key={screen.id}
                  type="button"
                  onClick={() => handleSelectScreen(screen)}
                  onKeyDown={(event) => handleKeyDown(event, screen)}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={screen.label}
                  title={isOpen ? undefined : screen.label}
                  tabIndex={0}
                  className={cn(
                    "flex h-9 w-full items-center rounded-lg text-left outline-none",
                    "transition-[background-color,color] duration-200 ease",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8B62C]",
                    isOpen ? "gap-2.5 px-2.5" : "justify-center px-0",
                    isActive
                      ? "bg-[#FBF7F0] text-[#121212]"
                      : "text-[#FBF7F0]/80 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#FBF7F0]/8 [@media(hover:hover)_and_(pointer:fine)]:hover:text-[#FBF7F0]",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span
                    className={cn(
                      "truncate text-[13px] font-medium",
                      !isOpen && "sr-only",
                    )}
                  >
                    {screen.label}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
};
