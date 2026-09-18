-- SideQuest — Supabase schema (generated from DATABASE.md)
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- Safe to re-run (idempotent: IF NOT EXISTS + guarded enum creation).

create extension if not exists pgcrypto;

-- ---------- Enums (guarded so re-runs don't error) ----------
do $$ begin create type trip_status    as enum ('draft','active','arrived','ended'); exception when duplicate_object then null; end $$;
do $$ begin create type member_role    as enum ('host','player');                    exception when duplicate_object then null; end $$;
do $$ begin create type mission_type   as enum ('solo','group','secret');            exception when duplicate_object then null; end $$;
do $$ begin create type mission_rarity as enum ('common','rare','legendary');        exception when duplicate_object then null; end $$;
do $$ begin create type mission_status as enum ('open','completed');                 exception when duplicate_object then null; end $$;
do $$ begin create type auth_provider  as enum ('anonymous','email','google');       exception when duplicate_object then null; end $$;

-- ---------- Users & auth ----------
create table if not exists users (
    id             uuid primary key default gen_random_uuid(),
    email          text unique,
    display_name   text not null default 'Player',
    password_hash  text,
    auth_provider  auth_provider not null default 'anonymous',
    google_id      text unique,
    is_admin       boolean not null default false,
    avatar_url     text,
    avatar_color   text,
    initials       text,
    created_at     timestamptz not null default now()
);

create table if not exists user_preferences (
    user_id          uuid primary key references users(id) on delete cascade,
    interests        text[] not null default '{}',
    diet             text,
    adventure_level  text,
    budget           text,
    free_text        text
);

-- ---------- Businesses (real places from Gemini) ----------
create table if not exists businesses (
    id           uuid primary key default gen_random_uuid(),
    name         text not null,
    location     text,
    category     text,
    tags         text[] not null default '{}',
    is_promoted  boolean not null default false,
    rating       numeric,
    lat          double precision,
    lng          double precision,
    created_at   timestamptz not null default now()
);

-- ---------- Trips ----------
create table if not exists trips (
    id           uuid primary key default gen_random_uuid(),
    name         text not null,
    origin       text,
    destination  text,
    vibe         text,
    status       trip_status not null default 'draft',
    join_code    text unique not null,
    created_by   uuid not null references users(id) on delete cascade,
    start_date   date,
    end_date     date,
    start_time   timestamptz,
    ends_at      timestamptz,
    plan         jsonb,           -- rich mission plan (mission_generator.md)
    created_at   timestamptz not null default now()
);
create index if not exists trips_join_code_idx on trips (join_code);

create table if not exists trip_members (
    id            uuid primary key default gen_random_uuid(),
    trip_id       uuid not null references trips(id) on delete cascade,
    user_id       uuid not null references users(id) on delete cascade,
    role          member_role not null default 'player',
    total_points  int not null default 0,
    joined_at     timestamptz not null default now(),
    unique (trip_id, user_id)
);
create index if not exists trip_members_trip_idx on trip_members (trip_id);

-- ---------- Missions ----------
create table if not exists missions (
    id                uuid primary key default gen_random_uuid(),
    trip_id           uuid not null references trips(id) on delete cascade,
    assignee_user_id  uuid references users(id) on delete set null,
    title             text not null,
    description       text,
    type              mission_type not null default 'solo',
    rarity            mission_rarity not null default 'common',
    points            int not null default 100,
    is_secret         boolean not null default false,
    status            mission_status not null default 'open',
    business_id       uuid references businesses(id) on delete set null,
    business_name     text,
    expires_at        timestamptz,
    generated_by      text not null default 'ai',
    created_at        timestamptz not null default now()
);
create index if not exists missions_trip_idx on missions (trip_id);
create index if not exists missions_assignee_idx on missions (assignee_user_id);

create table if not exists mission_completions (
    id              uuid primary key default gen_random_uuid(),
    mission_id      uuid not null references missions(id) on delete cascade,
    user_id         uuid not null references users(id) on delete cascade,
    photo_url       text,
    is_first        boolean not null default false,
    points_awarded  int not null default 0,
    completed_at    timestamptz not null default now(),
    unique (mission_id, user_id)
);
create index if not exists completions_mission_idx on mission_completions (mission_id);

-- ---------- Social / gamification (schema-ready) ----------
create table if not exists rankings (
    id             uuid primary key default gen_random_uuid(),
    completion_id  uuid not null references mission_completions(id) on delete cascade,
    voter_user_id  uuid not null references users(id) on delete cascade,
    category       text not null,
    score          int not null default 1,
    created_at     timestamptz not null default now(),
    unique (completion_id, voter_user_id, category)
);

create table if not exists badges (
    id           uuid primary key default gen_random_uuid(),
    code         text unique not null,
    name         text not null,
    description  text,
    icon         text
);

create table if not exists user_badges (
    id         uuid primary key default gen_random_uuid(),
    user_id    uuid not null references users(id) on delete cascade,
    badge_id   uuid not null references badges(id) on delete cascade,
    trip_id    uuid references trips(id) on delete set null,
    earned_at  timestamptz not null default now(),
    unique (user_id, badge_id, trip_id)
);

create table if not exists feed_posts (
    id             uuid primary key default gen_random_uuid(),
    completion_id  uuid not null references mission_completions(id) on delete cascade,
    trip_id        uuid not null references trips(id) on delete cascade,
    business_id    uuid references businesses(id) on delete set null,
    caption        text,
    created_at     timestamptz not null default now()
);
create index if not exists feed_posts_trip_idx on feed_posts (trip_id);

-- ---------- Roadmap (competition + monetization) ----------
create table if not exists competitions (
    id           uuid primary key default gen_random_uuid(),
    name         text not null,
    destination  text,
    starts_at    timestamptz,
    ends_at      timestamptz,
    created_at   timestamptz not null default now()
);

create table if not exists competition_trips (
    competition_id  uuid not null references competitions(id) on delete cascade,
    trip_id         uuid not null references trips(id) on delete cascade,
    score           int not null default 0,
    primary key (competition_id, trip_id)
);

create table if not exists battle_passes (
    id           uuid primary key default gen_random_uuid(),
    name         text not null,
    price_cents  int not null default 0,
    perks        jsonb not null default '{}'::jsonb,
    active       boolean not null default true,
    created_at   timestamptz not null default now()
);

create table if not exists user_passes (
    id            uuid primary key default gen_random_uuid(),
    user_id       uuid not null references users(id) on delete cascade,
    pass_id       uuid not null references battle_passes(id) on delete cascade,
    purchased_at  timestamptz not null default now(),
    expires_at    timestamptz,
    unique (user_id, pass_id)
);

-- Admin override user is seeded by the backend on startup (store._seed),
-- so no plaintext credential lives in this file.
