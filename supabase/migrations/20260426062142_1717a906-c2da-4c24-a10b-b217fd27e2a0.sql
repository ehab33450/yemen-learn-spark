
-- =========================
-- Weekly & Monthly Challenges
-- =========================
CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  lessons_target INTEGER NOT NULL DEFAULT 5,
  lessons_done INTEGER NOT NULL DEFAULT 0,
  xp_target INTEGER NOT NULL DEFAULT 100,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  streak_target INTEGER NOT NULL DEFAULT 5,
  streak_reached INTEGER NOT NULL DEFAULT 0,
  reward_xp INTEGER NOT NULL DEFAULT 50,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own weekly" ON public.weekly_challenges
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own weekly" ON public.weekly_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own weekly" ON public.weekly_challenges
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER trg_weekly_updated_at BEFORE UPDATE ON public.weekly_challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.monthly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  month_start DATE NOT NULL,
  courses_target INTEGER NOT NULL DEFAULT 1,
  courses_done INTEGER NOT NULL DEFAULT 0,
  xp_target INTEGER NOT NULL DEFAULT 500,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  reward_xp INTEGER NOT NULL DEFAULT 200,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_start)
);

ALTER TABLE public.monthly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own monthly" ON public.monthly_challenges
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own monthly" ON public.monthly_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own monthly" ON public.monthly_challenges
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER trg_monthly_updated_at BEFORE UPDATE ON public.monthly_challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================================================
-- Track user's level on group membership for bucketing
-- ===================================================
ALTER TABLE public.discussion_groups
  ADD COLUMN IF NOT EXISTS level_band INTEGER NOT NULL DEFAULT 1;

-- Helper: compute level band (1-10 -> 1, 11-20 -> 2, etc.)
CREATE OR REPLACE FUNCTION public.user_level_band(_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(1, ((COALESCE(level,1) - 1) / 5) + 1) FROM public.profiles WHERE user_id = _user_id LIMIT 1;
$$;

-- Replace join function to bucket by level band
CREATE OR REPLACE FUNCTION public.join_or_create_discussion_group(_user_id uuid, _course_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _existing UUID;
  _open UUID;
  _course_title TEXT;
  _new_id UUID;
  _idx INTEGER;
  _band INTEGER;
BEGIN
  -- Already in a group for this course?
  SELECT g.id INTO _existing
  FROM public.discussion_groups g
  JOIN public.group_members m ON m.group_id = g.id
  WHERE g.course_id = _course_id AND m.user_id = _user_id
  LIMIT 1;
  IF _existing IS NOT NULL THEN RETURN _existing; END IF;

  _band := public.user_level_band(_user_id);

  -- Find an open group with room AT THE SAME LEVEL BAND
  SELECT id INTO _open
  FROM public.discussion_groups
  WHERE course_id = _course_id
    AND level_band = _band
    AND member_count < capacity
  ORDER BY member_count DESC, created_at ASC
  LIMIT 1;

  IF _open IS NULL THEN
    SELECT title INTO _course_title FROM public.courses WHERE id = _course_id;
    SELECT COUNT(*) + 1 INTO _idx FROM public.discussion_groups WHERE course_id = _course_id AND level_band = _band;
    INSERT INTO public.discussion_groups(course_id, name, capacity, member_count, level_band)
    VALUES (_course_id, COALESCE(_course_title,'دورة') || ' — مستوى ' || _band || ' • مجموعة ' || _idx, 10, 0, _band)
    RETURNING id INTO _new_id;
    _open := _new_id;
  END IF;

  INSERT INTO public.group_members(group_id, user_id) VALUES (_open, _user_id)
  ON CONFLICT (group_id, user_id) DO NOTHING;
  UPDATE public.discussion_groups SET member_count = member_count + 1 WHERE id = _open;
  RETURN _open;
END;
$$;

-- =========================
-- Add more lessons (videos) to single-lesson courses
-- =========================

-- Time Management: add 2 lessons to existing module
DO $$
DECLARE _mod UUID;
BEGIN
  SELECT m.id INTO _mod FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id WHERE c.slug = 'time-management' ORDER BY m.sort_order LIMIT 1;
  IF _mod IS NOT NULL THEN
    INSERT INTO public.lessons(module_id, title, description, youtube_id, duration_minutes, sort_order)
    VALUES
    (_mod, 'مصفوفة أيزنهاور', 'كيف ترتب أولوياتك بطريقة عملية.', 'AKzwm1nYQ5Y', 10, 50),
    (_mod, 'تقنية بومودورو', 'ركّز 25 دقيقة، استرح 5، وكرّر.', 'lFjQH0t2KQE', 8, 60)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Computer basics: add 2
DO $$
DECLARE _mod UUID;
BEGIN
  SELECT m.id INTO _mod FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id WHERE c.slug = 'computer-basics' ORDER BY m.sort_order LIMIT 1;
  IF _mod IS NOT NULL THEN
    INSERT INTO public.lessons(module_id, title, description, youtube_id, duration_minutes, sort_order)
    VALUES
    (_mod, 'Microsoft Word للمبتدئين', 'أساسيات الكتابة والتنسيق في Word.', '0_yfKCbiwnA', 20, 50),
    (_mod, 'Microsoft Excel من الصفر', 'الجداول والمعادلات الأساسية.', 'gcd47vSwqLs', 25, 60)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Quran sciences: add 1
DO $$
DECLARE _mod UUID;
BEGIN
  SELECT m.id INTO _mod FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id WHERE c.slug = 'quran-sciences' ORDER BY m.sort_order LIMIT 1;
  IF _mod IS NOT NULL THEN
    INSERT INTO public.lessons(module_id, title, description, youtube_id, duration_minutes, sort_order)
    VALUES
    (_mod, 'أسباب نزول القرآن', 'مدخل لفهم سياق الآيات.', '4Y_2j5IvgL0', 15, 50)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Habits: add 1
DO $$
DECLARE _mod UUID;
BEGIN
  SELECT m.id INTO _mod FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id WHERE c.slug = 'habits' ORDER BY m.sort_order LIMIT 1;
  IF _mod IS NOT NULL THEN
    INSERT INTO public.lessons(module_id, title, description, youtube_id, duration_minutes, sort_order)
    VALUES
    (_mod, 'كيف تكسر العادات السيئة', 'خطوات عملية للتخلص من العادات السلبية.', 'PZ7lDrwYdZc', 12, 50)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Seerah: add 1
DO $$
DECLARE _mod UUID;
BEGIN
  SELECT m.id INTO _mod FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id WHERE c.slug = 'seerah' ORDER BY m.sort_order LIMIT 1;
  IF _mod IS NOT NULL THEN
    INSERT INTO public.lessons(module_id, title, description, youtube_id, duration_minutes, sort_order)
    VALUES
    (_mod, 'الهجرة النبوية ودروسها', 'أبرز الدروس من رحلة الهجرة.', 'oSZJVXOaQAI', 20, 50)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Communication: add 1
DO $$
DECLARE _mod UUID;
BEGIN
  SELECT m.id INTO _mod FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id WHERE c.slug = 'communication' ORDER BY m.sort_order LIMIT 1;
  IF _mod IS NOT NULL THEN
    INSERT INTO public.lessons(module_id, title, description, youtube_id, duration_minutes, sort_order)
    VALUES
    (_mod, 'فن الاستماع الفعّال', 'كيف تستمع لتفهم لا لتردّ.', 'saXfavo1OQo', 10, 50)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Canva: add 1
DO $$
DECLARE _mod UUID;
BEGIN
  SELECT m.id INTO _mod FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id WHERE c.slug = 'canva-design' ORDER BY m.sort_order LIMIT 1;
  IF _mod IS NOT NULL THEN
    INSERT INTO public.lessons(module_id, title, description, youtube_id, duration_minutes, sort_order)
    VALUES
    (_mod, 'تصميم منشور انستغرام احترافي', 'خطوات تصميم منشور جذاب.', 'WD7r1lMomjI', 15, 50)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Freelancing: add 1
DO $$
DECLARE _mod UUID;
BEGIN
  SELECT m.id INTO _mod FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id WHERE c.slug = 'freelancing' ORDER BY m.sort_order LIMIT 1;
  IF _mod IS NOT NULL THEN
    INSERT INTO public.lessons(module_id, title, description, youtube_id, duration_minutes, sort_order)
    VALUES
    (_mod, 'كيف تكتب عرضاً يفوز بالمشاريع', 'صياغة عروض احترافية على منصات العمل الحر.', 'k_jvK1ezZdU', 18, 50)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- English speaking: add 1
DO $$
DECLARE _mod UUID;
BEGIN
  SELECT m.id INTO _mod FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id WHERE c.slug = 'english-speaking' ORDER BY m.sort_order LIMIT 1;
  IF _mod IS NOT NULL THEN
    INSERT INTO public.lessons(module_id, title, description, youtube_id, duration_minutes, sort_order)
    VALUES
    (_mod, 'محادثات يومية بالإنجليزية', 'تعلّم جمل تستخدمها كل يوم.', 'bHv3CT3FfMQ', 18, 50)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- English intermediate: add 1
DO $$
DECLARE _mod UUID;
BEGIN
  SELECT m.id INTO _mod FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id WHERE c.slug = 'english-intermediate' ORDER BY m.sort_order LIMIT 1;
  IF _mod IS NOT NULL THEN
    INSERT INTO public.lessons(module_id, title, description, youtube_id, duration_minutes, sort_order)
    VALUES
    (_mod, 'الأزمنة في الإنجليزية', 'شرح مبسط لأهم الأزمنة.', 'YtcgSjwKM8s', 22, 50)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Fiqh basics: add 1
DO $$
DECLARE _mod UUID;
BEGIN
  SELECT m.id INTO _mod FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id WHERE c.slug = 'fiqh-basics' ORDER BY m.sort_order LIMIT 1;
  IF _mod IS NOT NULL THEN
    INSERT INTO public.lessons(module_id, title, description, youtube_id, duration_minutes, sort_order)
    VALUES
    (_mod, 'فقه الصلاة المبسّط', 'أحكام الصلاة بشكل عملي.', 'rMM5DjpzCk0', 20, 50)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
