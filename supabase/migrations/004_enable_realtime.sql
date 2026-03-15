-- Enable Supabase Realtime on sync tables so changes are broadcast via WebSocket
-- Run this in your Supabase Dashboard → SQL Editor
-- Safe to re-run: skips tables already in the publication

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'entries'
  ) then
    alter publication supabase_realtime add table public.entries;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'quick_notes'
  ) then
    alter publication supabase_realtime add table public.quick_notes;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;
end $$;
