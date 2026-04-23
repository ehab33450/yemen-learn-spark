import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, BookOpen, RefreshCw, Sparkles, ExternalLink, Award } from "lucide-react";

interface Lesson {
  id: string; title: string; description: string | null;
  youtube_id: string | null; text_content: string | null;
  example_text: string | null; extra_links: any;
  duration_minutes: number | null;
  module_id: string;
}
interface Quiz { id: string; question: string; options: string[]; correct_index: number; }
interface ProgressRow {
  watched: boolean; read: boolean; reviewed: boolean; applied: boolean;
  quiz_score: number | null; mastery_percent: number;
}

const LessonView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [courseSlug, setCourseSlug] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [siblings, setSiblings] = useState<{ id: string; sort_order: number }[]>([]);
  const [progress, setProgress] = useState<ProgressRow>({
    watched: false, read: false, reviewed: false, applied: false, quiz_score: null, mastery_percent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showQuizResult, setShowQuizResult] = useState(false);

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      setLoading(true);
      const { data: l } = await supabase.from("lessons").select("*").eq("id", id).maybeSingle();
      if (!l) { setLoading(false); return; }
      setLesson(l as any);

      const { data: mod } = await supabase.from("modules").select("course_id").eq("id", l.module_id).maybeSingle();
      if (mod) {
        setCourseId(mod.course_id);
        const { data: course } = await supabase.from("courses").select("slug").eq("id", mod.course_id).maybeSingle();
        if (course) setCourseSlug(course.slug);

        // siblings (all lessons in this course, ordered by module then lesson)
        const { data: allMods } = await supabase
          .from("modules")
          .select("id,sort_order,lessons(id,sort_order)")
          .eq("course_id", mod.course_id)
          .order("sort_order");
        const flat: { id: string; sort_order: number }[] = [];
        (allMods ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order).forEach((m: any) => {
          (m.lessons ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order).forEach((ll: any) => {
            flat.push({ id: ll.id, sort_order: flat.length });
          });
        });
        setSiblings(flat);
      }

      const { data: q } = await supabase.from("lesson_quizzes").select("*").eq("lesson_id", id).order("sort_order");
      setQuizzes((q ?? []).map((row: any) => ({ ...row, options: Array.isArray(row.options) ? row.options : [] })));

      const { data: prog } = await supabase
        .from("lesson_progress")
        .select("watched,read,reviewed,applied,quiz_score,mastery_percent")
        .eq("user_id", user.id).eq("lesson_id", id).maybeSingle();
      if (prog) setProgress(prog as ProgressRow);

      setAnswers({});
      setShowQuizResult(false);
      setLoading(false);
    })();
  }, [id, user]);

  const computeMastery = (p: ProgressRow) =>
    (p.watched ? 40 : 0) + (p.read ? 20 : 0) + (p.reviewed ? 20 : 0) + (p.applied ? 20 : 0);

  const saveProgress = async (next: Partial<ProgressRow>) => {
    if (!user || !lesson || !courseId) return;
    const merged = { ...progress, ...next };
    merged.mastery_percent = computeMastery(merged);
    setProgress(merged);

    await supabase.from("lesson_progress").upsert({
      user_id: user.id,
      lesson_id: lesson.id,
      course_id: courseId,
      watched: merged.watched,
      read: merged.read,
      reviewed: merged.reviewed,
      applied: merged.applied,
      quiz_score: merged.quiz_score,
      mastery_percent: merged.mastery_percent,
      completed_at: merged.mastery_percent >= 80 ? new Date().toISOString() : null,
    }, { onConflict: "user_id,lesson_id" });

    if (merged.mastery_percent >= 80 && progress.mastery_percent < 80) {
      // Award XP
      const { data: profile } = await supabase.from("profiles").select("xp_points,level").eq("user_id", user.id).maybeSingle();
      if (profile) {
        const newXp = profile.xp_points + 10;
        const newLevel = Math.floor(newXp / 100) + 1;
        await supabase.from("profiles").update({ xp_points: newXp, level: newLevel }).eq("user_id", user.id);
      }
      toast.success("🎉 أتقنت الدرس! +10 نقاط");

      // Check if course complete -> certificate
      const { data: allProg } = await supabase
        .from("lesson_progress").select("mastery_percent").eq("user_id", user.id).eq("course_id", courseId);
      const total = siblings.length;
      const mastered = (allProg ?? []).filter((r) => r.mastery_percent >= 80).length;
      if (total > 0 && mastered >= total) {
        await supabase.from("certificates").insert({ user_id: user.id, kind: "course", course_id: courseId });
        const { data: profile2 } = await supabase.from("profiles").select("xp_points,level").eq("user_id", user.id).maybeSingle();
        if (profile2) {
          const newXp = profile2.xp_points + 100;
          const newLevel = Math.floor(newXp / 100) + 1;
          await supabase.from("profiles").update({ xp_points: newXp, level: newLevel }).eq("user_id", user.id);
        }
        toast.success("🏆 أكملت الدورة! +100 نقطة وحصلت على شهادة!");
      }
    }
  };

  const submitQuiz = async () => {
    if (quizzes.length === 0) return;
    let correct = 0;
    quizzes.forEach((q) => { if (answers[q.id] === q.correct_index) correct++; });
    const score = Math.round((correct / quizzes.length) * 100);
    setShowQuizResult(true);
    await saveProgress({ quiz_score: score, reviewed: score >= 60 });
  };

  const idx = useMemo(() => siblings.findIndex((s) => s.id === id), [siblings, id]);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  if (loading) return <div className="min-h-screen bg-background"><Header /><main className="container py-10"><Skeleton className="h-96" /></main></div>;
  if (!lesson) return <div className="min-h-screen bg-background"><Header /><main className="container py-20 text-center">الدرس غير موجود.</main></div>;

  const links = Array.isArray(lesson.extra_links) ? lesson.extra_links : [];
  const mastered = progress.mastery_percent >= 80;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-4xl">
        {courseSlug && (
          <Link to={`/courses/${courseSlug}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mb-4">
            <ArrowLeft className="h-4 w-4" /> رجوع للدورة
          </Link>
        )}

        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-primary mb-2">{lesson.title}</h1>
        {lesson.description && <p className="text-muted-foreground mb-6">{lesson.description}</p>}

        {/* Mastery bar */}
        <Card className="p-4 mb-6">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="font-semibold">نسبة الإتقان</span>
            <span className={`font-bold ${mastered ? "text-emerald" : "text-accent"}`}>{progress.mastery_percent}%</span>
          </div>
          <Progress value={progress.mastery_percent} />
          {!mastered && progress.mastery_percent > 0 && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><RefreshCw className="h-3 w-3" /> اكمل بقية الخطوات للوصول إلى 80% (إتقان)</p>
          )}
          {mastered && <p className="text-xs text-emerald mt-2 flex items-center gap-1"><Sparkles className="h-3 w-3" /> أتقنت هذا الدرس!</p>}
        </Card>

        {/* Video */}
        {lesson.youtube_id && (
          <Card className="overflow-hidden mb-6">
            <div className="aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${lesson.youtube_id}`}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="p-4 flex items-center gap-2">
              <Checkbox
                id="watched"
                checked={progress.watched}
                onCheckedChange={(v) => saveProgress({ watched: !!v })}
              />
              <label htmlFor="watched" className="text-sm cursor-pointer">شاهدت الفيديو (40%)</label>
            </div>
          </Card>
        )}

        {/* Text */}
        {lesson.text_content && (
          <Card className="p-6 mb-6">
            <h2 className="font-display font-bold text-primary mb-3 flex items-center gap-2"><BookOpen className="h-5 w-5 text-accent" /> الشرح</h2>
            <p className="leading-loose text-foreground/90 whitespace-pre-wrap">{lesson.text_content}</p>
            {lesson.example_text && (
              <div className="mt-4 p-4 bg-secondary/40 rounded-lg border-r-4 border-accent">
                <div className="text-xs font-bold text-accent mb-1">مثال</div>
                <p className="text-sm">{lesson.example_text}</p>
              </div>
            )}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <Checkbox
                id="read"
                checked={progress.read}
                onCheckedChange={(v) => saveProgress({ read: !!v })}
              />
              <label htmlFor="read" className="text-sm cursor-pointer">قرأت الشرح (20%)</label>
            </div>
          </Card>
        )}

        {/* Extra links */}
        {links.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="font-display font-bold text-primary mb-3">روابط إضافية</h2>
            <ul className="space-y-2">
              {links.map((ln: any, i: number) => (
                <li key={i}>
                  <a href={ln.url} target="_blank" rel="noreferrer" className="text-accent hover:underline flex items-center gap-2 text-sm">
                    <ExternalLink className="h-3 w-3" /> {ln.label || ln.url}
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Quiz */}
        {quizzes.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="font-display font-bold text-primary mb-4">اختبار سريع</h2>
            <div className="space-y-5">
              {quizzes.map((q, qi) => {
                const picked = answers[q.id];
                return (
                  <div key={q.id}>
                    <p className="font-semibold mb-2">{qi + 1}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt: string, oi: number) => {
                        const isCorrect = showQuizResult && oi === q.correct_index;
                        const isWrong = showQuizResult && picked === oi && oi !== q.correct_index;
                        return (
                          <button
                            key={oi}
                            type="button"
                            disabled={showQuizResult}
                            onClick={() => setAnswers({ ...answers, [q.id]: oi })}
                            className={`w-full text-right p-3 rounded-lg border text-sm transition-colors ${
                              isCorrect ? "bg-emerald/15 border-emerald" :
                              isWrong ? "bg-destructive/15 border-destructive" :
                              picked === oi ? "bg-accent/15 border-accent" : "hover:bg-secondary/50"
                            }`}
                          >{opt}</button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            {!showQuizResult ? (
              <Button onClick={submitQuiz} className="mt-5" disabled={Object.keys(answers).length < quizzes.length}>تحقق من الإجابات</Button>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">نتيجتك: <span className="font-bold text-accent">{progress.quiz_score}%</span></p>
            )}
          </Card>
        )}

        {/* Application step */}
        <Card className="p-6 mb-6">
          <h2 className="font-display font-bold text-primary mb-3">التطبيق</h2>
          <p className="text-sm text-muted-foreground mb-4">طبّق ما تعلمته اليوم — حتى لو خطوة صغيرة. ضع علامة عند الانتهاء.</p>
          <div className="flex items-center gap-2">
            <Checkbox
              id="applied"
              checked={progress.applied}
              onCheckedChange={(v) => saveProgress({ applied: !!v })}
            />
            <label htmlFor="applied" className="text-sm cursor-pointer">طبّقت الدرس (20%)</label>
          </div>
        </Card>

        {!mastered && progress.mastery_percent > 0 && progress.mastery_percent < 80 && (
          <Card className="p-4 mb-6 bg-accent/10 border-accent/30">
            <p className="text-sm flex items-center gap-2"><RefreshCw className="h-4 w-4 text-accent" /> راجع هذا الدرس مرة أخرى لتصل إلى الإتقان (80%).</p>
          </Card>
        )}

        {mastered && (
          <Card className="p-4 mb-6 bg-emerald/10 border-emerald/30">
            <p className="text-sm flex items-center gap-2"><Award className="h-4 w-4 text-emerald" /> أحسنت! أتقنت هذا الدرس وكسبت 10 نقاط.</p>
          </Card>
        )}

        {/* Nav */}
        <div className="flex justify-between gap-3">
          {prev ? (
            <Button variant="outline" onClick={() => navigate(`/lessons/${prev.id}`)}>
              <ArrowRight className="ml-2 h-4 w-4" /> الدرس السابق
            </Button>
          ) : <span />}
          {next ? (
            <Button onClick={() => navigate(`/lessons/${next.id}`)} className="bg-gradient-gold text-primary font-display font-bold">
              الدرس التالي <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
          ) : courseSlug && (
            <Button onClick={() => navigate(`/courses/${courseSlug}`)} className="bg-gradient-gold text-primary font-display font-bold">إنهاء الدورة</Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default LessonView;