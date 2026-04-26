import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Award, Flame, Star, Medal, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MotivationBanner } from "@/components/motivation/MotivationBanner";
import { PersonalGreeting } from "@/components/motivation/PersonalGreeting";
import { ChallengesCard } from "@/components/gamification/ChallengesCard";

interface Profile { display_name: string; xp_points: number; level: number; avatar_url: string | null; }
interface Badge { id: string; code: string; title: string; description: string | null; icon: string | null; xp_reward: number; }
interface Streak { current_streak: number; longest_streak: number; }

const Achievements = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [earnedIds, setEarnedIds] = useState<Set<string>>(new Set());
  const [earnedAt, setEarnedAt] = useState<Map<string, string>>(new Map());
  const [streak, setStreak] = useState<Streak>({ current_streak: 0, longest_streak: 0 });
  const [certCount, setCertCount] = useState(0);
  const [rank, setRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: bAll }, { data: bMine }, { data: s }, { count: cc }, { data: ranks }] = await Promise.all([
        supabase.from("profiles").select("display_name,xp_points,level,avatar_url").eq("user_id", user.id).maybeSingle(),
        supabase.from("badges").select("*").order("sort_order"),
        supabase.from("user_badges").select("badge_id,awarded_at").eq("user_id", user.id),
        supabase.from("user_streaks").select("current_streak,longest_streak").eq("user_id", user.id).maybeSingle(),
        supabase.from("certificates").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("profiles").select("user_id,xp_points").order("xp_points", { ascending: false }).limit(500),
      ]);
      setProfile(p as any);
      setAllBadges((bAll ?? []) as Badge[]);
      setEarnedIds(new Set((bMine ?? []).map((b: any) => b.badge_id)));
      setEarnedAt(new Map((bMine ?? []).map((b: any) => [b.badge_id, b.awarded_at])));
      if (s) setStreak(s as Streak);
      setCertCount(cc ?? 0);
      const myIdx = (ranks ?? []).findIndex((r: any) => r.user_id === user.id);
      setRank(myIdx >= 0 ? myIdx + 1 : 0);
      setLoading(false);
    })();
  }, [user]);

  if (authLoading || !user) return null;

  const xpInLevel = (profile?.xp_points ?? 0) % 100;
  const initial = (profile?.display_name ?? "؟").charAt(0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MotivationBanner />
      <main className="container py-10 max-w-5xl">
        <PersonalGreeting context="achievements" />

        {loading ? (
          <Skeleton className="h-64" />
        ) : (
          <>
            {/* Identity card */}
            <Card className="p-6 mb-6 bg-gradient-hero text-primary-foreground border-gold/20 overflow-hidden relative">
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />
              <div className="relative flex flex-col sm:flex-row items-center gap-5">
                <Avatar className="h-24 w-24 ring-4 ring-gold/40">
                  <AvatarFallback className="bg-gradient-gold text-primary text-3xl font-display font-extrabold">{initial}</AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-right flex-1">
                  <h1 className="font-display text-3xl font-extrabold mb-1">{profile?.display_name}</h1>
                  <p className="text-primary-foreground/70 text-sm mb-3">طالب في منصة يمن أفضل 🇾🇪</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <span className="px-3 py-1 rounded-full bg-gold/20 text-gold text-sm font-display font-bold flex items-center gap-1">
                      <Trophy className="h-4 w-4" /> المستوى {profile?.level}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-gold/20 text-gold text-sm font-display font-bold flex items-center gap-1">
                      <Star className="h-4 w-4" /> {profile?.xp_points} XP
                    </span>
                    {rank > 0 && (
                      <span className="px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm font-display font-bold flex items-center gap-1">
                        <Crown className="h-4 w-4" /> الترتيب #{rank}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="relative mt-5">
                <div className="flex justify-between text-xs mb-1 text-primary-foreground/70">
                  <span>التقدم نحو المستوى {(profile?.level ?? 1) + 1}</span>
                  <span>{xpInLevel}/100 XP</span>
                </div>
                <Progress value={xpInLevel} className="h-2" />
              </div>
            </Card>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <Card className="p-4 text-center">
                <Flame className="h-6 w-6 mx-auto text-accent mb-1" />
                <div className="font-display text-2xl font-extrabold text-primary">{streak.current_streak}</div>
                <div className="text-xs text-muted-foreground">سلسلة حالية</div>
              </Card>
              <Card className="p-4 text-center">
                <Flame className="h-6 w-6 mx-auto text-gold mb-1" />
                <div className="font-display text-2xl font-extrabold text-primary">{streak.longest_streak}</div>
                <div className="text-xs text-muted-foreground">أطول سلسلة</div>
              </Card>
              <Card className="p-4 text-center">
                <Medal className="h-6 w-6 mx-auto text-gold mb-1" />
                <div className="font-display text-2xl font-extrabold text-primary">{earnedIds.size}/{allBadges.length}</div>
                <div className="text-xs text-muted-foreground">شارات</div>
              </Card>
              <Card className="p-4 text-center">
                <Award className="h-6 w-6 mx-auto text-accent mb-1" />
                <div className="font-display text-2xl font-extrabold text-primary">{certCount}</div>
                <div className="text-xs text-muted-foreground">شهادات</div>
              </Card>
            </div>

            {/* Challenges */}
            <div className="mb-8">
              <h2 className="font-display text-xl font-bold text-primary mb-3">التحديات</h2>
              <ChallengesCard userId={user.id} />
            </div>

            {/* Badges – earned */}
            <h2 className="font-display text-xl font-bold text-primary mb-3 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-gold" /> شاراتك ({earnedIds.size})
            </h2>
            {earnedIds.size === 0 ? (
              <Card className="p-8 text-center text-muted-foreground mb-6">
                لم تحصل على شارات بعد. أكمل أول درس واحصل على "الخطوة الأولى"!
                <div className="mt-4">
                  <Button onClick={() => navigate("/tracks")} className="bg-gradient-gold text-primary font-display font-bold">ابدأ الآن</Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-6">
                {allBadges.filter((b) => earnedIds.has(b.id)).map((b) => (
                  <Card key={b.id} className="aspect-square p-3 flex flex-col items-center justify-center text-center bg-gradient-gold text-primary shadow-elegant">
                    <span className="text-3xl mb-1">{b.icon ?? "🏅"}</span>
                    <span className="text-[11px] font-display font-bold leading-tight">{b.title}</span>
                    <span className="text-[9px] opacity-70 mt-1">+{b.xp_reward} XP</span>
                  </Card>
                ))}
              </div>
            )}

            {/* Locked badges */}
            {allBadges.some((b) => !earnedIds.has(b.id)) && (
              <>
                <h2 className="font-display text-xl font-bold text-muted-foreground mb-3">شارات مغلقة</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {allBadges.filter((b) => !earnedIds.has(b.id)).map((b) => (
                    <Card key={b.id} className="aspect-square p-3 flex flex-col items-center justify-center text-center bg-muted/40 grayscale opacity-60">
                      <span className="text-3xl mb-1">{b.icon ?? "🔒"}</span>
                      <span className="text-[11px] font-display font-bold leading-tight text-muted-foreground">{b.title}</span>
                      <span className="text-[9px] text-muted-foreground mt-1">{b.description}</span>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Achievements;