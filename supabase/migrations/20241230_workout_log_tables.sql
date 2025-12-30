-- ============================================
-- WORKOUT LOG - DATABASE SCHEMA
-- ============================================
-- Comprehensive workout logging system with exercises,
-- sessions, sets, programs, and personal records.

-- ============================================
-- 1. EXERCISES TABLE (Master Library)
-- ============================================
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_en TEXT, -- English name for reference
    description TEXT,
    instructions TEXT,
    image_url TEXT,
    video_url TEXT,
    
    -- Categorization
    muscle_group TEXT NOT NULL, -- Primary muscle group
    secondary_muscles TEXT[], -- Array of secondary muscles
    equipment TEXT NOT NULL DEFAULT 'kroppsvikt', -- barbell, dumbbell, cable, machine, kroppsvikt, etc.
    category TEXT NOT NULL DEFAULT 'strength', -- strength, cardio, flexibility, olympic
    
    -- Metadata
    is_system BOOLEAN DEFAULT TRUE, -- System exercise vs user-created
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_compound BOOLEAN DEFAULT FALSE, -- Multi-joint exercise
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. WORKOUT SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Session info
    name TEXT, -- Optional custom name
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER, -- Calculated on completion
    
    -- Session state
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    notes TEXT,
    
    -- Optional: linked to a program (FK added after workout_programs table exists)
    program_id UUID,
    program_day_id UUID,
    
    -- Stats (calculated on completion)
    total_volume NUMERIC(10,2) DEFAULT 0, -- Total kg lifted
    total_sets INTEGER DEFAULT 0,
    total_reps INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. WORKOUT EXERCISES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
    
    -- Order and grouping
    order_index INTEGER NOT NULL DEFAULT 0,
    superset_group UUID, -- NULL if not in superset, same UUID groups superset exercises
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. WORKOUT SETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.workout_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_exercise_id UUID NOT NULL REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
    
    -- Set data
    set_number INTEGER NOT NULL DEFAULT 1,
    weight NUMERIC(6,2), -- kg
    reps INTEGER,
    duration_seconds INTEGER, -- For timed exercises
    distance_meters NUMERIC(10,2), -- For cardio
    
    -- Set type
    set_type TEXT DEFAULT 'normal' CHECK (set_type IN (
        'normal', 'warmup', 'dropset', 'failure', 'amrap', 'rest_pause'
    )),
    
    -- Performance tracking
    rpe NUMERIC(3,1), -- Rate of Perceived Exertion (1-10)
    rir INTEGER, -- Reps In Reserve (0-5)
    
    -- Flags
    is_pr BOOLEAN DEFAULT FALSE, -- Personal record flag
    completed BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. USER EXERCISE STATS TABLE (Cached PRs)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_exercise_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    
    -- Personal Records by rep count
    pr_1rm NUMERIC(6,2), -- 1 rep max
    pr_1rm_date DATE,
    pr_3rm NUMERIC(6,2), -- 3 rep max
    pr_3rm_date DATE,
    pr_5rm NUMERIC(6,2), -- 5 rep max
    pr_5rm_date DATE,
    pr_8rm NUMERIC(6,2), -- 8 rep max
    pr_8rm_date DATE,
    pr_10rm NUMERIC(6,2), -- 10 rep max
    pr_10rm_date DATE,
    pr_12rm NUMERIC(6,2), -- 12 rep max
    pr_12rm_date DATE,
    
    -- Volume PRs
    pr_volume_session NUMERIC(10,2), -- Best single session volume
    pr_volume_session_date DATE,
    
    -- Totals
    total_volume NUMERIC(12,2) DEFAULT 0, -- Lifetime volume
    total_sets INTEGER DEFAULT 0,
    total_reps INTEGER DEFAULT 0,
    last_performed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, exercise_id)
);

-- ============================================
-- 6. WORKOUT PROGRAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.workout_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic info
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    
    -- Categorization
    difficulty TEXT DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    goal TEXT DEFAULT 'strength' CHECK (goal IN ('strength', 'hypertrophy', 'powerlifting', 'general', 'endurance')),
    days_per_week INTEGER DEFAULT 3,
    duration_weeks INTEGER, -- NULL = ongoing
    
    -- Ownership
    is_system BOOLEAN DEFAULT TRUE, -- System vs user-created
    is_premium BOOLEAN DEFAULT FALSE, -- Requires premium
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint now that workout_programs exists
ALTER TABLE public.workout_sessions 
    ADD CONSTRAINT fk_workout_sessions_program 
    FOREIGN KEY (program_id) 
    REFERENCES public.workout_programs(id) 
    ON DELETE SET NULL;

-- ============================================
-- 7. PROGRAM DAYS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.program_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES public.workout_programs(id) ON DELETE CASCADE,
    
    -- Day info
    day_number INTEGER NOT NULL, -- 1, 2, 3... (order in program)
    name TEXT, -- e.g., "Dag A - Bröst & Triceps"
    description TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(program_id, day_number)
);

-- ============================================
-- 8. PROGRAM EXERCISES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.program_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_day_id UUID NOT NULL REFERENCES public.program_days(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
    
    -- Exercise prescription
    order_index INTEGER NOT NULL DEFAULT 0,
    sets INTEGER DEFAULT 3,
    reps_min INTEGER DEFAULT 8,
    reps_max INTEGER DEFAULT 12,
    rest_seconds INTEGER DEFAULT 90,
    
    -- Optional
    notes TEXT,
    superset_group UUID, -- For supersets in program
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. USER PROGRAMS TABLE (Subscriptions)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES public.workout_programs(id) ON DELETE CASCADE,
    
    -- Progress
    started_at TIMESTAMPTZ DEFAULT NOW(),
    current_week INTEGER DEFAULT 1,
    current_day INTEGER DEFAULT 1,
    completed_days INTEGER DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
    completed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, program_id)
);

-- ============================================
-- 10. USER GOALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Goal definition
    goal_type TEXT NOT NULL CHECK (goal_type IN (
        '1rm', 'volume_week', 'workouts_week', 'workouts_month', 'body_weight'
    )),
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE, -- For exercise-specific goals
    
    -- Target and progress
    target_value NUMERIC(10,2) NOT NULL,
    current_value NUMERIC(10,2) DEFAULT 0,
    unit TEXT, -- 'kg', 'workouts', etc.
    
    -- Deadline
    target_date DATE,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'abandoned')),
    achieved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON public.exercises(muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON public.exercises(equipment);
CREATE INDEX IF NOT EXISTS idx_exercises_is_system ON public.exercises(is_system);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_status ON public.workout_sessions(status);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_started_at ON public.workout_sessions(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_workout_exercises_session_id ON public.workout_exercises(session_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_workout_exercise_id ON public.workout_sets(workout_exercise_id);

CREATE INDEX IF NOT EXISTS idx_user_exercise_stats_user_exercise ON public.user_exercise_stats(user_id, exercise_id);

CREATE INDEX IF NOT EXISTS idx_workout_programs_is_system ON public.workout_programs(is_system);
CREATE INDEX IF NOT EXISTS idx_workout_programs_difficulty ON public.workout_programs(difficulty);

CREATE INDEX IF NOT EXISTS idx_user_programs_user_id ON public.user_programs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_programs_status ON public.user_programs(status);

CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON public.user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_status ON public.user_goals(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exercise_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- Exercises: Everyone can view system exercises, users can view their own
CREATE POLICY "Anyone can view system exercises"
    ON public.exercises FOR SELECT
    TO authenticated
    USING (is_system = TRUE OR created_by = auth.uid());

CREATE POLICY "Users can create their own exercises"
    ON public.exercises FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid() AND is_system = FALSE);

CREATE POLICY "Users can update their own exercises"
    ON public.exercises FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid() AND is_system = FALSE);

CREATE POLICY "Users can delete their own exercises"
    ON public.exercises FOR DELETE
    TO authenticated
    USING (created_by = auth.uid() AND is_system = FALSE);

-- Workout Sessions: Users can CRUD their own sessions
CREATE POLICY "Users can view own workout sessions"
    ON public.workout_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create workout sessions"
    ON public.workout_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout sessions"
    ON public.workout_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout sessions"
    ON public.workout_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Workout Exercises: Access through session ownership
CREATE POLICY "Users can view own workout exercises"
    ON public.workout_exercises FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.workout_sessions ws
        WHERE ws.id = workout_exercises.session_id AND ws.user_id = auth.uid()
    ));

CREATE POLICY "Users can create workout exercises"
    ON public.workout_exercises FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.workout_sessions ws
        WHERE ws.id = workout_exercises.session_id AND ws.user_id = auth.uid()
    ));

CREATE POLICY "Users can update own workout exercises"
    ON public.workout_exercises FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.workout_sessions ws
        WHERE ws.id = workout_exercises.session_id AND ws.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own workout exercises"
    ON public.workout_exercises FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.workout_sessions ws
        WHERE ws.id = workout_exercises.session_id AND ws.user_id = auth.uid()
    ));

-- Workout Sets: Access through session ownership
CREATE POLICY "Users can view own workout sets"
    ON public.workout_sets FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.workout_exercises we
        JOIN public.workout_sessions ws ON ws.id = we.session_id
        WHERE we.id = workout_sets.workout_exercise_id AND ws.user_id = auth.uid()
    ));

CREATE POLICY "Users can create workout sets"
    ON public.workout_sets FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.workout_exercises we
        JOIN public.workout_sessions ws ON ws.id = we.session_id
        WHERE we.id = workout_sets.workout_exercise_id AND ws.user_id = auth.uid()
    ));

CREATE POLICY "Users can update own workout sets"
    ON public.workout_sets FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.workout_exercises we
        JOIN public.workout_sessions ws ON ws.id = we.session_id
        WHERE we.id = workout_sets.workout_exercise_id AND ws.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own workout sets"
    ON public.workout_sets FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.workout_exercises we
        JOIN public.workout_sessions ws ON ws.id = we.session_id
        WHERE we.id = workout_sets.workout_exercise_id AND ws.user_id = auth.uid()
    ));

-- User Exercise Stats: Users can view/manage their own
CREATE POLICY "Users can view own exercise stats"
    ON public.user_exercise_stats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise stats"
    ON public.user_exercise_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise stats"
    ON public.user_exercise_stats FOR UPDATE
    USING (auth.uid() = user_id);

-- Workout Programs: Everyone can view system programs
CREATE POLICY "Anyone can view system programs"
    ON public.workout_programs FOR SELECT
    TO authenticated
    USING (is_system = TRUE OR created_by = auth.uid());

CREATE POLICY "Users can create their own programs"
    ON public.workout_programs FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid() AND is_system = FALSE);

CREATE POLICY "Users can update their own programs"
    ON public.workout_programs FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid() AND is_system = FALSE);

CREATE POLICY "Users can delete their own programs"
    ON public.workout_programs FOR DELETE
    TO authenticated
    USING (created_by = auth.uid() AND is_system = FALSE);

-- Program Days: Access through program ownership
CREATE POLICY "Anyone can view program days for visible programs"
    ON public.program_days FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.workout_programs wp
        WHERE wp.id = program_days.program_id
        AND (wp.is_system = TRUE OR wp.created_by = auth.uid())
    ));

-- Program Exercises: Access through program ownership
CREATE POLICY "Anyone can view program exercises for visible programs"
    ON public.program_exercises FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.program_days pd
        JOIN public.workout_programs wp ON wp.id = pd.program_id
        WHERE pd.id = program_exercises.program_day_id
        AND (wp.is_system = TRUE OR wp.created_by = auth.uid())
    ));

-- User Programs: Users can manage their own subscriptions
CREATE POLICY "Users can view own program subscriptions"
    ON public.user_programs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can subscribe to programs"
    ON public.user_programs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own program subscriptions"
    ON public.user_programs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can unsubscribe from programs"
    ON public.user_programs FOR DELETE
    USING (auth.uid() = user_id);

-- User Goals: Users can manage their own goals
CREATE POLICY "Users can view own goals"
    ON public.user_goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals"
    ON public.user_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
    ON public.user_goals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
    ON public.user_goals FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_exercises_updated_at
    BEFORE UPDATE ON public.exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at
    BEFORE UPDATE ON public.workout_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_exercise_stats_updated_at
    BEFORE UPDATE ON public.user_exercise_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_programs_updated_at
    BEFORE UPDATE ON public.workout_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_programs_updated_at
    BEFORE UPDATE ON public.user_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_goals_updated_at
    BEFORE UPDATE ON public.user_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA - EXERCISES (Swedish)
-- ============================================

INSERT INTO public.exercises (name, name_en, muscle_group, secondary_muscles, equipment, category, is_compound, description) VALUES
-- BRÖST (Chest)
('Bänkpress', 'Bench Press', 'bröst', ARRAY['triceps', 'axlar'], 'skivstång', 'strength', TRUE, 'Ligg på bänken med fötterna i golvet. Sänk stången kontrollerat till bröstet och tryck upp.'),
('Hantelpress', 'Dumbbell Press', 'bröst', ARRAY['triceps', 'axlar'], 'hantlar', 'strength', TRUE, 'Ligg på bänken med en hantel i varje hand. Tryck upp och för ihop hantlarna i toppen.'),
('Lutande bänkpress', 'Incline Bench Press', 'bröst', ARRAY['triceps', 'axlar'], 'skivstång', 'strength', TRUE, 'Utför bänkpress på en lutande bänk (30-45 grader) för att aktivera övre bröstmuskeln.'),
('Kabelflyes', 'Cable Flyes', 'bröst', ARRAY['axlar'], 'kabel', 'strength', FALSE, 'Stå mellan två kablar. För armarna framåt i en bågrörelse tills händerna möts framför kroppen.'),
('Dips', 'Dips', 'bröst', ARRAY['triceps', 'axlar'], 'kroppsvikt', 'strength', TRUE, 'Luta kroppen framåt och sänk dig kontrollerat. Tryck upp till startpositionen.'),
('Armhävningar', 'Push-ups', 'bröst', ARRAY['triceps', 'axlar'], 'kroppsvikt', 'strength', TRUE, 'Klassisk övning med händerna axelbrett isär. Sänk bröstet mot golvet och tryck upp.'),

-- RYGG (Back)
('Marklyft', 'Deadlift', 'rygg', ARRAY['ben', 'core'], 'skivstång', 'strength', TRUE, 'Stå med fötterna höftbrett. Grip stången och lyft genom att sträcka höfter och knän samtidigt.'),
('Latsdrag', 'Lat Pulldown', 'rygg', ARRAY['biceps', 'axlar'], 'kabel', 'strength', TRUE, 'Sitt i maskinen och dra stången ner till bröstet medan du trycker ihop skulderbladen.'),
('Rodd med skivstång', 'Barbell Row', 'rygg', ARRAY['biceps', 'bakre axlar'], 'skivstång', 'strength', TRUE, 'Böj dig framåt med rak rygg. Dra stången mot magen och sänk kontrollerat.'),
('Sittande rodd', 'Seated Cable Row', 'rygg', ARRAY['biceps', 'bakre axlar'], 'kabel', 'strength', TRUE, 'Sitt med rak rygg och dra handtaget mot magen. Tryck ihop skulderbladen i slutpositionen.'),
('Chins', 'Pull-ups', 'rygg', ARRAY['biceps'], 'kroppsvikt', 'strength', TRUE, 'Häng i en stång med underhandsgrepp. Dra dig upp tills hakan är över stången.'),
('Hantelrodd', 'Dumbbell Row', 'rygg', ARRAY['biceps', 'bakre axlar'], 'hantlar', 'strength', TRUE, 'Stöd en hand och ett knä på bänken. Dra hanteln upp mot höften.'),

-- BEN (Legs)
('Knäböj', 'Squat', 'ben', ARRAY['core', 'rygg'], 'skivstång', 'strength', TRUE, 'Stå med stången på övre ryggen. Sänk höfterna bakåt och ner tills låren är parallella med golvet.'),
('Benspark', 'Leg Extension', 'ben', NULL, 'maskin', 'strength', FALSE, 'Sitt i maskinen och sträck benen framåt mot full extension. Sänk kontrollerat.'),
('Bencurl', 'Leg Curl', 'ben', NULL, 'maskin', 'strength', FALSE, 'Ligg på mage i maskinen och böj benen mot rumpan. Sänk kontrollerat.'),
('Benpress', 'Leg Press', 'ben', ARRAY['core'], 'maskin', 'strength', TRUE, 'Placera fötterna på plattan och tryck ifrån. Böj knäna till 90 grader och tryck tillbaka.'),
('Utfallssteg', 'Lunges', 'ben', ARRAY['core'], 'kroppsvikt', 'strength', TRUE, 'Ta ett långt steg framåt och sänk bakre knäet mot golvet. Tryck tillbaka till start.'),
('Rumänsk marklyft', 'Romanian Deadlift', 'ben', ARRAY['rygg', 'core'], 'skivstång', 'strength', TRUE, 'Håll stången framför låren. Böj i höften med nästan raka ben tills du känner stretch i bakre låren.'),

-- AXLAR (Shoulders)
('Militärpress', 'Overhead Press', 'axlar', ARRAY['triceps', 'core'], 'skivstång', 'strength', TRUE, 'Stå med stången framför axlarna. Tryck rakt upp över huvudet och sänk kontrollerat.'),
('Sidolyft', 'Lateral Raise', 'axlar', NULL, 'hantlar', 'strength', FALSE, 'Stå med hantlar längs sidorna. Lyft armarna ut åt sidorna till axelhöjd.'),
('Framlyfting', 'Front Raise', 'axlar', NULL, 'hantlar', 'strength', FALSE, 'Stå med hantlar framför kroppen. Lyft en arm i taget rakt framåt till axelhöjd.'),
('Face pulls', 'Face Pulls', 'axlar', ARRAY['bakre axlar', 'övre rygg'], 'kabel', 'strength', FALSE, 'Dra repet mot ansiktet medan du roterar ut armarna. Fokusera på bakre axlarna.'),
('Arnold press', 'Arnold Press', 'axlar', ARRAY['triceps'], 'hantlar', 'strength', TRUE, 'Börja med hantlarna framför axlarna med handflatorna mot dig. Rotera ut och tryck upp.'),

-- BICEPS
('Bicepscurl med skivstång', 'Barbell Curl', 'biceps', ARRAY['underarmar'], 'skivstång', 'strength', FALSE, 'Stå med stången i raka armar. Curl upp mot axlarna med kontrollerad rörelse.'),
('Hammarcurl', 'Hammer Curl', 'biceps', ARRAY['underarmar'], 'hantlar', 'strength', FALSE, 'Stå med hantlar, tummar uppåt. Curl upp utan att vrida handlederna.'),
('Koncentrationscurl', 'Concentration Curl', 'biceps', NULL, 'hantlar', 'strength', FALSE, 'Sitt med armbågen mot insidan av låret. Curl hanteln upp mot axeln.'),
('Kabelcurl', 'Cable Curl', 'biceps', NULL, 'kabel', 'strength', FALSE, 'Stå framför kabelmaskinen med rakt handtag. Curl upp med armbågarna stilla.'),

-- TRICEPS
('Triceps pushdown', 'Triceps Pushdown', 'triceps', NULL, 'kabel', 'strength', FALSE, 'Stå framför kabelmaskinen. Tryck ner handtaget med armbågarna tätt mot kroppen.'),
('Skullcrushers', 'Skull Crushers', 'triceps', NULL, 'skivstång', 'strength', FALSE, 'Ligg på bänken med stången rakt upp. Sänk mot pannan genom att böja armbågarna.'),
('Triceps dips', 'Triceps Dips', 'triceps', ARRAY['bröst', 'axlar'], 'kroppsvikt', 'strength', TRUE, 'Håll kroppen upprätt under rörelsen för att fokusera på triceps.'),
('Overhead triceps extension', 'Overhead Extension', 'triceps', NULL, 'hantlar', 'strength', FALSE, 'Håll en hantel med båda händerna bakom huvudet. Sträck armarna uppåt.'),

-- CORE
('Plankan', 'Plank', 'core', NULL, 'kroppsvikt', 'strength', FALSE, 'Håll kroppen rak på underarmarna och tårna. Spänn magen och håll positionen.'),
('Crunches', 'Crunches', 'core', NULL, 'kroppsvikt', 'strength', FALSE, 'Ligg på rygg med böjda knän. Lyft överkroppen mot knäna genom att spänna magen.'),
('Hängande benlyft', 'Hanging Leg Raise', 'core', NULL, 'kroppsvikt', 'strength', FALSE, 'Häng i en stång och lyft raka eller böjda ben uppåt mot bröstet.'),
('Russian twists', 'Russian Twists', 'core', ARRAY['sneda magmuskler'], 'kroppsvikt', 'strength', FALSE, 'Sitt med böjda knän, fötter från golvet. Rotera överkroppen sida till sida.'),
('Cable woodchops', 'Cable Woodchops', 'core', ARRAY['sneda magmuskler'], 'kabel', 'strength', FALSE, 'Dra kabeln diagonalt från högt till lågt med rotation i bålen.'),

-- CARDIO
('Löpning', 'Running', 'cardio', ARRAY['ben', 'core'], 'inget', 'cardio', TRUE, 'Steady state eller intervallöpning för kondition.'),
('Cykling', 'Cycling', 'cardio', ARRAY['ben'], 'cykel', 'cardio', TRUE, 'Indoor eller outdoor cykling för kondition.'),
('Roddmaskin', 'Rowing Machine', 'cardio', ARRAY['rygg', 'ben', 'core'], 'maskin', 'cardio', TRUE, 'Helkroppsövning som kombinerar kondition och styrka.'),
('Hopprep', 'Jump Rope', 'cardio', ARRAY['ben', 'axlar'], 'hopprep', 'cardio', TRUE, 'Effektiv konditionsträning som även förbättrar koordination.')

ON CONFLICT DO NOTHING;

-- ============================================
-- SEED DATA - BEGINNER PROGRAMS (Swedish)
-- ============================================

-- Create a basic 3-day program
INSERT INTO public.workout_programs (id, name, description, difficulty, goal, days_per_week, duration_weeks, is_system, is_premium)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Nybörjarprogram - Helkropp',
    'Ett enkelt helkroppsprogram för nybörjare. Träna 3 dagar i veckan med vila mellan passen.',
    'beginner',
    'general',
    3,
    8,
    TRUE,
    FALSE
) ON CONFLICT DO NOTHING;

INSERT INTO public.workout_programs (id, name, description, difficulty, goal, days_per_week, duration_weeks, is_system, is_premium)
VALUES (
    'a0000000-0000-0000-0000-000000000002',
    'Styrkebyggaren',
    'Fokuserat styrkeprogram med de stora lyften. Perfekt för den som vill bli starkare.',
    'intermediate',
    'strength',
    4,
    12,
    TRUE,
    FALSE
) ON CONFLICT DO NOTHING;

INSERT INTO public.workout_programs (id, name, description, difficulty, goal, days_per_week, duration_weeks, is_system, is_premium)
VALUES (
    'a0000000-0000-0000-0000-000000000003',
    'Muskelväxt - Push/Pull/Legs',
    'Klassiskt PPL-program för maximal muskelväxt. 6 dagar i veckan för optimala resultat.',
    'intermediate',
    'hypertrophy',
    6,
    NULL,
    TRUE,
    TRUE
) ON CONFLICT DO NOTHING;
