import { DEFAULT_TRIP_ID } from "@/lib/trip-quest-data";

const TRIP = `/trips/${DEFAULT_TRIP_ID}`;
const MISSION = `${TRIP}/missions/local-snack`;

export type SandboxScreen = {
  id: string;
  label: string;
  href: string;
  match: (pathname: string) => boolean;
};

export type SandboxScreenGroup = {
  id: string;
  label: string;
  screens: SandboxScreen[];
};

const isTripSegment = (pathname: string, segment: string) =>
  new RegExp(`^/trips/[^/]+/${segment}$`).test(pathname);

export const SANDBOX_SCREEN_GROUPS: SandboxScreenGroup[] = [
  {
    id: "start",
    label: "Get started",
    screens: [
      {
        id: "login",
        label: "Welcome",
        href: "/login",
        match: (pathname) => pathname === "/login",
      },
      {
        id: "onboarding",
        label: "Onboarding",
        href: "/onboarding",
        match: (pathname) => pathname === "/onboarding",
      },
    ],
  },
  {
    id: "trips",
    label: "Trips",
    screens: [
      {
        id: "journal",
        label: "Travel journal",
        href: "/journal",
        match: (pathname) => pathname === "/journal",
      },
      {
        id: "home",
        label: "Your trips",
        href: "/",
        match: (pathname) => pathname === "/",
      },
      {
        id: "new-trip",
        label: "New trip",
        href: "/trips/new",
        match: (pathname) => pathname === "/trips/new",
      },
      {
        id: "join-trip",
        label: "Join trip",
        href: "/trips/join",
        match: (pathname) => pathname === "/trips/join",
      },
    ],
  },
  {
    id: "in-trip",
    label: "Lisbon Legends",
    screens: [
      {
        id: "lobby",
        label: "Lobby",
        href: `${TRIP}/lobby`,
        match: (pathname) => isTripSegment(pathname, "lobby"),
      },
      {
        id: "preferences",
        label: "Preferences",
        href: `${TRIP}/preferences`,
        match: (pathname) => isTripSegment(pathname, "preferences"),
      },
      {
        id: "missions",
        label: "Missions",
        href: `${TRIP}/missions`,
        match: (pathname) => /\/missions$/.test(pathname),
      },
      {
        id: "mission",
        label: "Mission",
        href: MISSION,
        match: (pathname) => /\/missions\/[^/]+$/.test(pathname),
      },
      {
        id: "vote",
        label: "Vote",
        href: `${MISSION}/vote`,
        match: (pathname) => pathname.endsWith("/vote"),
      },
      {
        id: "leaderboard",
        label: "Leaderboard",
        href: `${TRIP}/leaderboard`,
        match: (pathname) => isTripSegment(pathname, "leaderboard"),
      },
      {
        id: "passport",
        label: "Passport",
        href: `${TRIP}/passport`,
        match: (pathname) => isTripSegment(pathname, "passport"),
      },
    ],
  },
];

export const DEFAULT_SANDBOX_HREF = SANDBOX_SCREEN_GROUPS[0].screens[0].href;

export const findSandboxScreen = (pathname: string) => {
  for (const group of SANDBOX_SCREEN_GROUPS) {
    for (const screen of group.screens) {
      if (screen.match(pathname)) return screen;
    }
  }

  return null;
};
