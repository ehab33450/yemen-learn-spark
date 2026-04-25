import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const MESSAGES = [
  (n: string) => `استمر يا ${n} 💪 — كل دقيقة تتعلّم فيها تقرّبك من حلمك.`,
  (n: string) => `${n}، اليمن يحتاجك مُتعلّماً، لا متفرّجاً 🇾🇪`,
  (n: string) => `يا ${n}، الصعوبات اليوم تصنع البطل غداً ⭐`,
  (n: string) => `${n}، خطوة واحدة كل يوم… وستصل أبعد ممّا تتخيّل 🚀`,
  (n: string) => `أنت تستحق الأفضل يا ${n}. ابدأ درساً جديداً الآن 📚`,
  (n: string) => `${n}، التميّز عادة. ابدأها اليوم 🔥`,
  (n: string) => `لا تستسلم يا ${n} — بعد التعب يأتي الإتقان 🌟`,
  (n: string) => `يا ${n}، علّم نفسك… ثم علّم غيرك. هكذا نُغيّر اليمن 🤝`,
];

export const MotivationBanner = () => {
  const { user } = useAuth();
  const [name, setName] = useState<string>("");
  const [msg, setMsg] = useState<string>("");
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (!user) return;
    const dismissedKey = `motiv_dismissed_${new Date().toISOString().slice(0,10)}`;
    if (sessionStorage.getItem(dismissedKey)) { setClosed(true); return; }
    (async () => {
      const { data } = await supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle();
      const n = (data?.display_name || user.email?.split("@")[0] || "صديقي").split(" ")[0];
      setName(n);
      const idx = (Date.now() / (1000 * 60 * 60 * 6)) | 0; // changes every ~6 hours
      setMsg(MESSAGES[idx % MESSAGES.length](n));
    })();
  }, [user]);

  if (!user || closed || !msg) return null;

  return (
    <div className="bg-gradient-gold text-primary px-4 py-2.5 relative">
      <div className="container flex items-center gap-3">
        <Sparkles className="h-4 w-4 shrink-0" />
        <p className="font-display text-sm font-semibold flex-1 truncate">{msg}</p>
        <button
          onClick={() => {
            sessionStorage.setItem(`motiv_dismissed_${new Date().toISOString().slice(0,10)}`, "1");
            setClosed(true);
          }}
          className="opacity-70 hover:opacity-100 transition-opacity"
          aria-label="إغلاق"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};