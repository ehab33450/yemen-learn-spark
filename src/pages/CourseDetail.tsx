import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Clock, PlayCircle, CheckCircle2, Calendar, Target } from "lucide-react";

interface Course {
  id: string; slug: string; title: string; description: string | null;
  level: string | null; duration: string | null; emoji: string | null;
  learning_plan: any; outcomes: any;
}
interface Lesson { id: string; title: string; duration_minutes: number | null; sort_order: number; }
interface Module { id: string; title: string; sort_order: number; lessons: Lesson[]; }

const CourseDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: c } = await supabase.from("courses").select("*").eq("slug", slug).maybeSingle();
      if (!c) { setLoading(false); return; }
      const { data: mods } = await supabase
        .from("modules")
        .select("id,title,sort_order,lessons(id,title,duration_minutes,sort_order)")
        .eq("course_id", c.id)
        .order("sort_order");
      const sorted: Module[] = (mods ?? []).map((m: any) => ({
        ...m,
        lessons: (m.lessons ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order),
      }));
      setCourse(c);
      setModules(sorted);

      if (user) {
        const { data: prog } = await supabase
          .from("lesson_progress")
          .select("lesson_id,mastery_percent")
          .eq("user_id", user.id)
          .eq("course_id", c.id);
        const map: Record<string, number> = {};
        (prog ?? []).forEach((p) => { map[p.lesson_id] = p.mastery_percent; });
        setProgress(map);
      }
      setLoading(false);
    })();
  }, [slug, user]);

  const allLessons = modules.flatMap((m) => m.lessons);
  const totalLessons = allLessons.length;
  const masteredLessons = allLessons.filter((l) => (progress[l.id] ?? 0) >= 80).length;
  const overallPct = totalLessons ? Math.round((masteredLessons / totalLessons) * 100) : 0;
  const nextLesson = allLessons.find((l) => (progress[l.id] ?? 0) < 80) ?? allLessons[0];

  const startCourse = () => {
    if (!user) return navigate("/auth");
    // Auto-join discussion group for this course
    if (course) supabase.rpc("join_or_create_discussion_group", { _user_id: user.id, _course_id: course.id });
    if (nextLesson) navigate(`/lessons/${nextLesson.id}`);
  };

  if (loading) return (
    <div className="min-h-screen bg-background"><Header /><main className="container py-12"><Skeleton className="h-64" /></main></div>
  );
  if (!course) return (
    <div className="min-h-screen bg-background"><Header /><main className="container py-20 text-center">الدورة غير موجودة.</main></div>
  );

  const plan = Array.isArray(course.learning_plan) ? course.learning_plan : [];
  const outcomes = Array.isArray(course.outcomes) ? course.outcomes : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10">
        <Link to="/tracks" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mb-6">
          <ArrowLeft className="h-4 w-4" /> رجوع
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">{course.emoji}</div>
                <div className="flex-1">
                  <h1 className="font-display text-3xl font-extrabold text-primary mb-2">{course.title}</h1>
                  <div className="flex flex-wrap gap-2">
                    {course.level && <Badge variant="secondary">{course.level}</Badge>}
                    {course.duration && <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />{course.duration}</Badge>}
                    <Badge variant="outline">{totalLessons} درس</Badge>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">{course.description}</p>
              {user && totalLessons > 0 && (
                <div className="mb-4 p-4 bg-secondary/40 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold">تقدمك في الدورة</span>
                    <span className="text-accent font-bold">{overallPct}%</span>
                  </div>
                  <Progress value={overallPct} />
                </div>
              )}
              <Button onClick={startCourse} size="lg" className="bg-gradient-gold text-primary font-display font-bold">
                <PlayCircle className="ml-2 h-5 w-5" />
                {masteredLessons > 0 && masteredLessons < totalLessons ? "استمر من حيث توقفت" : "ابدأ الدورة"}
              </Button>
            </Card>

            {/* Outcomes */}
            {outcomes.length > 0 && (
              <Card className="p-6">
                <h2 className="font-display text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-accent" /> ماذا ستتعلم؟
                </h2>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {outcomes.map((o: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      {o}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Modules */}
            <Card className="p-6">
              <h2 className="font-display text-xl font-bold text-primary mb-4">محتوى الدورة</h2>
              <div className="space-y-5">
                {modules.map((m, mi) => (
                  <div key={m.id}>
                    <h3 className="font-display font-semibold mb-2 text-foreground">
                      الوحدة {mi + 1}: {m.title}
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                      {m.lessons.map((l) => {
                        const mastered = (progress[l.id] ?? 0) >= 80;
                        return (
                          <Link
                            key={l.id}
                            to={user ? `/lessons/${l.id}` : "/auth"}
                            className="flex items-center justify-between gap-3 p-3 border-b last:border-b-0 hover:bg-secondary/40 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {mastered ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald flex-shrink-0" />
                              ) : (
                                <PlayCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                              )}
                              <span className="text-sm font-medium truncate">{l.title}</span>
                            </div>
                            {l.duration_minutes && (
                              <span className="text-xs text-muted-foreground flex-shrink-0">{l.duration_minutes} د</span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {modules.length === 0 && <p className="text-sm text-muted-foreground">لا توجد وحدات بعد.</p>}
              </div>
            </Card>
          </div>

          {/* Sidebar: Learning Plan */}
          <aside>
            <Card className="p-6 sticky top-20">
              <h2 className="font-display text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" /> خطة التعلم
              </h2>
              {plan.length > 0 ? (
                <ol className="space-y-3">
                  {plan.map((p: any, i: number) => (
                    <li key={i} className="border-r-2 border-accent pr-3">
                      <div className="font-semibold text-sm text-primary">اليوم {p.day}</div>
                      <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        {(p.tasks ?? []).map((t: string, j: number) => <li key={j}>• {t}</li>)}
                      </ul>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">سيتم إضافة خطة قريباً.</p>
              )}
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CourseDetail;