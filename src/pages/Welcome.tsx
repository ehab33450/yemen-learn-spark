import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Globe, Brain, BookOpen, Cpu } from "lucide-react";

const messages = [
  "خطوة صغيرة اليوم… إنجاز كبير غداً",
  "لا أحد يبدأ قوياً… لكن كل قوي بدأ",
  "مستقبلك يحتاج هذا القرار",
  "تعلم اليوم… لتقود غداً",
  "لا تضيع وقتك… استثمره",
];

const trackChoices = [
  { slug: "languages", label: "الإنجليزية", icon: Globe, color: "from-blue-500 to-cyan-500" },
  { slug: "awareness", label: "تطوير الذات", icon: Brain, color: "from-purple-500 to-pink-500" },
  { slug: "religious", label: "الدين", icon: BookOpen, color: "from-emerald-500 to-teal-500" },
  { slug: "tech", label: "المهارات التقنية", icon: Cpu, color: "from-amber-500 to-orange-500" },
];

const Welcome = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [step, setStep] = useState(0);
  const [msg] = useState(() => messages[Math.floor(Math.random() * messages.length)]);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  const choose = async (slug: string) => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ preferred_track: slug, welcomed_at: new Date().toISOString() })
      .eq("user_id", user.id);
    navigate(`/tracks/${slug}`);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {step === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Card className="p-8 md:p-12 text-center bg-card/95 backdrop-blur">
              <div className="text-5xl mb-4">🎉</div>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-primary mb-6">
                أهلاً بك في منصة الشباب اليمني
              </h1>
              <div className="space-y-3 text-foreground/80 leading-loose mb-6">
                <p>اليوم ليس يوماً عادياً… اليوم هو بداية جديدة لك.</p>
                <p>كل مهارة تتعلمها هنا، كل درس تكمله، كل دقيقة تقضيها في التعلم… تقربك من نسخة أقوى منك.</p>
                <p className="text-accent font-semibold">💡 الأمم لا تُبنى بالكلام، بل تُبنى بالشباب الذين يقررون أن يتعلموا ويتغيروا.</p>
                <p>🇾🇪 على يديك يبدأ التغيير… ومن هنا يبدأ بناء الوطن.</p>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg mb-6 italic text-sm flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                {msg}
              </div>
              <Button
                size="lg"
                onClick={() => setStep(1)}
                className="bg-gradient-gold text-primary font-display font-bold w-full md:w-auto px-10"
              >
                🚀 ابدأ رحلتك الآن
              </Button>
            </Card>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-8 bg-card/95 backdrop-blur">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-primary text-center mb-2">
                ماذا تريد أن تتعلم؟
              </h2>
              <p className="text-center text-muted-foreground mb-8">اختر مساراً للبداية — يمكنك تجربة الباقي لاحقاً</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {trackChoices.map((t) => (
                  <button
                    key={t.slug}
                    onClick={() => choose(t.slug)}
                    className={`group p-6 rounded-xl bg-gradient-to-br ${t.color} text-white text-right hover:scale-[1.02] transition-transform shadow-lg`}
                  >
                    <t.icon className="h-8 w-8 mb-3" />
                    <div className="font-display font-bold text-xl">{t.label}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigate("/tracks")}
                className="mt-6 w-full text-sm text-muted-foreground hover:text-accent"
              >
                تخطي → استعرض كل المسارات
              </button>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Welcome;