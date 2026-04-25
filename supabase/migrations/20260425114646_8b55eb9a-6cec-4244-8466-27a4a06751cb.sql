
-- =========================
-- USER STREAKS
-- =========================
CREATE TABLE public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own streak" ON public.user_streaks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own streak" ON public.user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own streak" ON public.user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- =========================
-- BADGES (catalog)
-- =========================
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  xp_reward INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges readable by all" ON public.badges
  FOR SELECT USING (true);
CREATE POLICY "Admins manage badges" ON public.badges
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- =========================
-- USER BADGES
-- =========================
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User badges readable by all" ON public.user_badges
  FOR SELECT USING (true);
CREATE POLICY "Users insert own badges" ON public.user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =========================
-- DAILY CHALLENGES
-- =========================
CREATE TABLE public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  challenge_date DATE NOT NULL DEFAULT CURRENT_DATE,
  challenge_type TEXT NOT NULL,
  target_value INTEGER NOT NULL DEFAULT 1,
  current_value INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  xp_reward INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_date, challenge_type)
);

ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own challenges" ON public.daily_challenges
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own challenges" ON public.daily_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own challenges" ON public.daily_challenges
  FOR UPDATE USING (auth.uid() = user_id);

-- =========================
-- FUNCTIONS
-- =========================
CREATE OR REPLACE FUNCTION public.update_user_streak(_user_id UUID)
RETURNS TABLE(current_streak INTEGER, longest_streak INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _last_date DATE;
  _new_current INTEGER;
  _new_longest INTEGER;
BEGIN
  SELECT us.last_activity_date, us.current_streak, us.longest_streak
    INTO _last_date, _new_current, _new_longest
  FROM public.user_streaks us WHERE us.user_id = _user_id;

  IF _last_date IS NULL THEN
    _new_current := 1;
    _new_longest := 1;
  ELSIF _last_date = CURRENT_DATE THEN
    -- already counted today
    NULL;
  ELSIF _last_date = CURRENT_DATE - 1 THEN
    _new_current := COALESCE(_new_current, 0) + 1;
    _new_longest := GREATEST(_new_longest, _new_current);
  ELSE
    _new_current := 1;
    _new_longest := GREATEST(COALESCE(_new_longest, 0), 1);
  END IF;

  INSERT INTO public.user_streaks(user_id, current_streak, longest_streak, last_activity_date, updated_at)
  VALUES (_user_id, _new_current, _new_longest, CURRENT_DATE, now())
  ON CONFLICT (user_id) DO UPDATE
    SET current_streak = EXCLUDED.current_streak,
        longest_streak = EXCLUDED.longest_streak,
        last_activity_date = EXCLUDED.last_activity_date,
        updated_at = now();

  RETURN QUERY SELECT _new_current, _new_longest;
END;
$$;

CREATE OR REPLACE FUNCTION public.award_badge(_user_id UUID, _badge_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _badge_id UUID;
  _xp INTEGER;
BEGIN
  SELECT id, xp_reward INTO _badge_id, _xp FROM public.badges WHERE code = _badge_code;
  IF _badge_id IS NULL THEN RETURN false; END IF;

  IF EXISTS (SELECT 1 FROM public.user_badges WHERE user_id = _user_id AND badge_id = _badge_id) THEN
    RETURN false;
  END IF;

  INSERT INTO public.user_badges(user_id, badge_id) VALUES (_user_id, _badge_id);

  IF _xp > 0 THEN
    UPDATE public.profiles
      SET xp_points = xp_points + _xp,
          level = GREATEST(1, ((xp_points + _xp) / 100) + 1)
      WHERE user_id = _user_id;
  END IF;
  RETURN true;
END;
$$;

-- Seed initial badges
INSERT INTO public.badges (code, title, description, icon, category, xp_reward, sort_order) VALUES
  ('first_lesson',  'الخطوة الأولى',     'أكملت أول درس لك',                      '🎯', 'milestone', 10,  1),
  ('streak_3',      'ثلاثة أيام متتالية', 'تعلمت 3 أيام بدون انقطاع',              '🔥', 'streak',    20,  2),
  ('streak_7',      'أسبوع كامل',         'سلسلة تعلم 7 أيام',                     '⚡', 'streak',    50,  3),
  ('streak_30',     'شهر من الإنجاز',     'سلسلة تعلم 30 يوماً',                   '🏆', 'streak',    200, 4),
  ('first_course',  'دورة مكتملة',        'أكملت أول دورة',                        '🎓', 'milestone', 100, 5),
  ('xp_500',        'محارب التعلم',       'وصلت إلى 500 نقطة XP',                  '⭐', 'xp',        50,  6),
  ('xp_1000',       'بطل التعلم',         'وصلت إلى 1000 نقطة XP',                 '👑', 'xp',        100, 7),
  ('quiz_master',   'سيد الاختبارات',    'حصلت على 100% في 5 اختبارات',          '🧠', 'skill',     50,  8);
