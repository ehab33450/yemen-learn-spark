import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Compass, BookOpen, Award, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const MyLearning = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<any[]>([]);
  const [courseProgress, setCourseProgress] = useState<Record<string, { done: number; total: number; title: string; slug: string; track_id: string }>>({});
  const [messages, setMessages] = useState<any[]>([]);
  const [appreciation, setAppreciation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: trk }, { data: crs }, { data: lessons }, { data: prog }, { data: msgs }, { data: app }] = await Promise.all([
        supabase.from("tracks").select("*").order("sort_order"),
        supabase.from("courses").select("id,title,slug,track_id,emoji").order("sort_order"),
        supabase.from("lessons").select("id,module_id,modules!inner(course_id)"),
        supabase.from("lesson_progress").select("lesson_id,course_id,mastery_percent").eq("user_id", user.id),
        supabase.from("admin_messages").select("*").or(`recipient_id.eq.${user.id},is_broadcast.eq.true`).order("created_at", { ascending: false }).limit(10),
        supabase.from("appreciation_certificates").select("*").eq("user_id", user.id).order("issued_at", { ascending: false }),
      ]);

      const lessonsByCourse = new Map<string, number>();
      (lessons ?? []).forEach((l: any) => {
        const cid = l.modules?.course_id;
        if (cid) lessonsByCourse.set(cid, (lessonsByCourse.get(cid) ?? 0) + 1);
      });
      const doneByCourse = new Map<string, number>();
      (prog ?? []).forEach(p => {
        if ((p.mastery_percent ?? 0) >= 80) doneByCourse.set(p.course_id, (doneByCourse.get(p.course_id) ?? 0) + 1);
      });
      const cp: Record<string, any> = {};
      (crs ?? []).forEach((c: any) => {
        cp[c.id] = {
          title: c.title,
          slug: c.slug,
          track_id: c.track_id,
          emoji: c.emoji,
          total: lessonsByCourse.get(c.id) ?? 0,
          done: doneByCourse.get(c.id) ?? 0,
        };
      });

      setTracks(trk ?? []);
      setCourseProgress(cp);
      setMessages(msgs ?? []);
      setAppreciation(app ?? []);
      setLoading(false);
    })();
  }, [user]);

  if (loading || authLoading) {
    return <div className="min-h-screen bg-background"><Header /><main className="container py-8"><Skeleton className="h-96" /></main></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 space-y-8">
        <div className="flex items-center gap-3">
          <Compass className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-display font-bold">رحلتي التعليمية</h1>
            <p className="text-muted-foreground text-sm">جميع مساراتك ودوراتك في مكان واحد</p>
          </div>
        </div>

        {/* Admin messages */}
        {messages.length > 0 && (
          <Card className="p-5 border-accent/30 bg-accent/5">
            <h3 className="font-display font-bold mb-3 flex items-center gap-2"><Bell className="h-5 w-5 text-accent" />رسائل من المؤسس</h3>
            <div className="space-y-2">
              {messages.map(m => (
                <div key={m.id} className="p-3 bg-background rounded border border-border">
                  <div className="font-semibold text-sm">{m.title}</div>
                  <div className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{m.body}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{new Date(m.created_at).toLocaleDateString("ar")}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Appreciation certificates */}
        {appreciation.length > 0 && (
          <Card className="p-5 bg-gradient-gold/10 border-primary/30">
            <h3 className="font-display font-bold mb-3 flex items-center gap-2"><Award className="h-5 w-5 text-primary" />شهادات التقدير الممنوحة لك</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {appreciation.map(a => (
                <div key={a.id} className="p-4 bg-background rounded-lg border-2 border-primary/40">
                  <Badge className="mb-2 bg-gradient-gold text-primary">شهادة تقدير</Badge>
                  <div className="font-display font-bold text-lg">{a.title}</div>
                  {a.reason && <div className="text-sm text-muted-foreground mt-1">{a.reason}</div>}
                  <div className="text-xs text-muted-foreground mt-2">من المؤسس إيهاب المزلم • {new Date(a.issued_at).toLocaleDateString("ar")}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tracks */}
        {tracks.map(t => {
          const trackCourses = Object.entries(courseProgress).filter(([_, c]) => c.track_id === t.id);
          if (trackCourses.length === 0) return null;
          return (
            <section key={t.id}>
              <h2 className="text-xl font-display font-bold mb-3 flex items-center gap-2">
                <span className="text-2xl">{t.emoji}</span> {t.title}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trackCourses.map(([cid, c]: any) => {
                  const pct = c.total > 0 ? Math.round((c.done / c.total) * 100) : 0;
                  return (
                    <Link key={cid} to={`/courses/${c.slug}`}>
                      <Card className="p-4 hover:shadow-lg transition-shadow h-full">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="text-3xl">{c.emoji ?? "📘"}</div>
                          <div className="flex-1">
                            <h3 className="font-semibold leading-tight">{c.title}</h3>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><BookOpen className="h-3 w-3" />{c.done} / {c.total} درس</div>
                          </div>
                        </div>
                        <Progress value={pct} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1 text-left">{pct}%</div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
};

export default MyLearning;