-- 01_schema.sql
-- Supersase: memory_events table for autosave events
create extension if not exists pgcrypto;
create table if not exists public.memory_events (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  path text not null,            -- logical path or doc identifier
  content jsonb not null,        -- saved payload
  meta jsonb,                    -- optional metadata (lang, page, tags, etc.)
  created_at timestamptz not null default now()
);
alter table public.memory_events enable row level security;