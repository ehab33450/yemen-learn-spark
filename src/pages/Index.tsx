import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { GraduationCap, Sparkles, Trophy, Users, BookOpen, Award, Zap, Heart, Star, Download, Target, Play, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { supabase } from "@/integrations/supabase/client";
import { MotivationBanner } from "@/components/motivation/MotivationBanner";
import studentsImg from "@/assets/students-library.jpg";
import founderImg from "@/assets/founder-ihab.jpg";

const tracks = [
  { id: "languages", title: "مسار اللغات", subtitle: "English from zero", emoji: "🌍", description: "تعلم الإنجليزية بأفضل المصادر العربية والعالمية." },
  { id: "awareness", title: "مسار الوعي", subtitle: "Self development", emoji: "🧠", description: "تطوير الذات، إدارة الوقت، العادات، التواصل." },
  { id: "religious", title: "المسار الديني", subtitle: "Religious sciences", emoji: "📖", description: "علوم القرآن والسيرة والفقه بأسلوب مبسّط." },
  { id: "tech", title: "المسار التقني", subtitle: "Tech & AI", emoji: "💻", description: "الحاسوب، AI، التصميم، العمل الحر." },
];

interface FeaturedCourse {
  id: string; slug: string; title: string; description: string | null;
  level: string | null; duration: string | null; emoji: string | null;
}

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const Index = () => {
  const navigate = useNavigate();
  const [featuredCourses, setFeaturedCourses] = useState<FeaturedCourse[]>([]);
  useEffect(() => {
    supabase
      .from("courses")
      .select("id,slug,title,description,level,duration,emoji")
      .eq("is_published", true)
      .order("sort_order")
      .limit(4)
      .then(({ data }) => setFeaturedCourses(data ?? []));
  }, []);

  return (
    <div className="min-h-screen bg-background font-body">
      <Header />
      <MotivationBanner />

      {/* === HERO === */}
      <section className="bg-gradient-hero text-primary-foreground py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle at 20% 50%, hsl(38 62% 55% / 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(0 80% 45% / 0.2) 0%, transparent 40%)"}} />
        <div className="container relative z-10 grid md:grid-cols-2 gap-10 items-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{duration: 0.6}}>
            <Badge className="mb-5 bg-gold/20 text-gold border-gold/30 font-display">🇾🇪 صناعة يمنية</Badge>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5">
              <span className="text-gradient-gold">يمن أفضل</span><br />
              يبدأ بك أنت.
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-7 leading-relaxed">
              منصة تعلّم ذاتي للشباب اليمني — تعلّم بخطوتك، تواصل مع زملائك في مجموعات نقاش،
              واحصل على شهادات تفتح لك أبواباً جديدة.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={() => navigate("/auth?mode=signup")} className="bg-gradient-gold text-primary font-display font-bold text-lg hover:opacity-90 px-8">
                ابدأ رحلتك الآن
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/about")} className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-display">
                <Play className="ml-2 h-4 w-4" /> تعرّف علينا
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <img
              src={studentsImg}
              alt="طلاب يمنيون يتعلّمون في مكتبة"
              width={1536}
              height={1024}
              className="rounded-2xl shadow-elegant ring-2 ring-gold/20 object-cover w-full aspect-[4/3]"
            />
            <div className="absolute -bottom-4 -right-4 bg-gradient-gold text-primary px-4 py-2 rounded-xl shadow-elegant font-display font-bold text-sm">
              +1,200 طالب يتعلّمون الآن
            </div>
          </motion.div>
        </div>

        {/* Stats strip */}
        <div className="container relative z-10 mt-14">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{duration:0.6, delay:0.3}} className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { icon: BookOpen, label: "+50 دورة عربية" },
              { icon: Users, label: "مجموعات نقاش" },
              { icon: Trophy, label: "لوحة شرف" },
              { icon: Award, label: "شهادات إنجاز" },
            ].map((s, i) => (
              <div key={i} className="text-center p-3 rounded-xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10">
                <s.icon className="h-5 w-5 mx-auto mb-1.5 text-gold" />
                <span className="font-display font-semibold text-sm">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* === FOUNDER STORY === */}
      <section className="py-16 bg-secondary/40">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-[200px_1fr] gap-8 items-center">
            <img
              src={founderImg}
              alt="إيهاب المزلم — مؤسّس المنصة"
              width={400} height={400}
              loading="lazy"
              className="rounded-2xl shadow-elegant w-[180px] h-[180px] object-cover ring-4 ring-gold/30 mx-auto"
            />
            <div>
              <Badge className="mb-3 bg-accent/10 text-accent border-accent/30">قصّة المؤسّس</Badge>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-3">
                "أنا طالب يمني… مثلك تماماً."
              </h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                أنا <span className="font-bold text-primary">إيهاب المزلم</span>، أعاني كما يعاني أي شاب يمني من ضيق الفُرص.
                قرّرت أن أصنع شيئاً يستفيد منه الجميع، ونبني به يمناً أفضل بأيدينا.
              </p>
              <Button variant="outline" onClick={() => navigate("/about")} className="font-display">
                اقرأ القصّة كاملةً ←
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* === TRACKS === */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-3">المسارات التعليمية</h2>
            <p className="text-muted-foreground text-lg">اختر المسار الذي يناسبك وابدأ رحلة التعلم</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tracks.map((track, i) => (
              <motion.div key={track.id} initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeUp} transition={{duration:0.5, delay:i*0.15}}>
                <Card className="glass-card h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                  <CardHeader className="pb-3">
                    <div className="text-4xl mb-3">{track.emoji}</div>
                    <CardTitle className="font-display text-xl">{track.title}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">{track.subtitle}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">{track.description}</p>
                  </CardContent>
                  <CardFooter>
              <Button variant="outline" onClick={() => navigate(`/tracks/${track.id}`)} className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors font-display text-sm">استكشف المسار</Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === FEATURES === */}
      <section className="py-20">
        <div className="container">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-primary mb-12">ما الذي يميّزنا؟</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Zap, title: "نظام نقاط XP", desc: "اكسب نقاط خبرة مع كل درس وارتقِ في المستويات.", color: "text-gold" },
              { icon: Award, title: "شهادات إنجاز", desc: "أكمل الدورة، احصل على شهادتك، شاركها.", color: "text-accent" },
              { icon: MessageSquare, title: "مجموعات نقاش", desc: "10 طلاب لكل دورة، تتناقشون وتتعلّمون معاً.", color: "text-emerald" },
              { icon: Trophy, title: "تحديات أسبوعية", desc: "تحديات ممتعة تحفزك على الاستمرار.", color: "text-gold" },
              { icon: Star, title: "محتوى عربي مختار", desc: "أفضل الفيديوهات العربية على يوتيوب، مُرتّبة لك.", color: "text-accent" },
              { icon: Sparkles, title: "مساعد ذكي 24/7", desc: "اسأله عن أي درس، يشرح لك بأسلوبك.", color: "text-emerald" },
            ].map((f, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeUp} transition={{duration:0.4, delay:i*0.1}}>
                <Card className="glass-card h-full p-6">
                  <f.icon className={`h-8 w-8 mb-3 ${f.color}`} />
                  <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === POPULAR COURSES === */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-primary mb-12">دورات مميزة</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {featuredCourses.map((course, i) => (
              <motion.div key={course.id} initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeUp} transition={{duration:0.4, delay:i*0.1}}>
                <Card className="glass-card h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                  <div className="h-32 bg-gradient-hero flex items-center justify-center text-5xl">{course.emoji}</div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{course.level}</Badge>
                      <span className="text-xs text-muted-foreground">{course.duration}</span>
                    </div>
                    <CardTitle className="font-display text-base leading-snug">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-muted-foreground text-xs line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      {course.duration && <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {course.duration}</span>}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild size="sm" className="w-full bg-gradient-gold text-primary font-display font-semibold hover:opacity-90">
                      <Link to={`/courses/${course.slug}`}>عرض التفاصيل</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA === */}
      <section className="py-20">
        <div className="container max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeUp} transition={{duration:0.6}} className="bg-gradient-hero rounded-2xl p-10 md:p-16 text-center text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{backgroundImage:"radial-gradient(circle at 30% 70%, hsl(38 62% 55% / 0.4) 0%, transparent 50%)"}} />
            <div className="relative z-10">
              <Sparkles className="h-10 w-10 mx-auto mb-4 text-gold" />
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">يمنٌ أفضل يبدأ بخطوة منك</h2>
              <p className="text-primary-foreground/80 mb-8 text-lg">انضم لآلاف الشباب الذين قرّروا أن يصنعوا فرقاً بأنفسهم.</p>
              <Button size="lg" onClick={() => navigate("/auth?mode=signup")} className="bg-gradient-gold text-primary font-display font-bold text-lg hover:opacity-90 px-10">انضم الآن</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-gold">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">يمن أفضل</h3>
                <p className="text-sm text-primary-foreground/60">منصة تعلّم بناها يمنيون لليمنيين.</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-primary-foreground/50">
              <Heart className="h-4 w-4 text-accent" />
              <span>© 2025 يمن أفضل. صُنع بـ ❤️ في اليمن.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
