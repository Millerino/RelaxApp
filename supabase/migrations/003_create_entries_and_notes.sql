-- Entries table: stores journal entries so they sync across devices
-- Quick notes table: stores quick notes so they sync across devices
-- Run this in your Supabase Dashboard → SQL Editor

-- Journal entries
create table if not exists public.entries (
  id text not null,
  user_id uuid references auth.users on delete cascade not null,
  date text not null,
  mood smallint not null check (mood between 1 and 5),
  emotions text[] default '{}',
  reflection text default '',
  gratitude text default '',
  goals jsonb default '[]',
  activities text[] default '{}',
  feeling_levels jsonb default '[]',
  created_at bigint not null,
  updated_at timestamptz default now(),
  primary key (user_id, id)
);

-- One entry per user per date
create unique index if not exists entries_user_date_idx on public.entries (user_id, date);

-- Enable Row Level Security
alter table public.entries enable row level security;

create policy "Users can read own entries"
  on public.entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own entries"
  on public.entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own entries"
  on public.entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own entries"
  on public.entries for delete
  using (auth.uid() = user_id);

-- Quick notes
create table if not exists public.quick_notes (
  id text not null,
  user_id uuid references auth.users on delete cascade not null,
  text text not null,
  emoji text,
  date text not null,
  created_at bigint not null,
  updated_at timestamptz default now(),
  primary key (user_id, id)
);

alter table public.quick_notes enable row level security;

create policy "Users can read own quick notes"
  on public.quick_notes for select
  using (auth.uid() = user_id);

create policy "Users can insert own quick notes"
  on public.quick_notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own quick notes"
  on public.quick_notes for update
  using (auth.uid() = user_id);

create policy "Users can delete own quick notes"
  on public.quick_notes for delete
  using (auth.uid() = user_id);

-- XP tracking on profile
alter table public.profiles
  add column if not exists xp integer default 0,
  add column if not exists days_used integer default 0,
  add column if not exists first_used_at bigint;
