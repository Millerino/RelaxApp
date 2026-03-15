-- Enable Supabase Realtime on sync tables so changes are broadcast via WebSocket
-- Run this in your Supabase Dashboard → SQL Editor

alter publication supabase_realtime add table public.entries;
alter publication supabase_realtime add table public.quick_notes;
alter publication supabase_realtime add table public.profiles;
