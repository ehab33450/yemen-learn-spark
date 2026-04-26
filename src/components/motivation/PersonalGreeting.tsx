import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Props { context?: "tracks" | "leaderboard" | "groups" | "achievements" | "course" | "lesson"; }

const CONTEXT_MSG: Record<string, (n: string) => string> = {
  tracks:       (n) => `يا ${n}، اختر مساراً يُلهم قلبك — وستجد فيه نفسك 🌟`,
  leaderboard:  (n) => `${n}، الصدارة ليست حظاً — هي عمل يومي. اصعد!`,
  groups:       (n) => `يا ${n}، رفقة العلم بركة. شاركهم سؤالاً اليوم 💬`,
  achievements: (n) => `${n}، كل شارة هنا هي قصة تعب… وانتصار 🏅`,
  course:       (n) => `${n}، أنت على بُعد دروس قليلة من إتقان جديد 📚`,
  lesson:       (n) => `ركّز يا ${n} — هذه الدقائق ستفتح أبواباً ✨`,
};

export function PersonalGreeting({ context = "tracks" }: Props) {
  const { user } = useAuth();
  const [name, setName] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setName(((data?.display_name || user.email?.split("@")[0] || "صديقي").split(" ")[0])));
  }, [user]);

  if (!user || !name) return null;
  const msg = CONTEXT_MSG[context](name);

  return (
    <div className="rounded-2xl border border-gold/30 bg-gradient-to-l from-gold/10 via-background to-background px-4 py-3 mb-6 flex items-center gap-3">
      <Sparkles className="h-4 w-4 text-gold shrink-0" />
      <p className="font-display text-sm text-primary">{msg}</p>
    </div>
  );
}