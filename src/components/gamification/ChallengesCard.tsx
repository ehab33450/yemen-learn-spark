import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, CalendarDays, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Weekly {
  lessons_target: number; lessons_done: number;
  xp_target: number; xp_earned: number;
  streak_target: number; streak_reached: number;
  reward_xp: number; completed: boolean;
}
interface Monthly {
  courses_target: number; courses_done: number;
  xp_target: number; xp_earned: number;
  reward_xp: number; completed: boolean;
}

function startOfWeek(): string {
  const d = new Date();
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
function startOfMonth(): string {
  const d = new Date();
  d.setDate(1); d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function ChallengesCard({ userId }: { userId: string }) {
  const [weekly, setWeekly] = useState<Weekly | null>(null);
  const [monthly, setMonthly] = useState<Monthly | null>(null);

  useEffect(() => {
    (async () => {
      const week = startOfWeek();
      const month = startOfMonth();

      // Fetch or seed weekly
      let { data: w } = await supabase.from("weekly_challenges").select("*")
        .eq("user_id", userId).eq("week_start", week).maybeSingle();
      if (!w) {
        const { data: created } = await supabase.from("weekly_challenges").insert({
          user_id: userId, week_start: week
        }).select().maybeSingle();
        w = created;
      }
      // Sync from real progress
      if (w) {
        const weekStart = new Date(week);
        const { data: prog } = await supabase.from("lesson_progress")
          .select("mastery_percent,completed_at")
          .eq("user_id", userId)
          .gte("updated_at", weekStart.toISOString());
        const lessonsDone = (prog ?? []).filter((p: any) => p.mastery_percent >= 80).length;
        const { data: streak } = await supabase.from("user_streaks").select("current_streak").eq("user_id", userId).maybeSingle();
        const cur = streak?.current_streak ?? 0;
        const updated: Weekly = {
          ...(w as any),
          lessons_done: lessonsDone,
          streak_reached: cur,
        };
        if (lessonsDone !== w.lessons_done || cur !== w.streak_reached) {
          await supabase.from("weekly_challenges").update({
            lessons_done: lessonsDone, streak_reached: cur,
          }).eq("user_id", userId).eq("week_start", week);
        }
        setWeekly(updated);
      }

      // Fetch or seed monthly
      let { data: m } = await supabase.from("monthly_challenges").select("*")
        .eq("user_id", userId).eq("month_start", month).maybeSingle();
      if (!m) {
        const { data: created } = await supabase.from("monthly_challenges").insert({
          user_id: userId, month_start: month
        }).select().maybeSingle();
        m = created;
      }
      if (m) setMonthly(m as any);
    })();
  }, [userId]);

  const wPct = weekly ? Math.min(100, Math.round((weekly.lessons_done / Math.max(1, weekly.lessons_target)) * 100)) : 0;
  const mPct = monthly ? Math.min(100, Math.round((monthly.xp_earned / Math.max(1, monthly.xp_target)) * 100)) : 0;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-accent" />
          <h3 className="font-display font-bold text-primary">تحدّي الأسبوع</h3>
          <span className="mr-auto text-xs text-gold font-display font-bold">+{weekly?.reward_xp ?? 50} XP</span>
        </div>
        {weekly ? (
          <>
            <div className="text-sm text-muted-foreground mb-1 flex justify-between">
              <span>أتمم {weekly.lessons_target} دروس</span>
              <span className="font-bold text-primary">{weekly.lessons_done}/{weekly.lessons_target}</span>
            </div>
            <Progress value={wPct} className="h-2 mb-3" />
            <div className="text-xs text-muted-foreground flex justify-between">
              <span>سلسلة {weekly.streak_target} أيام</span>
              <span className="font-semibold">{weekly.streak_reached}/{weekly.streak_target} 🔥</span>
            </div>
          </>
        ) : <div className="text-sm text-muted-foreground">جاري التحميل…</div>}
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="h-5 w-5 text-accent" />
          <h3 className="font-display font-bold text-primary">تحدّي الشهر</h3>
          <span className="mr-auto text-xs text-gold font-display font-bold">+{monthly?.reward_xp ?? 200} XP</span>
        </div>
        {monthly ? (
          <>
            <div className="text-sm text-muted-foreground mb-1 flex justify-between">
              <span>اربح {monthly.xp_target} نقطة</span>
              <span className="font-bold text-primary">{monthly.xp_earned}/{monthly.xp_target}</span>
            </div>
            <Progress value={mPct} className="h-2 mb-3" />
            <div className="text-xs text-muted-foreground flex justify-between">
              <span>أكمل {monthly.courses_target} دورة</span>
              <span className="font-semibold">{monthly.courses_done}/{monthly.courses_target} <Trophy className="inline h-3 w-3 text-gold" /></span>
            </div>
          </>
        ) : <div className="text-sm text-muted-foreground">جاري التحميل…</div>}
      </Card>
    </div>
  );
}