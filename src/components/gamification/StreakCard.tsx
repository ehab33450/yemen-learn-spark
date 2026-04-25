import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props { userId: string }

export function StreakCard({ userId }: Props) {
  const [streak, setStreak] = useState({ current: 0, longest: 0 });

  useEffect(() => {
    supabase
      .from("user_streaks")
      .select("current_streak,longest_streak")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setStreak({ current: data.current_streak, longest: data.longest_streak });
      });
  }, [userId]);

  return (
    <Card className="p-5 relative overflow-hidden">
      <div className="absolute -left-4 -top-4 text-7xl opacity-10">🔥</div>
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <Flame className={`h-5 w-5 text-accent ${streak.current > 0 ? "animate-flame" : ""}`} />
          <span className="text-sm text-muted-foreground">سلسلة التعلم</span>
        </div>
        <div className="font-display text-3xl font-extrabold text-primary">
          {streak.current} <span className="text-sm font-normal text-muted-foreground">يوم</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          الأطول: <span className="font-bold">{streak.longest}</span> يوم
        </p>
      </div>
    </Card>
  );
}