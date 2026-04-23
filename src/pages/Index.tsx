import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { GraduationCap, Sparkles, Trophy, Users, BookOpen, Award, Zap, Heart, Star, Download, Target } from "lucide-react";
import { tracks } from "@/data/tracks";
import { courses } from "@/data/courses";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const Index = () => {
  const featuredCourses = courses.slice(0, 4);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background font-body">
      <Header />

      {/* === HERO === */}
      <section className="bg-gradient-hero text-primary-foreground py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle at 20% 50%, hsl(38 62% 55% / 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(0 80% 45% / 0.2) 0%, transparent 40%)"}} />
        <div className="container relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{duration: 0.6}} className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-gold/20 text-gold border-gold/30 font-display">مجاني 100%</Badge>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              تعلّم مجاناً.<br />
              <span className="text-gradient-gold">تميّز حقيقياً.</span><br />
              انطلق بقوة.
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">منصة تعليمية مجانية 100% للشباب اليمني. لغات، علوم دينية، ومهارات تقنية وذكاء اصطناعي.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => navigate("/auth?mode=signup")} className="bg-gradient-gold text-primary font-display font-bold text-lg hover:opacity-90 px-8">ابدأ التعلم الآن</Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/courses")} className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-display">استعرض الدورات</Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{duration:0.6, delay:0.3}} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { icon: BookOpen, label: "+50 دورة" },
              { icon: Users, label: "+5,000 طالب" },
              { icon: Target, label: "3 مسارات" },
              { icon: Award, label: "شهادات معتمدة" },
            ].map((s, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10">
                <s.icon className="h-6 w-6 mx-auto mb-2 text-gold" />
                <span className="font-display font-bold text-lg">{s.label}</span>
              </div>
            ))}
          </motion.div>
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
                    <Button variant="outline" onClick={() => navigate(`/courses?track=${track.id}`)} className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors font-display text-sm">استكشف المسار</Button>
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
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-primary mb-12">لماذا منصتنا؟</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Zap, title: "نظام نقاط XP", desc: "اكسب نقاط خبرة مع كل درس وارتقِ في المستويات.", color: "text-gold" },
              { icon: Award, title: "شهادات احترافية", desc: "شهادات قابلة للمشاركة على LinkedIn.", color: "text-accent" },
              { icon: Users, title: "مجتمع طلابي", desc: "تعلم مع آلاف الشباب اليمني الطموح.", color: "text-emerald" },
              { icon: Trophy, title: "تحديات أسبوعية", desc: "تحديات ممتعة تحفزك على الاستمرار.", color: "text-gold" },
              { icon: Star, title: "معلمون متميزون", desc: "معلمون يمنيون متخصصون في كل مجال.", color: "text-accent" },
              { icon: Download, title: "يعمل بدون إنترنت", desc: "حمّل الدروس وتعلم في أي وقت.", color: "text-emerald" },
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
                      <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {course.lessonsCount} درس</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.studentsCount} طالب</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-gold" /> {course.rating}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild size="sm" className="w-full bg-gradient-gold text-primary font-display font-semibold hover:opacity-90">
                      <Link to={`/courses/${course.id}`}>عرض التفاصيل</Link>
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
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">ابدأ رحلتك التعليمية اليوم</h2>
              <p className="text-primary-foreground/80 mb-8 text-lg">انضم لآلاف الشباب اليمني الذين يبنون مستقبلهم معنا. مجاناً وللأبد.</p>
              <Button size="lg" onClick={() => navigate("/auth?mode=signup")} className="bg-gradient-gold text-primary font-display font-bold text-lg hover:opacity-90 px-10">سجّل مجاناً</Button>
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
                <h3 className="font-display font-bold text-lg">منصة الشباب اليمني للتعلم المجاني</h3>
                <p className="text-sm text-primary-foreground/60">التعلم حق، ليس امتيازاً.</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-primary-foreground/50">
              <Heart className="h-4 w-4 text-accent" />
              <span>© 2025 YYL. جميع الحقوق محفوظة.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
