import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Users, Star, Clock, Award, CheckCircle2, PlayCircle, Lock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { courses } from "@/data/courses";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const course = courses.find((c) => c.id === id);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!user || !course) return;
    supabase.from("enrollments").select("id").eq("user_id", user.id).eq("course_id", course.id).maybeSingle()
      .then(({ data }) => setEnrolled(!!data));
  }, [user, course]);

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">الدورة غير موجودة</h1>
          <Link to="/courses"><Button>العودة للكتالوج</Button></Link>
        </div>
      </div>
    );
  }

  const handleEnroll = async () => {
    if (!user) {
      navigate("/auth?mode=signup");
      return;
    }
    setEnrolling(true);
    const { error } = await supabase.from("enrollments").insert({ user_id: user.id, course_id: course.id });
    if (error && error.code !== "23505") {
      toast.error("تعذّر التسجيل، حاول مجدداً");
    } else {
      toast.success("تم التسجيل بنجاح! ابدأ التعلم 🎉");
      setEnrolled(true);
    }
    setEnrolling(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="bg-gradient-hero text-primary-foreground py-12">
        <div className="container">
          <Link to="/courses" className="inline-flex items-center gap-1 text-primary-foreground/70 hover:text-primary-foreground text-sm mb-4">
            <ArrowLeft className="h-4 w-4" /> العودة للكتالوج
          </Link>
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-gold/20 text-gold border-gold/30">{course.level}</Badge>
                <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">{course.duration}</Badge>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">{course.title}</h1>
              <p className="text-primary-foreground/80 text-lg leading-relaxed mb-4">{course.description}</p>
              <div className="flex flex-wrap items-center gap-5 text-sm text-primary-foreground/80">
                <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {course.lessonsCount} درس</span>
                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.studentsCount} طالب</span>
                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-gold" /> {course.rating}</span>
                <span className="flex items-center gap-1"><Award className="h-4 w-4 text-gold" /> +{course.xpReward} XP</span>
              </div>
            </div>
            <Card className="glass-card">
              <div className="h-40 bg-gradient-gold flex items-center justify-center text-6xl rounded-t-lg">{course.emoji}</div>
              <CardContent className="p-5 space-y-4">
                <div className="text-center">
                  <div className="font-display text-3xl font-extrabold text-primary">مجاناً</div>
                  <p className="text-xs text-muted-foreground">100% بدون أي تكلفة</p>
                </div>
                {enrolled ? (
                  <Button className="w-full bg-emerald text-emerald-foreground hover:opacity-90" disabled>
                    <CheckCircle2 className="ml-2 h-4 w-4" /> أنت مسجّل في هذه الدورة
                  </Button>
                ) : (
                  <Button onClick={handleEnroll} disabled={enrolling} className="w-full bg-gradient-gold text-primary font-display font-bold">
                    {enrolling ? "..." : user ? "سجّل في الدورة" : "سجّل لبدء التعلم"}
                  </Button>
                )}
                <div className="space-y-2 text-sm text-muted-foreground pt-2 border-t border-border/40">
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> وصول مدى الحياة</div>
                  <div className="flex items-center gap-2"><Award className="h-4 w-4" /> شهادة عند الإكمال</div>
                  <div className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> محتوى عربي بالكامل</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container py-12 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-primary mb-4">ماذا ستتعلم؟</h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {course.outcomes.map((o) => (
                <li key={o} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald flex-shrink-0 mt-0.5" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-primary mb-4">محتوى الدورة</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {course.modules.map((m, idx) => (
                <AccordionItem key={m.id} value={m.id} className="border border-border rounded-lg px-4 bg-card">
                  <AccordionTrigger className="font-display hover:no-underline">
                    <span className="text-right">الوحدة {idx + 1}: {m.title}</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pt-2">
                      {m.lessons.map((l) => (
                        <li key={l.id} className="flex items-center justify-between text-sm py-2 border-b border-border/30 last:border-0">
                          <span className="flex items-center gap-2">
                            {l.preview || enrolled ? <PlayCircle className="h-4 w-4 text-accent" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                            {l.title}
                            {l.preview && !enrolled && <Badge variant="outline" className="text-[10px] mr-2">معاينة</Badge>}
                          </span>
                          <span className="text-xs text-muted-foreground">{l.duration}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        <aside className="space-y-6">
          <Card className="glass-card p-5">
            <h3 className="font-display font-bold mb-3">المعلم</h3>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground">{course.instructor.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-sm">{course.instructor}</div>
                <div className="text-xs text-muted-foreground">{course.instructorTitle}</div>
              </div>
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
};

export default CourseDetail;