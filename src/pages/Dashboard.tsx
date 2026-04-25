import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Award, Flame, BookOpen, ArrowLeft } from "lucide-react";
import { StreakCard } from "@/components/gamification/StreakCard";
import { BadgesGrid } from "@/components/gamification/BadgesGrid";
import { Leaderboard } from "@/components/gamification/Leaderboard";
import { AITutorWidget } from "@/components/ai/AITutorWidget";

interface CourseProgress {
  course_id: string;
  slug: string;
  title: string;
  emoji: string | null;
  total_lessons: number;
  mastered_lessons: number;
  next_lesson_id: string | null;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ display_name: string; xp_points: number; level: number } | null>(null);
  const [items, setItems] = useState<CourseProgress[]>([]);
  const [certCount, setCertCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: prof } = await supabase.from("profiles").select("display_name,xp_points,level").eq("user_id", user.id).maybeSingle();
      setProfile(prof as any);

      const { data: prog } = await supabase
        .from("lesson_progress").select("course_id,lesson_id,mastery_percent")
        .eq("user_id", user.id);

      const courseIds = Array.from(new Set((prog ?? []).map((p) => p.course_id)));
      if (courseIds.length === 0) { setLoading(false); return; }

      const { data: courses } = await supabase
        .from("courses").select("id,slug,title,emoji,modules(id,sort_order,lessons(id,sort_order))")
        .in("id", courseIds);

      const list: CourseProgress[] = (courses ?? []).map((c: any) => {
        const lessons: { id: string; sort_order: number; modSort: number }[] = [];
        (c.modules ?? []).forEach((m: any) =>
          (m.lessons ?? []).forEach((l: any) => lessons.push({ id: l.id, sort_order: l.sort_order, modSort: m.sort_order }))
        );
        lessons.sort((a, b) => a.modSort - b.modSort || a.sort_order - b.sort_order);
        const masteredIds = new Set(
          (prog ?? []).filter((p) => p.course_id === c.id && p.mastery_percent >= 80).map((p) => p.lesson_id)
        );
        const next = lessons.find((l) => !masteredIds.has(l.id));
        return {
          course_id: c.id,
          slug: c.slug,
          title: c.title,
          emoji: c.emoji,
          total_lessons: lessons.length,
          mastered_lessons: masteredIds.size,
          next_lesson_id: next?.id ?? null,
        };
      });
      setItems(list);

      const { count } = await supabase.from("certificates").select("*", { count: "exact", head: true }).eq("user_id", user.id);
      setCertCount(count ?? 0);
      setLoading(false);
    })();
  }, [user]);

  if (authLoading || !user) return null;

  const xpInLevel = (profile?.xp_points ?? 0) % 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10">
        <h1 className="font-display text-3xl font-extrabold text-primary mb-1">
          مرحباً، {profile?.display_name ?? "صديقي"} 👋
        </h1>
        <p className="text-muted-foreground mb-8">رحلتك تتقدم — استمر!</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-1"><Trophy className="h-5 w-5 text-accent" /><span className="text-sm text-muted-foreground">المستوى</span></div>
            <div className="font-display text-3xl font-extrabold text-primary">{profile?.level ?? 1}</div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-1"><Trophy className="h-5 w-5 text-gold" /><span className="text-sm text-muted-foreground">النقاط</span></div>
            <div className="font-display text-3xl font-extrabold text-primary">{profile?.xp_points ?? 0}</div>
            <Progress value={xpInLevel} className="mt-2 h-1.5" />
          </Card>
          <StreakCard userId={user.id} />
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-1"><Award className="h-5 w-5 text-accent" /><span className="text-sm text-muted-foreground">الشهادات</span></div>
            <div className="font-display text-3xl font-extrabold text-primary">{certCount}</div>
          </Card>
        </div>

        <div className="mb-8"><BadgesGrid userId={user.id} /></div>

        <h2 className="font-display text-xl font-bold text-primary mb-4">دوراتي</h2>
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map((i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : items.length === 0 ? (
          <Card className="p-10 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">لم تبدأ أي دورة بعد. اختر مساراً وانطلق!</p>
            <Button onClick={() => navigate("/tracks")} className="bg-gradient-gold text-primary font-display font-bold">استعرض المسارات</Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {items.map((c) => {
              const pct = c.total_lessons ? Math.round((c.mastered_lessons / c.total_lessons) * 100) : 0;
              return (
                <Card key={c.course_id} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{c.emoji}</span>
                      <div>
                        <h3 className="font-display font-bold text-primary">{c.title}</h3>
                        <p className="text-xs text-muted-foreground">{c.mastered_lessons} / {c.total_lessons} درس متقن</p>
                      </div>
                    </div>
                  </div>
                  <Progress value={pct} className="mb-3" />
                  <div className="flex gap-2">
                    {c.next_lesson_id ? (
                      <Button size="sm" onClick={() => navigate(`/lessons/${c.next_lesson_id}`)} className="flex-1 bg-gradient-gold text-primary font-display font-bold">
                        استمر <ArrowLeft className="mr-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled className="flex-1">مكتملة ✓</Button>
                    )}
                    <Link to={`/courses/${c.slug}`}><Button size="sm" variant="outline">عرض</Button></Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-8">
          <Leaderboard currentUserId={user.id} />
        </div>
      </main>
      <AITutorWidget />
    </div>
  );
};

export default Dashboard;