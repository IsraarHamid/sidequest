// Typed client for the SideQuest backend (FastAPI).
//
// Base URL comes from NEXT_PUBLIC_API_BASE_URL (see .env.local.example).
// Auth is the backend's simple anonymous model: POST /auth/anon returns a user
// whose id we send as the `X-User-Id` header on every other call. We persist it
// in localStorage so a viewer keeps their session across refreshes.
//
// The UI currently ships with mock data (lib/trip-quest-data.ts). Migrate screens
// to these functions one at a time; nothing here changes the mock data.

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

const USER_ID_KEY = "sidequest.userId";

function getUserId(): string | null {
  try {
    return typeof window !== "undefined"
      ? window.localStorage.getItem(USER_ID_KEY)
      : null;
  } catch {
    return null;
  }
}

function setUserId(id: string): void {
  try {
    window.localStorage.setItem(USER_ID_KEY, id);
  } catch {
    /* ignore (private mode etc.) */
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const uid = getUserId();
  if (uid) headers.set("X-User-Id", uid);

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${path}: ${detail}`);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

// ---- Types (mirror backend/app/models.py) ----
export type Preferences = {
  interests: string[];
  diet?: string | null;
  adventure_level?: string | null;
  budget?: string | null;
  free_text?: string | null;
};

export type User = {
  id: string;
  display_name: string;
  avatar_url?: string | null;
  preferences: Preferences;
};

export type Member = {
  user_id: string;
  display_name: string;
  role: "host" | "player";
  total_points: number;
};

export type Trip = {
  id: string;
  name: string;
  origin?: string | null;
  destination?: string | null;
  vibe?: string | null;
  status: "draft" | "active" | "arrived" | "ended";
  join_code: string;
  created_by: string;
  ends_at?: string | null;
  members: Member[];
};

export type Mission = {
  id: string;
  trip_id: string;
  assignee_user_id?: string | null;
  title: string;
  description?: string | null;
  type: "solo" | "group" | "secret";
  rarity: "common" | "rare" | "legendary";
  points: number;
  is_secret: boolean;
  status: "open" | "completed";
  business_id?: string | null;
  business_name?: string | null;
  expires_at?: string | null;
  is_expired: boolean;
  generated_by: "ai" | "fallback";
};

export type LeaderboardEntry = {
  user_id: string;
  display_name: string;
  total_points: number;
};

// The rich plan (mission_generator.md). Loosely typed — the LLM output is nested.
export type PlanCheckpoint = {
  leg_number: number;
  sequence: number;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  category: string;
  activity: string;
  why_it_fits: string;
  estimated_duration_minutes: number;
  detour_minutes: number;
  points: number;
  confidence: "high" | "medium" | "low";
  verify: boolean;
  maps_url?: string | null;
};

export type MissionPlan = {
  trip: Record<string, unknown>;
  legs: { leg_number: number; name: string; area: string; is_shared: boolean }[];
  missions: {
    member: string;
    title: string;
    brief: string;
    total_points: number;
    checkpoints: PlanCheckpoint[];
  }[];
  shared_checkpoints: (PlanCheckpoint & { maps_url?: string | null })[];
  scoring: Record<string, unknown>;
  summary_text: string;
};

// ---- API ----
export const api = {
  async signInAnon(displayName: string): Promise<User> {
    const user = await request<User>("/auth/anon", {
      method: "POST",
      body: JSON.stringify({ display_name: displayName }),
    });
    setUserId(user.id);
    return user;
  },
  me: () => request<User>("/users/me"),
  setPreferences: (prefs: Preferences) =>
    request<User>("/users/me/preferences", {
      method: "PUT",
      body: JSON.stringify(prefs),
    }),

  createTrip: (body: {
    name: string;
    origin?: string;
    destination?: string;
    vibe?: string;
    ends_at?: string;
  }) => request<Trip>("/trips", { method: "POST", body: JSON.stringify(body) }),
  joinTrip: (joinCode: string) =>
    request<Trip>("/trips/join", {
      method: "POST",
      body: JSON.stringify({ join_code: joinCode }),
    }),
  getTrip: (tripId: string) => request<Trip>(`/trips/${tripId}`),

  // Simple mission loop
  startTrip: (tripId: string) =>
    request<Mission[]>(`/trips/${tripId}/start`, { method: "POST" }),
  listMissions: (tripId: string) =>
    request<Mission[]>(`/trips/${tripId}/missions`),
  completeMission: (missionId: string, photoUrl?: string) =>
    request(`/missions/${missionId}/complete`, {
      method: "POST",
      body: JSON.stringify({ photo_url: photoUrl ?? null }),
    }),
  leaderboard: (tripId: string) =>
    request<LeaderboardEntry[]>(`/trips/${tripId}/leaderboard`),
  arrive: (tripId: string) =>
    request<Trip>(`/trips/${tripId}/arrive`, { method: "POST" }),

  // Rich, route-aware plan (mission_generator.md via the LLM)
  generatePlan: (tripId: string) =>
    request<MissionPlan>(`/trips/${tripId}/plan`, { method: "POST" }),
  getPlan: (tripId: string) => request<MissionPlan>(`/trips/${tripId}/plan`),
};

export { getUserId };
