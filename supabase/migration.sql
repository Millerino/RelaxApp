-- RelaxApp Data Sync Migration
-- This migration adds sync tables to your existing Supabase setup
-- Run this in Supabase SQL Editor

-- Enable UUID extension (likely already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ADD COLUMNS TO EXISTING PROFILES TABLE
-- ============================================================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS birthday DATE,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say')),
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS wellness_goals TEXT[],
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"dailyReminder": true, "weeklyInsights": false}'::jsonb,
ADD COLUMN IF NOT EXISTS tracked_feelings TEXT[],
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS first_entry_date DATE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================================
-- DAY ENTRIES TABLE (mood journal entries)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5) NOT NULL,
  emotions TEXT[] DEFAULT '{}',
  reflection TEXT DEFAULT '',
  gratitude TEXT DEFAULT '',
  activities TEXT[] DEFAULT '{}',
  feeling_levels JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ============================================================================
-- GOALS TABLE (daily goals linked to entries)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  entry_id UUID REFERENCES public.entries(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- QUICK NOTES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.quick_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  emoji TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- HABITS TABLE (daily habit tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  water_current INTEGER DEFAULT 0,
  water_goal INTEGER DEFAULT 2000,
  water_completed BOOLEAN DEFAULT FALSE,
  meditate_minutes INTEGER DEFAULT 0,
  meditate_completed BOOLEAN DEFAULT FALSE,
  sleep_hours NUMERIC(3,1) DEFAULT 0,
  sleep_quality TEXT CHECK (sleep_quality IN ('poor', 'okay', 'great')),
  sleep_completed BOOLEAN DEFAULT FALSE,
  detox_active BOOLEAN DEFAULT FALSE,
  detox_start_time TIMESTAMPTZ,
  detox_completed BOOLEAN DEFAULT FALSE,
  detox_successful BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON public.entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_user_date ON public.entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_entries_updated_at ON public.entries(updated_at);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_entry_id ON public.goals(entry_id);
CREATE INDEX IF NOT EXISTS idx_goals_date ON public.goals(user_id, date);

CREATE INDEX IF NOT EXISTS idx_quick_notes_user_id ON public.quick_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_notes_date ON public.quick_notes(user_id, date);

CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_date ON public.habits(user_id, date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- Entries policies
CREATE POLICY "Users can view own entries" ON public.entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own entries" ON public.entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own entries" ON public.entries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own entries" ON public.entries
  FOR DELETE USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON public.goals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.goals
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.goals
  FOR DELETE USING (auth.uid() = user_id);

-- Quick Notes policies
CREATE POLICY "Users can view own quick notes" ON public.quick_notes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quick notes" ON public.quick_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quick notes" ON public.quick_notes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own quick notes" ON public.quick_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Habits policies
CREATE POLICY "Users can view own habits" ON public.habits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON public.habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON public.habits
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON public.habits
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entries_updated_at
  BEFORE UPDATE ON public.entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quick_notes_updated_at
  BEFORE UPDATE ON public.quick_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ENABLE REALTIME (run these separately if they fail)
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quick_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habits;
