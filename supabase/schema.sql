-- NeuroUI database schema
-- Run this in Supabase Dashboard → SQL Editor → New query → Run

-- ── generations table ─────────────────────────────────────────────────
create table if not exists public.generations (
  id          text primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  prompt      text not null,
  files       jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

-- Add user_id column if upgrading from earlier schema
alter table public.generations
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists generations_user_id_idx
  on public.generations (user_id, created_at desc);

create index if not exists generations_created_at_idx
  on public.generations (created_at desc);

-- ── Row Level Security ────────────────────────────────────────────────
alter table public.generations enable row level security;

-- Clean up any old open policies from previous setup
drop policy if exists "Anyone can read generations" on public.generations;
drop policy if exists "Anyone can insert generations" on public.generations;
drop policy if exists "Anyone can upsert generations" on public.generations;
drop policy if exists "Public read for share links" on public.generations;
drop policy if exists "Users can insert own generations" on public.generations;
drop policy if exists "Users can update own generations" on public.generations;
drop policy if exists "Users can delete own generations" on public.generations;

-- Anyone (signed-in or not) can read any generation via /g/[id] share links
create policy "Public read for share links"
  on public.generations for select
  using (true);

-- Only authenticated users can save their own generations
create policy "Users can insert own generations"
  on public.generations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own generations"
  on public.generations for update
  using (auth.uid() = user_id);

create policy "Users can delete own generations"
  on public.generations for delete
  using (auth.uid() = user_id);
