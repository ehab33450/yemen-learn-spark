import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Target, Users, Sparkles, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MotivationBanner } from "@/components/motivation/MotivationBanner";
import founderImg from "@/assets/founder-ihab.jpg";

const About = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MotivationBanner />

      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container max-w-4xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl font-extrabold mb-4"
          >
            من نحن
          </motion.h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            قصة شاب يمني قرّر ألا ينتظر… وبدأ بنفسه.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-[280px_1fr] gap-8 items-center mb-16">
            <div className="mx-auto">
              <img
                src={founderImg}
                alt="إيهاب المزلم — مؤسّس منصة يمن أفضل"
                width={280}
                height={280}
                className="rounded-2xl shadow-elegant w-[260px] h-[260px] object-cover ring-4 ring-gold/30"
                loading="lazy"
              />
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold text-primary mb-2">إيهاب المزلم</h2>
              <p className="text-accent font-display font-semibold mb-4">مؤسّس المنصة • طالب يمني</p>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p className="text-lg">
                  أنا <span className="font-bold text-primary">إيهاب المزلم</span>، طالب يمني أعاني — كما يعاني أي شابٍ يمني — من غلاء التعليم،
                  وضعف الفُرص، وانقطاع الكهرباء، وضيق الإنترنت.
                </p>
                <p>
                  لكنّي قرّرت ألا أنتظر. قرّرت أن أصنع شيئاً <span className="font-semibold text-foreground">يستفيد منه الجميع</span>،
                  ونبني به <span className="font-semibold text-accent">يمناً أفضل</span> بأيدينا نحن — جيلٌ تعلّم على ضوء الشموع،
                  وحَلِم رغم كل شيء.
                </p>
                <p>
                  هذه المنصة ليست منتجاً تجارياً. هي <span className="font-semibold">رسالة</span>: أنّ الشاب اليمني يستطيع أن يتعلّم،
                  ويُعلّم، ويبني… حتى لو بدأ من الصفر.
                </p>
              </div>
            </div>
          </div>

          {/* Intro video placeholder */}
          <Card className="overflow-hidden mb-16 bg-gradient-hero text-primary-foreground border-gold/20">
            <div className="aspect-video relative flex items-center justify-center bg-primary/40">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: "radial-gradient(circle at 30% 50%, hsl(var(--gold) / 0.4) 0%, transparent 60%)"
              }} />
              <div className="relative z-10 text-center px-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-gold text-primary mb-4 animate-pulse-gold">
                  <Play className="h-9 w-9" fill="currentColor" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-2">الفيديو التعريفي قادم قريباً</h3>
                <p className="text-primary-foreground/70 max-w-md mx-auto">
                  فيديو بالذكاء الاصطناعي يعرّفك بالمنصة وكيف تستخدمها لتحقيق أهدافك.
                </p>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-5 mb-16">
            {[
              { icon: Heart, title: "بدأت من ألمٍ حقيقي", desc: "لم أبنِ هذه المنصة من برج عاجي. بنيتُها لأنّي عشتُ ما تعيشه." },
              { icon: Target, title: "هدفنا واحد", desc: "أن يصل التعليم لكل شابٍ يمني، مجاناً، أينما كان، ومهما كانت ظروفه." },
              { icon: Users, title: "نبنيها معاً", desc: "أنت لست متلقّياً فقط — أنت شريكٌ في صناعة جيلٍ يمني جديد." },
            ].map((v, i) => (
              <Card key={i} className="p-6 glass-card">
                <v.icon className="h-8 w-8 text-accent mb-3" />
                <h3 className="font-display font-bold text-lg text-primary mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </Card>
            ))}
          </div>

          {/* How to use */}
          <Card className="p-8 mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-7 w-7 text-gold" />
              <h2 className="font-display text-2xl font-bold text-primary">كيف تستخدم المنصة؟</h2>
            </div>
            <ol className="space-y-4">
              {[
                "أنشئ حساباً مجانياً (دقيقة واحدة).",
                "اختر مساراً يُلامس طموحك: لغات، وعي، دين، أو تقنية.",
                "ابدأ أوّل درس — شاهد، اقرأ، طبّق، وأجب على الاختبار.",
                "اربح نقاط XP وشارات، وحافظ على سلسلة يومية لا تنقطع.",
                "انضم لمجموعة نقاش مع 9 طلاب آخرين في نفس الدورة.",
                "اسأل المساعد الذكي 24/7 عند أي صعوبة.",
                "أكمل الدورة → احصل على شهادتك → شاركها بفخر.",
              ].map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-gold text-primary font-display font-bold text-sm">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-foreground/80">{step}</p>
                </li>
              ))}
            </ol>
          </Card>

          <div className="text-center">
            <Button size="lg" onClick={() => navigate("/auth?mode=signup")} className="bg-gradient-gold text-primary font-display font-bold px-10">
              ابدأ رحلتك الآن
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;