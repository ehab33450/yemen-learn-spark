
-- 1) حذف المسار الديني (CASCADE يدوي لأنه لا توجد قيود FK مع cascade)
DELETE FROM public.lesson_progress WHERE lesson_id IN (
  SELECT l.id FROM public.lessons l
  JOIN public.modules m ON m.id = l.module_id
  JOIN public.courses c ON c.id = m.course_id
  JOIN public.tracks t ON t.id = c.track_id
  WHERE t.slug = 'religious'
);
DELETE FROM public.lesson_quizzes WHERE lesson_id IN (
  SELECT l.id FROM public.lessons l
  JOIN public.modules m ON m.id = l.module_id
  JOIN public.courses c ON c.id = m.course_id
  JOIN public.tracks t ON t.id = c.track_id
  WHERE t.slug = 'religious'
);
DELETE FROM public.lessons WHERE module_id IN (
  SELECT m.id FROM public.modules m
  JOIN public.courses c ON c.id = m.course_id
  JOIN public.tracks t ON t.id = c.track_id
  WHERE t.slug = 'religious'
);
DELETE FROM public.modules WHERE course_id IN (
  SELECT c.id FROM public.courses c
  JOIN public.tracks t ON t.id = c.track_id
  WHERE t.slug = 'religious'
);
DELETE FROM public.certificates WHERE course_id IN (
  SELECT c.id FROM public.courses c
  JOIN public.tracks t ON t.id = c.track_id
  WHERE t.slug = 'religious'
);
DELETE FROM public.certificates WHERE track_id IN (SELECT id FROM public.tracks WHERE slug='religious');
DELETE FROM public.discussion_groups WHERE course_id IN (
  SELECT c.id FROM public.courses c
  JOIN public.tracks t ON t.id = c.track_id
  WHERE t.slug = 'religious'
);
DELETE FROM public.courses WHERE track_id IN (SELECT id FROM public.tracks WHERE slug='religious');
DELETE FROM public.tracks WHERE slug = 'religious';

-- 2) إضافة مسار جديد: مهارات حياتية
INSERT INTO public.tracks (slug, title, subtitle, description, color, emoji, sort_order)
VALUES (
  'life-skills',
  'مسار المهارات الحياتية',
  'مهارات تنفعك في كل يوم',
  'مجموعة دورات مجانية مختارة لتنمية شخصيتك ومهاراتك العملية: المال، الصحة، الدراسة، العمل، والعلاقات.',
  '#16a34a',
  '🌱',
  3
)
ON CONFLICT (slug) DO NOTHING;

-- 3) توسعة جدول الدروس
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS practical_task_type TEXT,        -- 'text' | 'audio' | 'short_answer' | 'none'
  ADD COLUMN IF NOT EXISTS practical_task_prompt TEXT,
  ADD COLUMN IF NOT EXISTS practical_task_min_chars INTEGER DEFAULT 30;

-- 4) جدول تسليمات المهام
CREATE TABLE IF NOT EXISTS public.lesson_task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  task_type TEXT NOT NULL,
  text_answer TEXT,
  audio_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

ALTER TABLE public.lesson_task_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own submissions"
  ON public.lesson_task_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own submissions"
  ON public.lesson_task_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own submissions"
  ON public.lesson_task_submissions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own submissions"
  ON public.lesson_task_submissions FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_task_submissions_updated_at
  BEFORE UPDATE ON public.lesson_task_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Storage bucket للتسجيلات الصوتية
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-submissions', 'lesson-submissions', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Submissions are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lesson-submissions');

CREATE POLICY "Users upload own submissions"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'lesson-submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own submissions storage"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'lesson-submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own submissions storage"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'lesson-submissions' AND auth.uid()::text = (storage.foldername(name))[1]);
