import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";

interface Badge {
  id: string; code: string; title: string; description: string | null;
  icon: string | null; xp_reward: number;
}

export function BadgesGrid({ userId }: { userId: string }) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [earned, setEarned] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const { data: all } = await supabase.from("badges").select("*").order("sort_order");
      const { data: mine } = await supabase.from("user_badges").select("badge_id").eq("user_id", userId);
      setBadges((all ?? []) as Badge[]);
      setEarned(new Set((mine ?? []).map((r: any) => r.badge_id)));
    })();
  }, [userId]);

  if (badges.length === 0) return null;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-gold" />
        <h2 className="font-display font-bold text-primary">الشارات</h2>
        <span className="text-xs text-muted-foreground mr-auto">
          {earned.size} / {badges.length}
        </span>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {badges.map((b) => {
          const has = earned.has(b.id);
          return (
            <div
              key={b.id}
              title={`${b.title} — ${b.description ?? ""}`}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-center p-2 transition-all ${
                has
                  ? "bg-gradient-gold text-primary shadow-gold scale-100"
                  : "bg-muted/60 text-muted-foreground grayscale opacity-50"
              }`}
            >
              <span className="text-2xl">{b.icon ?? "🏅"}</span>
              <span className="text-[10px] font-display font-bold mt-1 leading-tight">{b.title}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}