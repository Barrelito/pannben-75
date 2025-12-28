-- ============================================
-- PANNBEN 75 - DATABASE SCHEMA
-- ============================================
-- This schema supports a 75-day mental toughness challenge
-- with morning check-ins, 5 daily rules, and planning features.

-- ============================================
-- TABLES
-- ============================================

-- 1. PROFILES TABLE
-- Links to auth.users and stores user-specific challenge data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  start_date DATE,
  current_day INTEGER DEFAULT 0,
  recovery_status TEXT DEFAULT 'GREEN' CHECK (recovery_status IN ('GREEN', 'YELLOW', 'RED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DIET TRACKS TABLE
-- Preset diet options for users to follow
CREATE TABLE IF NOT EXISTS public.diet_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  rules JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WORKOUT TRACKS TABLE
-- Preset workout program templates
CREATE TABLE IF NOT EXISTS public.workout_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  structure JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DAILY LOGS TABLE
-- The core challenge tracking table
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  
  -- Morning Check-in (5 Health Scores: 1-10)
  sleep_score INTEGER CHECK (sleep_score >= 1 AND sleep_score <= 10),
  body_score INTEGER CHECK (body_score >= 1 AND body_score <= 10),
  energy_score INTEGER CHECK (energy_score >= 1 AND energy_score <= 10),
  stress_score INTEGER CHECK (stress_score >= 1 AND stress_score <= 10),
  motivation_score INTEGER CHECK (motivation_score >= 1 AND motivation_score <= 10),
  
  -- The 5 Rules
  diet_completed BOOLEAN DEFAULT FALSE,
  water_intake NUMERIC(4,1) DEFAULT 0, -- Liters (e.g., 2.5)
  workout_outdoor_completed BOOLEAN DEFAULT FALSE,
  workout_indoor_completed BOOLEAN DEFAULT FALSE,
  reading_completed BOOLEAN DEFAULT FALSE,
  photo_uploaded BOOLEAN DEFAULT FALSE,
  
  -- The Night Watch (Planning for Tomorrow)
  plan_workout_1 TEXT,
  plan_workout_2 TEXT,
  plan_diet TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate logs for the same day
  UNIQUE(user_id, log_date)
);

-- 5. SQUADS TABLE
-- Team/community feature
CREATE TABLE IF NOT EXISTS public.squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SQUAD MEMBERS TABLE
-- Squad membership tracking
CREATE TABLE IF NOT EXISTS public.squad_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One user per squad
  UNIQUE(squad_id, user_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_squad_members_squad ON public.squad_members(squad_id);
CREATE INDEX IF NOT EXISTS idx_squad_members_user ON public.squad_members(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Diet Tracks: Public read access (preset diets)
CREATE POLICY "Anyone can view diet tracks"
  ON public.diet_tracks FOR SELECT
  TO authenticated
  USING (true);

-- Workout Tracks: Public read access (preset workouts)
CREATE POLICY "Anyone can view workout tracks"
  ON public.workout_tracks FOR SELECT
  TO authenticated
  USING (true);

-- Daily Logs: Users can CRUD their own logs
CREATE POLICY "Users can view own daily logs"
  ON public.daily_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily logs"
  ON public.daily_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily logs"
  ON public.daily_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily logs"
  ON public.daily_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Squads: Members can view, creator can manage
CREATE POLICY "Squad members can view their squads"
  ON public.squads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.squad_members
      WHERE squad_id = squads.id AND user_id = auth.uid()
    ) OR created_by = auth.uid()
  );

CREATE POLICY "Anyone can create squads"
  ON public.squads FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Squad creators can update their squads"
  ON public.squads FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Squad creators can delete their squads"
  ON public.squads FOR DELETE
  USING (auth.uid() = created_by);

-- Squad Members: Squad admins can manage, members can view
CREATE POLICY "Squad members can view squad membership"
  ON public.squad_members FOR SELECT
  USING (
    user_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM public.squads s
      WHERE s.id = squad_members.squad_id AND s.created_by = auth.uid()
    )
  );

CREATE POLICY "Squad admins can add members"
  ON public.squad_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.squad_members
      WHERE squad_id = squad_members.squad_id 
        AND user_id = auth.uid() 
        AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.squads
      WHERE id = squad_members.squad_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Squad admins can remove members"
  ON public.squad_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.squad_members sm
      WHERE sm.squad_id = squad_members.squad_id 
        AND sm.user_id = auth.uid() 
        AND sm.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.squads
      WHERE id = squad_members.squad_id AND created_by = auth.uid()
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_logs_updated_at
  BEFORE UPDATE ON public.daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SEED DATA - DIET TRACKS
-- ============================================

INSERT INTO public.diet_tracks (name, description, rules) VALUES
(
  'Strict Keto',
  'Ketogenic diet with minimal carbohydrate intake to induce ketosis.',
  '{
    "carbs_max_grams": 20,
    "focus": ["High fat", "Moderate protein", "Minimal carbs"],
    "avoid": ["Sugar", "Grains", "Most fruits", "Legumes"],
    "allowed": ["Meat", "Fish", "Eggs", "Cheese", "Low-carb vegetables", "Healthy fats"]
  }'::jsonb
),
(
  'LCHF',
  'Low Carb High Fat - A sustainable approach to low-carb eating with healthy fats.',
  '{
    "carbs_max_grams": 50,
    "focus": ["Healthy fats", "Quality protein", "Low carb vegetables"],
    "avoid": ["Sugar", "Refined carbs", "Processed foods"],
    "allowed": ["Meat", "Fish", "Eggs", "Dairy", "Nuts", "Seeds", "Vegetables", "Berries"]
  }'::jsonb
),
(
  'Paleo',
  'Hunter-gatherer diet focused on whole foods and eliminating processed foods.',
  '{
    "philosophy": "Eat like our ancestors",
    "focus": ["Whole foods", "Lean proteins", "Vegetables", "Fruits", "Nuts"],
    "avoid": ["Grains", "Legumes", "Dairy", "Processed foods", "Refined sugar"],
    "allowed": ["Meat", "Fish", "Eggs", "Vegetables", "Fruits", "Nuts", "Seeds"]
  }'::jsonb
),
(
  'Carnivore',
  'Animal-based diet consisting exclusively of meat and animal products.',
  '{
    "philosophy": "Zero carb, animal-based nutrition",
    "focus": ["Meat", "Fish", "Eggs", "Animal fats"],
    "avoid": ["All plant foods", "Grains", "Vegetables", "Fruits"],
    "allowed": ["Beef", "Pork", "Chicken", "Fish", "Eggs", "Organ meats", "Bone broth"]
  }'::jsonb
),
(
  'Mediterranean',
  'Balanced whole-food diet inspired by traditional Mediterranean cuisine.',
  '{
    "philosophy": "Balanced, sustainable eating",
    "focus": ["Whole grains", "Vegetables", "Fruits", "Fish", "Olive oil", "Legumes"],
    "moderate": ["Poultry", "Eggs", "Dairy", "Red wine"],
    "avoid": ["Processed foods", "Refined sugar", "Excessive red meat"],
    "allowed": ["Fish", "Vegetables", "Fruits", "Whole grains", "Olive oil", "Nuts", "Legumes"]
  }'::jsonb
),
(
  'Calorie Counting',
  'Flexible diet focused on caloric deficit for weight loss and body composition.',
  '{
    "philosophy": "Energy balance - calories in vs calories out",
    "focus": ["Caloric deficit", "Protein intake", "Tracking macros"],
    "strategy": ["Track all food", "Hit protein targets", "Maintain deficit"],
    "allowed": ["Any food that fits your macros"],
    "tips": ["Use food scale", "Track everything", "Prioritize protein"]
  }'::jsonb
)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the schema was created successfully:

-- Check all tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check diet tracks seeded
-- SELECT name FROM public.diet_tracks;

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
