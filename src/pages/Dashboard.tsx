import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { BookOpen, Trophy, Zap, Award, ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { courses } from "@/data/courses";

interface Profile {
  display_name: string;
  xp_points: number;
  level: number;
  city: string | null;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [progressCount, setProgressCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("profiles").select("display_name, xp_points, level, city").eq("user_id", user.id).maybeSingle(),
      supabase.from("enrollments").select("course_id").eq("user_id", user.id),
      supabase.from("course_progress").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]).then(([p, e, prog]) => {
      if (p.data) setProfile(p.data as Profile);
      if (e.data) setEnrolledIds(e.data.map((r) => r.course_id));
      setProgressCount(prog.count ?? 0);
      setDataLoading(false);
    });
  }, [user]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const enrolledCourses = courses.filter((c) => enrolledIds.includes(c.id));
  const xp = profile?.xp_points ?? 0;
  const level = profile?.level ?? 1;
  const xpToNextLevel = level * 1000;
  const xpProgress = (xp % 1000) / 10;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="bg-gradient-hero text-primary-foreground py-10">
        <div className="container">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">
            مرحباً، {profile?.display_name ?? "صديقنا"} 👋
          </h1>
          <p className="text-primary-foreground/80 text-sm">واصل رحلتك التعليمية. كل خطوة تقربك من هدفك.</p>
        </div>
      </section>

      <section className="container py-8 space-y-8">
        {/* === XP & Stats === */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-5 w-5 text-gold" />
                <span className="text-sm font-medium text-muted-foreground">نقاط XP</span>
              </div>
              <div className="font-display text-2xl font-extrabold text-primary">{xp.toLocaleString("ar")}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium text-muted-foreground">المستوى</span>
              </div>
              <div className="font-display text-2xl font-extrabold text-primary">{level}</div>
              <Progress value={xpProgress} className="h-1.5 mt-2" />
              <p className="text-[10px] text-muted-foreground mt-1">{xpToNextLevel - xp} XP للمستوى التالي</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-5 w-5 text-emerald" />
                <span className="text-sm font-medium text-muted-foreground">دوراتي</span>
              </div>
              <div className="font-display text-2xl font-extrabold text-primary">{enrolledCourses.length}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <Award className="h-5 w-5 text-gold" />
                <span className="text-sm font-medium text-muted-foreground">دروس مكتملة</span>
              </div>
              <div className="font-display text-2xl font-extrabold text-primary">{progressCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* === My courses === */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-primary">دوراتي</h2>
            <Link to="/courses">
              <Button variant="ghost" size="sm" className="gap-1">
                تصفّح المزيد <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          {dataLoading ? (
            <p className="text-muted-foreground text-sm">جارٍ التحميل...</p>
          ) : enrolledCourses.length === 0 ? (
            <Card className="glass-card p-10 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-display font-bold text-lg mb-2">لم تسجل في أي دورة بعد</h3>
              <p className="text-muted-foreground text-sm mb-4">ابدأ رحلتك باختيار دورة من الكتالوج.</p>
              <Link to="/courses">
                <Button className="bg-gradient-gold text-primary font-display font-semibold">تصفّح الدورات</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map((c) => (
                <Link key={c.id} to={`/courses/${c.id}`}>
                  <Card className="glass-card hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden cursor-pointer">
                    <div className="h-24 bg-gradient-hero flex items-center justify-center text-4xl">{c.emoji}</div>
                    <CardHeader className="pb-2">
                      <Badge variant="outline" className="text-xs w-fit mb-1">{c.level}</Badge>
                      <CardTitle className="font-display text-base leading-snug line-clamp-2">{c.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Progress value={0} className="h-1.5" />
                      <p className="text-xs text-muted-foreground mt-2">ابدأ الدرس الأول</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;