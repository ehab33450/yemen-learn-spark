import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";

interface Row {
  user_id: string;
  display_name: string;
  xp_points: number;
  level: number;
  avatar_url: string | null;
}

export function Leaderboard({ currentUserId }: { currentUserId?: string }) {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("user_id,display_name,xp_points,level,avatar_url")
      .order("xp_points", { ascending: false })
      .limit(10)
      .then(({ data }) => setRows((data ?? []) as Row[]));
  }, []);

  const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-gold" />
        <h2 className="font-display font-bold text-primary">المتصدّرون</h2>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">لا يوجد متصدّرون بعد — كن الأول!</p>
      ) : (
        <ol className="space-y-2">
          {rows.map((r, i) => {
            const isMe = r.user_id === currentUserId;
            return (
              <li
                key={r.user_id}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  isMe ? "bg-gold/15 border border-gold/40" : "hover:bg-secondary/50"
                }`}
              >
                <span className="w-7 text-center font-display font-bold text-primary">{medal(i)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate text-primary">
                    {r.display_name} {isMe && <span className="text-xs text-accent">(أنت)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">المستوى {r.level}</p>
                </div>
                <span className="font-display font-bold text-accent">{r.xp_points} XP</span>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}