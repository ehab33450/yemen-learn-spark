
-- 1. Add preferred_track + welcomed_at to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS preferred_track text,
  ADD COLUMN IF NOT EXISTS welcomed_at timestamptz;

-- 2. Drop old enrollments/course_progress (text-based) - we'll recreate with proper structure
DROP TABLE IF EXISTS public.course_progress CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;

-- 3. Tracks
CREATE TABLE public.tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  description text,
  emoji text,
  color text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Courses
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  level text,
  duration text,
  emoji text,
  cover_url text,
  learning_plan jsonb,
  outcomes jsonb,
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Modules
CREATE TABLE public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Lessons
CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  youtube_id text,
  text_content text,
  example_text text,
  extra_links jsonb,
  duration_minutes int,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Lesson quizzes
CREATE TABLE public.lesson_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_index int NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

-- 8. Lesson progress (per user per lesson)
CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  watched boolean NOT NULL DEFAULT false,
  read boolean NOT NULL DEFAULT false,
  reviewed boolean NOT NULL DEFAULT false,
  applied boolean NOT NULL DEFAULT false,
  quiz_score int,
  mastery_percent int NOT NULL DEFAULT 0,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- 9. Certificates
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('course','track')),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  track_id uuid REFERENCES public.tracks(id) ON DELETE CASCADE,
  issued_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, kind, course_id, track_id)
);

-- Enable RLS
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Public read for content
CREATE POLICY "Tracks readable by all" ON public.tracks FOR SELECT USING (true);
CREATE POLICY "Courses readable by all" ON public.courses FOR SELECT USING (is_published = true);
CREATE POLICY "Modules readable by all" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Lessons readable by all" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Quizzes readable by all" ON public.lesson_quizzes FOR SELECT USING (true);

-- Admin manage content
CREATE POLICY "Admins manage tracks" ON public.tracks FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage courses" ON public.courses FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage modules" ON public.modules FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage lessons" ON public.lessons FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage quizzes" ON public.lesson_quizzes FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- User progress policies
CREATE POLICY "Users view own progress" ON public.lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON public.lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON public.lesson_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own progress" ON public.lesson_progress FOR DELETE USING (auth.uid() = user_id);

-- Certificates policies
CREATE POLICY "Users view own certs" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own certs" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_courses_track ON public.courses(track_id);
CREATE INDEX idx_modules_course ON public.modules(course_id);
CREATE INDEX idx_lessons_module ON public.lessons(module_id);
CREATE INDEX idx_quizzes_lesson ON public.lesson_quizzes(lesson_id);
CREATE INDEX idx_progress_user_course ON public.lesson_progress(user_id, course_id);
CREATE INDEX idx_certs_user ON public.certificates(user_id);

-- Trigger for lesson_progress.updated_at
CREATE TRIGGER trg_lesson_progress_updated
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
