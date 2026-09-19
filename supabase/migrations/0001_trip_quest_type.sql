-- Migration: add quest_type to trips (solo vs together mission mix).
-- Safe to run on an existing database. Paste into the Supabase SQL editor.
--
-- The backend tolerates this column being absent (quest type just isn't
-- persisted until you run this), so there's no downtime — run it when ready.

alter table trips
    add column if not exists quest_type text
    check (quest_type in ('solo', 'together'));
