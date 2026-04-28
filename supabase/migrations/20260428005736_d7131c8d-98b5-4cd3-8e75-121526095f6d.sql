
-- 1) Free international courses track
INSERT INTO public.tracks (slug, title, subtitle, description, emoji, color, sort_order)
VALUES ('free-courses', 'دورات مجانية دولية', 'Free Global Courses', 'مجموعة مختارة من أفضل الدورات المجانية على Coursera و edX و Khan Academy و Harvard وغيرها — كل دورة برابطها المباشر.', '🌐', '#0EA5E9', 5)
ON CONFLICT (slug) DO NOTHING;

-- 2) Free courses (each course = 1 hub lesson with link)
WITH t AS (SELECT id FROM public.tracks WHERE slug='free-courses')
INSERT INTO public.courses (track_id, slug, title, description, level, duration, emoji, sort_order, is_published)
SELECT t.id, x.slug, x.title, x.description, x.level, x.duration, x.emoji, x.sort_order, true FROM t,
(VALUES
 ('harvard-cs50','CS50 — Harvard مقدمة علوم الحاسوب','أشهر دورة برمجة في العالم من جامعة هارفارد، مجانية بالكامل مع شهادة.','مبتدئ','11 أسبوع','🎓',1),
 ('google-it-support','Google IT Support — Coursera','شهادة جوجل المهنية في دعم تقنية المعلومات، مجانية بالمساعدة المالية.','مبتدئ','6 أشهر','💻',2),
 ('khan-math','Khan Academy — الرياضيات الكاملة','منهج رياضيات كامل من الصفر للجامعة، مجاناً بالعربية.','مبتدئ','مفتوح','➗',3),
 ('coursera-learning-how-to-learn','Learning How to Learn — Coursera','تعلّم كيف تتعلم — أكثر دورة مشاهدة في تاريخ Coursera.','مبتدئ','4 أسابيع','🧠',4),
 ('edx-python-mit','MIT — Introduction to Python','مقدمة في علوم الحاسوب بلغة بايثون من معهد MIT.','مبتدئ','9 أسابيع','🐍',5),
 ('google-data-analytics','Google Data Analytics — Coursera','شهادة جوجل في تحليل البيانات.','مبتدئ','6 أشهر','📊',6),
 ('coursera-financial-markets','Yale — Financial Markets','أساسيات الأسواق المالية من جامعة Yale.','متوسط','7 أسابيع','💰',7),
 ('edx-english-cambridge','Cambridge — English for Business','إنجليزية الأعمال من جامعة كامبريدج.','متوسط','6 أسابيع','🗣️',8)
) AS x(slug,title,description,level,duration,emoji,sort_order)
ON CONFLICT (slug) DO NOTHING;

-- One module + one hub-lesson per free course
WITH new_courses AS (
  SELECT c.id, c.slug FROM public.courses c
  JOIN public.tracks t ON t.id=c.track_id
  WHERE t.slug='free-courses'
)
INSERT INTO public.modules (course_id, title, sort_order)
SELECT id, 'الرابط الرسمي للدورة', 1 FROM new_courses
ON CONFLICT DO NOTHING;

-- Insert hub lesson with extra_links per free course
WITH lesson_data AS (
  SELECT * FROM (VALUES
    ('harvard-cs50','بوابة الدورة على edX','https://cs50.harvard.edu/x/'),
    ('google-it-support','بوابة الدورة على Coursera','https://www.coursera.org/professional-certificates/google-it-support'),
    ('khan-math','الرياضيات على Khan Academy','https://ar.khanacademy.org/math'),
    ('coursera-learning-how-to-learn','بوابة Coursera','https://www.coursera.org/learn/learning-how-to-learn'),
    ('edx-python-mit','MIT 6.00.1x على edX','https://www.edx.org/learn/computer-science/massachusetts-institute-of-technology-introduction-to-computer-science-and-programming-using-python'),
    ('google-data-analytics','Google Data Analytics على Coursera','https://www.coursera.org/professional-certificates/google-data-analytics'),
    ('coursera-financial-markets','Yale Financial Markets','https://www.coursera.org/learn/financial-markets-global'),
    ('edx-english-cambridge','English for Business على edX','https://www.edx.org/school/cambridgex')
  ) AS d(course_slug, label, url)
)
INSERT INTO public.lessons (module_id, title, description, text_content, extra_links, sort_order)
SELECT m.id,
       'افتح الدورة الآن',
       'هذه دورة مجانية تُقدَّم على منصة دولية. اضغط الرابط لفتح صفحة الدورة الرسمية والتسجيل المجاني.',
       'الدورة كاملة على المنصة الأصلية. سجّل بحسابك (مجاناً) وتابع الدروس مباشرة من هناك. عند الانتهاء، أخبرنا لنُسجّل لك إنجازك في "يمن أفضل".',
       jsonb_build_array(jsonb_build_object('label', d.label, 'url', d.url)),
       1
FROM lesson_data d
JOIN public.courses c ON c.slug = d.course_slug
JOIN public.modules m ON m.course_id = c.id
WHERE NOT EXISTS (SELECT 1 FROM public.lessons l WHERE l.module_id = m.id);

-- 3) Add awareness videos: Ahmad Al-Sayed, Naif Bin Nahar, Fida'a Al-Deen
WITH awareness_modules AS (
  SELECT m.id, ROW_NUMBER() OVER(PARTITION BY m.course_id ORDER BY m.sort_order DESC) as rn, m.course_id, c.slug
  FROM public.modules m
  JOIN public.courses c ON c.id = m.course_id
  JOIN public.tracks t ON t.id = c.track_id
  WHERE t.slug='awareness'
),
last_modules AS (SELECT * FROM awareness_modules WHERE rn=1)
INSERT INTO public.lessons (module_id, title, description, youtube_id, sort_order, duration_minutes)
SELECT lm.id, x.title, x.description, x.yt, 100 + x.so, x.dur
FROM last_modules lm,
(VALUES
 ('habits',     'أحمد السيّد — الإرادة والعزيمة',          'محاضرة قوية لأحمد السيّد عن صناعة الإرادة وكسر الكسل.', '5z5j5mTEBmI', 1, 35),
 ('habits',     'فداء الدين — كيف تبدأ من جديد',           'حديث مؤثر للشيخ فداء الدين عن البدايات والعزائم.',     'lJ3kYWQv3Mc', 2, 28),
 ('time-management','نايف بن نهار — قيمة الوقت في حياتنا',  'محاضرة د. نايف بن نهار عن إدارة الوقت وأهميته.',       'sQaCBkQrK7g', 1, 40),
 ('time-management','أحمد السيّد — تنظيم الذات',            'أحمد السيّد عن تنظيم الذات ومراجعة الأسبوع.',          'ZDjWj0X7nFI', 2, 32),
 ('communication','نايف بن نهار — فن الحوار',                'فن الحوار وأخلاقياته للدكتور نايف بن نهار.',           'Q3kPOsKpD6g', 1, 30),
 ('communication','فداء الدين — الكلمة الطيبة',              'الشيخ فداء الدين عن أثر الكلمة الطيبة في العلاقات.',   'qZYFKcwQNFE', 2, 22)
) AS x(course_slug, title, description, yt, so, dur)
WHERE lm.slug = x.course_slug;

-- 4) Clear practical task data — keep schema for backwards compat, just disable
UPDATE public.lessons SET practical_task_type = NULL, practical_task_prompt = NULL WHERE practical_task_type IS NOT NULL;
