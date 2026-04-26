import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Crown, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MotivationBanner } from "@/components/motivation/MotivationBanner";
import { PersonalGreeting } from "@/components/motivation/PersonalGreeting";

interface Row { user_id: string; display_name: string; xp_points: number; level: number; avatar_url: string | null; }

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id,display_name,xp_points,level,avatar_url")
        .order("xp_points", { ascending: false })
        .limit(50);
      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, []);

  const myRank = user ? rows.findIndex((r) => r.user_id === user.id) + 1 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MotivationBanner />
      <main className="container py-10 max-w-4xl">
        <PersonalGreeting context="leaderboard" />
        <div className="text-center mb-8">
          <Trophy className="h-12 w-12 text-gold mx-auto mb-3 animate-pulse-gold" />
          <h1 className="font-display text-4xl font-extrabold text-primary mb-2">لوحة الشرف</h1>
          <p className="text-muted-foreground">أبطال التعلّم في منصة يمن أفضل</p>
          {myRank > 0 && (
            <p className="mt-3 text-sm font-display">ترتيبك الحالي: <span className="font-bold text-accent">#{myRank}</span></p>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all">العام</TabsTrigger>
            <TabsTrigger value="week">هذا الأسبوع</TabsTrigger>
            <TabsTrigger value="streak">السلاسل</TabsTrigger>
          </TabsList>

          {(["all", "week", "streak"] as const).map((tab) => (
            <TabsContent key={tab} value={tab}>
              {loading ? (
                <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
              ) : rows.length === 0 ? (
                <Card className="p-10 text-center text-muted-foreground">لا يوجد متصدرون بعد. كن الأول!</Card>
              ) : (
                <div className="space-y-2">
                  {/* Top 3 podium */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[1, 0, 2].map((idx) => {
                      const r = rows[idx]; if (!r) return <div key={idx} />;
                      const isFirst = idx === 0;
                      const colors = ["bg-gradient-gold text-primary", "bg-gradient-to-br from-zinc-300 to-zinc-400 text-zinc-900", "bg-gradient-to-br from-amber-700 to-amber-800 text-amber-50"];
                      const heights = ["pt-2", "pt-6", "pt-8"];
                      return (
                        <Card key={r.user_id} className={`p-4 text-center ${heights[idx]} ${isFirst ? "ring-2 ring-gold" : ""}`}>
                          <div className={`mx-auto mb-2 h-14 w-14 rounded-full flex items-center justify-center ${colors[idx]} font-display font-extrabold text-xl shadow-elegant`}>
                            {isFirst ? <Crown className="h-7 w-7" /> : <Medal className="h-6 w-6" />}
                          </div>
                          <div className="font-display font-bold text-sm truncate text-primary">{r.display_name}</div>
                          <div className="text-xs text-muted-foreground">المستوى {r.level}</div>
                          <div className="font-display font-extrabold text-gold mt-1">{r.xp_points} XP</div>
                        </Card>
                      );
                    })}
                  </div>

                  {rows.slice(3).map((r, i) => {
                    const isMe = user && r.user_id === user.id;
                    return (
                      <Card key={r.user_id} className={`p-3 flex items-center gap-3 ${isMe ? "ring-2 ring-accent bg-accent/5" : ""}`}>
                        <span className="font-display font-bold text-muted-foreground w-8 text-center">#{i + 4}</span>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">{r.display_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-display font-semibold text-sm truncate text-primary">
                            {r.display_name} {isMe && <span className="text-accent text-xs">(أنت)</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">المستوى {r.level}</div>
                        </div>
                        <div className="font-display font-bold text-gold flex items-center gap-1">
                          <Flame className="h-4 w-4" />
                          {r.xp_points}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default LeaderboardPage;