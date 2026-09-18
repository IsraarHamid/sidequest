// Mock/demo data for the Trip Quest prototype. No backend calls yet — everything
// here is local, static data the UI maps over. Kept small and flat on purpose.

export type CrewMember = {
  id: string;
  name: string;
  initials: string;
  color: string;
  interests: string[] | null; // null => still picking ("Waiting on picks…")
};

export const CREW: CrewMember[] = [
  {
    id: "jackie",
    name: "Jackie",
    initials: "JZ",
    color: "#E85A1C",
    interests: ["Food", "Nightlife", "Photography"],
  },
  {
    id: "mika",
    name: "Mika",
    initials: "MK",
    color: "#3E6B4A",
    interests: ["History", "Local culture"],
  },
  {
    id: "tino",
    name: "Tino",
    initials: "TN",
    color: "#E87FA8",
    interests: ["Adventure", "Nature", "Shopping"],
  },
  {
    id: "reza",
    name: "Reza",
    initials: "RS",
    color: "#7FB8E0",
    interests: null,
  },
];

export type Trip = {
  id: string;
  name: string;
  destination: string;
  dates: string;
  dayLabel: string;
  inviteCode: string;
  status: "live" | "soon";
  statusLabel: string;
  rankLabel: string;
  points: number;
  memberIds: string[];
  extraMemberCount: number;
};

export const TRIPS: Trip[] = [
  {
    id: "lisbon-legends",
    name: "Lisbon Legends",
    destination: "Lisbon, Portugal",
    dates: "12 – 18 Oct 2026",
    dayLabel: "Day 2/6",
    inviteCode: "LIS-4X9K",
    status: "live",
    statusLabel: "LIVE",
    rankLabel: "#2 of 4",
    points: 1240,
    memberIds: ["jackie", "mika"],
    extraMemberCount: 2,
  },
  {
    id: "cape-town-crew",
    name: "Cape Town Crew",
    destination: "Cape Town, South Africa",
    dates: "3 – 9 Dec 2026",
    dayLabel: "Day 0/6",
    inviteCode: "CPT-7Q2M",
    status: "soon",
    statusLabel: "SOON",
    rankLabel: "Not started yet",
    points: 0,
    memberIds: ["jackie", "tino"],
    extraMemberCount: 4,
  },
];

export const DEFAULT_TRIP_ID = "lisbon-legends";

export function getTrip(tripId: string): Trip {
  return TRIPS.find((trip) => trip.id === tripId) ?? TRIPS[0];
}

export type MissionStatus = "not-started" | "in-progress" | "completed";

export type Mission = {
  id: string;
  tripId: string;
  category: string;
  icon: string; // lucide icon name, PascalCase handled by mapping in the component
  title: string;
  shortDescription: string;
  longDescription: string;
  hint: string;
  points: number;
  timeLeft: string;
  kind: "solo" | "group";
  kindLabel: string;
  status: MissionStatus;
  statusLabel: string;
  groupProgressLabel?: string;
  accentColor: string;
  draftNote?: string;
};

export const MISSIONS: Mission[] = [
  {
    id: "local-snack",
    tripId: "lisbon-legends",
    category: "FOOD",
    icon: "Utensils",
    title: "Find the best local snack",
    shortDescription:
      "Track down a snack only locals know about and convince your group to try it.",
    longDescription:
      "Track down a snack only locals know about — no chains, no tourist traps. Convince at least one group member to try it, and get a reaction on camera.",
    hint: "Ask a vendor what THEY eat after their shift.",
    points: 150,
    timeLeft: "2h left",
    kind: "solo",
    kindLabel: "SOLO MISSION",
    status: "not-started",
    statusLabel: "Not started",
    accentColor: "#E8B62C",
    draftNote:
      "Found a family-run pastelaria two streets off the square — the custard tart was unreal.",
  },
  {
    id: "rooftop-shot",
    tripId: "lisbon-legends",
    category: "PHOTOGRAPHY",
    icon: "Camera",
    title: "Golden hour rooftop shot",
    shortDescription:
      "Capture Lisbon's rooftops lit up at sunset from any public viewpoint.",
    longDescription:
      "Capture Lisbon's rooftops lit up at sunset from any public viewpoint. Bonus points for catching the Tagus in frame.",
    hint: "Miradouro da Senhora do Monte gets less crowded after 6pm.",
    points: 120,
    timeLeft: "5h left",
    kind: "solo",
    kindLabel: "SOLO MISSION",
    status: "in-progress",
    statusLabel: "In progress",
    accentColor: "#E8B62C",
  },
  {
    id: "street-feast",
    tripId: "lisbon-legends",
    category: "GROUP",
    icon: "Users",
    title: "Host a street-food feast",
    shortDescription:
      "Pick 3 stalls together and vote on a group MVP dish before sunset.",
    longDescription:
      "Pick 3 stalls together and vote on a group MVP dish before sunset. Everyone in the crew needs to try at least one bite.",
    hint: "Split up, order different things, then regroup to compare.",
    points: 400,
    timeLeft: "1 day left",
    kind: "group",
    kindLabel: "WHOLE CREW",
    status: "in-progress",
    statusLabel: "2 of 4 in",
    groupProgressLabel: "2 of 4 in",
    accentColor: "#3E6B4A",
  },
  {
    id: "hidden-viewpoint",
    tripId: "lisbon-legends",
    category: "HISTORY",
    icon: "Landmark",
    title: "Find a hidden viewpoint",
    shortDescription: "Discovered Miradouro da Graça before the crowds.",
    longDescription: "Discovered Miradouro da Graça before the crowds.",
    hint: "Go before 8am for the best light and the fewest tourists.",
    points: 100,
    timeLeft: "",
    kind: "solo",
    kindLabel: "SOLO MISSION",
    status: "completed",
    statusLabel: "Completed",
    accentColor: "#E8B62C",
  },
];

export function getMission(missionId: string): Mission {
  return MISSIONS.find((mission) => mission.id === missionId) ?? MISSIONS[0];
}

export type VoteCategory = {
  id: string;
  label: string;
  icon: string;
  color: string;
  votes: number;
};

export const VOTE_CATEGORIES: VoteCategory[] = [
  { id: "funniest", label: "Funniest", icon: "Laugh", color: "#E85A1C", votes: 12 },
  { id: "best-photo", label: "Best photo", icon: "Camera", color: "#7FB8E0", votes: 8 },
  { id: "most-creative", label: "Most creative", icon: "Sparkles", color: "#E87FA8", votes: 5 },
];

export type LeaderboardRow = {
  rank: number;
  memberId: string;
  missionsCount: number;
  badgesCount: number;
  points: number;
};

export const LEADERBOARD: LeaderboardRow[] = [
  { rank: 1, memberId: "jackie", missionsCount: 6, badgesCount: 3, points: 1240 },
  { rank: 2, memberId: "mika", missionsCount: 5, badgesCount: 2, points: 1090 },
  { rank: 3, memberId: "tino", missionsCount: 5, badgesCount: 2, points: 980 },
  { rank: 4, memberId: "reza", missionsCount: 3, badgesCount: 1, points: 640 },
];

export type Badge = {
  id: string;
  label: string;
  icon: string;
  color: string;
};

export const BADGES: Badge[] = [
  { id: "foodie", label: "Foodie", icon: "Utensils", color: "#E8B62C" },
  { id: "shutterbug", label: "Shutterbug", icon: "Camera", color: "#7FB8E0" },
  { id: "speed-demon", label: "Speed demon", icon: "Zap", color: "#E85A1C" },
  { id: "team-player", label: "Team player", icon: "Users", color: "#3E6B4A" },
  { id: "night-owl", label: "Night owl", icon: "MoonStar", color: "#E87FA8" },
];

export type PassportDestination = {
  id: string;
  name: string;
  status: "completed" | "upcoming";
  statLabel: string;
};

export const PASSPORT_DESTINATIONS: PassportDestination[] = [
  {
    id: "lisbon",
    name: "Lisbon, Portugal",
    status: "completed",
    statLabel: "Completed · 12–18 Oct",
  },
  {
    id: "cape-town",
    name: "Cape Town, South Africa",
    status: "upcoming",
    statLabel: "Upcoming · 3–9 Dec",
  },
];

export type FavouriteMissionType = {
  id: string;
  label: string;
  percentage: number;
};

export const FAVOURITE_MISSION_TYPES: FavouriteMissionType[] = [
  { id: "food", label: "Food", percentage: 42 },
  { id: "photography", label: "Photography", percentage: 31 },
  { id: "adventure", label: "Adventure", percentage: 18 },
];

export const INTEREST_OPTIONS = [
  { id: "food", label: "Food", icon: "Utensils" },
  { id: "nature", label: "Nature", icon: "Trees" },
  { id: "shopping", label: "Shopping", icon: "ShoppingBag" },
  { id: "history", label: "History", icon: "Landmark" },
  { id: "nightlife", label: "Nightlife", icon: "MoonStar" },
  { id: "adventure", label: "Adventure", icon: "Mountain" },
  { id: "photography", label: "Photography", icon: "Camera" },
  { id: "local-culture", label: "Local culture", icon: "Drama" },
] as const;

export const DEFAULT_SELECTED_INTERESTS = ["food", "nightlife", "photography"];

export type Vibe = {
  id: string;
  label: string;
  description: string;
  icon: string;
};

export const VIBES: Vibe[] = [
  { id: "relaxed", label: "Relaxed", description: "Easygoing, low pressure", icon: "Feather" },
  {
    id: "adventurous",
    label: "Adventurous",
    description: "Push your comfort zone",
    icon: "Compass",
  },
  { id: "competitive", label: "Competitive", description: "Chase points and rank", icon: "Flame" },
  { id: "creative", label: "Creative", description: "Story and style first", icon: "Palette" },
];

export const DEFAULT_SELECTED_VIBE = "adventurous";
