-- Add missing profile fields so they sync to Supabase across devices
-- Run this in your Supabase Dashboard → SQL Editor

alter table public.profiles
  add column if not exists birthday date,
  add column if not exists gender text,
  add column if not exists country text,
  add column if not exists timezone text;
