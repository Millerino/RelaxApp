-- RelaxApp Full Sync Database Schema
-- Run this in Supabase SQL Editor to set up all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  birthday DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say')),
  country TEXT,
  timezone TEXT,
  avatar TEXT,
  wellness_goals TEXT[], -- Array of wellness goal IDs
  notification_preferences JSONB DEFAULT '{"dailyReminder": true, "weeklyInsights": false}'::jsonb,
  tracked_feelings TEXT[],
  is_premium BOOLEAN DEFAULT FALSE,
  xp INTEGER DEFAULT 0,
  first_entry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
  feeling_levels JSONB DEFAULT '[]'::jsonb, -- Array of {name, value} objects
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure one entry per user per day
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
  -- One habit record per user per day
  UNIQUE(user_id, date)
);

-- ============================================================================
-- SYNC METADATA TABLE (for tracking sync state)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sync_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  sync_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
CREATE INDEX IF NOT EXISTS idx_quick_notes_updated_at ON public.quick_notes(updated_at);

CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_date ON public.habits(user_id, date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_metadata ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Entries: Users can only access their own entries
CREATE POLICY "Users can view own entries" ON public.entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries" ON public.entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries" ON public.entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries" ON public.entries
  FOR DELETE USING (auth.uid() = user_id);

-- Goals: Users can only access their own goals
CREATE POLICY "Users can view own goals" ON public.goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.goals
  FOR DELETE USING (auth.uid() = user_id);

-- Quick Notes: Users can only access their own notes
CREATE POLICY "Users can view own quick notes" ON public.quick_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quick notes" ON public.quick_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quick notes" ON public.quick_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quick notes" ON public.quick_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Habits: Users can only access their own habits
CREATE POLICY "Users can view own habits" ON public.habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits" ON public.habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits" ON public.habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits" ON public.habits
  FOR DELETE USING (auth.uid() = user_id);

-- Sync Metadata: Users can only access their own sync data
CREATE POLICY "Users can view own sync metadata" ON public.sync_metadata
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync metadata" ON public.sync_metadata
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync metadata" ON public.sync_metadata
  FOR UPDATE USING (auth.uid() = user_id);

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

-- Apply trigger to all tables
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

CREATE TRIGGER update_sync_metadata_updated_at
  BEFORE UPDATE ON public.sync_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: Auto-create profile on user signup
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================================
-- Enable realtime for sync-critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quick_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- ============================================================================
-- HELPER FUNCTION: Get user's full data for initial sync
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_full_data(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'profile', (SELECT row_to_json(p) FROM public.profiles p WHERE p.id = p_user_id),
    'entries', (SELECT COALESCE(json_agg(row_to_json(e)), '[]'::json) FROM public.entries e WHERE e.user_id = p_user_id),
    'goals', (SELECT COALESCE(json_agg(row_to_json(g)), '[]'::json) FROM public.goals g WHERE g.user_id = p_user_id),
    'quick_notes', (SELECT COALESCE(json_agg(row_to_json(q)), '[]'::json) FROM public.quick_notes q WHERE q.user_id = p_user_id),
    'habits', (SELECT COALESCE(json_agg(row_to_json(h)), '[]'::json) FROM public.habits h WHERE h.user_id = p_user_id)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Get changes since last sync
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_changes_since(p_user_id UUID, p_since TIMESTAMPTZ)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'profile', (SELECT row_to_json(p) FROM public.profiles p WHERE p.id = p_user_id AND p.updated_at > p_since),
    'entries', (SELECT COALESCE(json_agg(row_to_json(e)), '[]'::json) FROM public.entries e WHERE e.user_id = p_user_id AND e.updated_at > p_since),
    'goals', (SELECT COALESCE(json_agg(row_to_json(g)), '[]'::json) FROM public.goals g WHERE g.user_id = p_user_id AND g.updated_at > p_since),
    'quick_notes', (SELECT COALESCE(json_agg(row_to_json(q)), '[]'::json) FROM public.quick_notes q WHERE q.user_id = p_user_id AND q.updated_at > p_since),
    'habits', (SELECT COALESCE(json_agg(row_to_json(h)), '[]'::json) FROM public.habits h WHERE h.user_id = p_user_id AND h.updated_at > p_since)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
