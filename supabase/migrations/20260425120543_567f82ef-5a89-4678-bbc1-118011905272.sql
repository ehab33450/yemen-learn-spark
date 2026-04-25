
-- Discussion groups (10 members per course)
CREATE TABLE public.discussion_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 10,
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_dg_course ON public.discussion_groups(course_id);

CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.discussion_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);
CREATE INDEX idx_gm_user ON public.group_members(user_id);
CREATE INDEX idx_gm_group ON public.group_members(group_id);

CREATE TABLE public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.discussion_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_gmsg_group ON public.group_messages(group_id, created_at DESC);

ALTER TABLE public.discussion_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- Helper: is a user member of a group? (security definer to avoid recursive RLS)
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.group_members WHERE group_id = _group_id AND user_id = _user_id);
$$;

-- Policies
CREATE POLICY "Groups readable by all" ON public.discussion_groups FOR SELECT USING (true);
CREATE POLICY "Admins manage groups" ON public.discussion_groups FOR ALL USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "Members readable by all" ON public.group_members FOR SELECT USING (true);
CREATE POLICY "Users join themselves" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users leave themselves" ON public.group_members FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Members read messages" ON public.group_messages FOR SELECT USING (public.is_group_member(group_id, auth.uid()));
CREATE POLICY "Members send messages" ON public.group_messages FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_group_member(group_id, auth.uid()));
CREATE POLICY "Users delete own messages" ON public.group_messages FOR DELETE USING (auth.uid() = user_id);

-- Auto join or create group (max 10 per group)
CREATE OR REPLACE FUNCTION public.join_or_create_discussion_group(_user_id UUID, _course_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _existing UUID;
  _open UUID;
  _course_title TEXT;
  _new_id UUID;
  _idx INTEGER;
BEGIN
  -- Already in a group for this course?
  SELECT g.id INTO _existing
  FROM public.discussion_groups g
  JOIN public.group_members m ON m.group_id = g.id
  WHERE g.course_id = _course_id AND m.user_id = _user_id
  LIMIT 1;
  IF _existing IS NOT NULL THEN RETURN _existing; END IF;

  -- Find an open group with room
  SELECT id INTO _open
  FROM public.discussion_groups
  WHERE course_id = _course_id AND member_count < capacity
  ORDER BY member_count DESC, created_at ASC
  LIMIT 1;

  IF _open IS NULL THEN
    SELECT title INTO _course_title FROM public.courses WHERE id = _course_id;
    SELECT COUNT(*) + 1 INTO _idx FROM public.discussion_groups WHERE course_id = _course_id;
    INSERT INTO public.discussion_groups(course_id, name, capacity, member_count)
    VALUES (_course_id, COALESCE(_course_title,'دورة') || ' — مجموعة ' || _idx, 10, 0)
    RETURNING id INTO _new_id;
    _open := _new_id;
  END IF;

  INSERT INTO public.group_members(group_id, user_id) VALUES (_open, _user_id)
  ON CONFLICT (group_id, user_id) DO NOTHING;
  UPDATE public.discussion_groups SET member_count = member_count + 1 WHERE id = _open;
  RETURN _open;
END;
$$;
