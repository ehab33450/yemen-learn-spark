import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, Users, Award, Trophy, Heart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo-yemen-afdal.png";
import founderImg from "@/assets/founder-ihab.jpg";

const signInSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل"),
});
const signUpSchema = signInSchema.extend({
  displayName: z.string().trim().min(2, "الاسم قصير").max(60, "الاسم طويل"),
});

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(
    params.get("mode") === "signin" ? "signin" : "signup"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  // Logged-in users skip this page entirely
  useEffect(() => {
    if (authLoading || !user) return;
    (async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("welcomed_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profile && !profile.welcomed_at) {
        navigate("/welcome", { replace: true });
      } else {
        navigate("/my-learning", { replace: true });
      }
    })();
  }, [user, authLoading, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const parsed = signUpSchema.safeParse({ email, password, displayName });
        if (!parsed.success) {
          toast.error(parsed.error.errors[0].message);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/welcome`,
            data: { display_name: parsed.data.displayName },
          },
        });
        if (error) throw error;
        toast.success("تم إنشاء حسابك! تحقق من بريدك لتأكيد التسجيل.");
      } else {
        const parsed = signInSchema.safeParse({ email, password });
        if (!parsed.success) {
          toast.error(parsed.error.errors[0].message);
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        toast.success("مرحباً بعودتك!");
        navigate("/my-learning");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ ما";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/welcome`,
    });
    if (result.error) {
      toast.error("تعذّر تسجيل الدخول عبر Google");
      setLoading(false);
    }
  };

  const features = [
    { icon: BookOpen, label: "محتوى عربي مختار" },
    { icon: Users, label: "مجموعات نقاش" },
    { icon: Trophy, label: "تحديات وشارات" },
    { icon: Award, label: "شهادات إنجاز" },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero text-primary-foreground font-body relative overflow-hidden">
      {/* Decorative background */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 30%, hsl(38 62% 55% / 0.4) 0%, transparent 45%), radial-gradient(circle at 85% 75%, hsl(0 80% 45% / 0.25) 0%, transparent 45%)",
        }}
      />

      {/* Top brand bar */}
      <header className="relative z-10 container flex items-center justify-between py-5">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="شعار يمن أفضل" width={44} height={44} className="h-11 w-11 object-contain" />
          <div className="flex flex-col leading-tight">
            <span className="font-display font-bold text-gold text-lg">يمن أفضل</span>
            <span className="text-[11px] text-primary-foreground/70">تعلّم. تواصل. ارتقِ.</span>
          </div>
        </Link>
        <Badge className="hidden sm:inline-flex bg-gold/15 text-gold border-gold/30 font-display">🇾🇪 صناعة يمنية</Badge>
      </header>

      <main className="relative z-10 container pb-16 pt-4">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* === RIGHT (intro on RTL) === */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight mb-5">
              <span className="text-gradient-gold">يمن أفضل</span>
              <br />
              يبدأ بك أنت.
            </h1>

            {/* Founder mini-card */}
            <Card className="glass-card border-gold/20 bg-primary-foreground/5 backdrop-blur mb-6">
              <CardContent className="p-5 flex gap-4 items-center">
                <img
                  src={founderImg}
                  alt="إيهاب المزلم — مؤسّس المنصة"
                  width={120}
                  height={120}
                  className="h-20 w-20 rounded-2xl object-cover ring-2 ring-gold/40 shrink-0"
                />
                <div>
                  <p className="font-display font-bold text-base text-gold mb-1">
                    إيهاب المزلم — مؤسّس المنصة
                  </p>
                  <p className="text-sm text-primary-foreground/85 leading-relaxed">
                    "أنا شابٌ يمنيّ مثلك تماماً. أردتُ أن أصنع منصةً تجمع أفضل ما يحتاجه شبابنا
                    للتعلّم والارتقاء — مجاناً، وبأيدينا."
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* What you get */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="text-center p-3 rounded-xl bg-primary-foreground/8 border border-gold/15 backdrop-blur-sm"
                >
                  <f.icon className="h-5 w-5 mx-auto mb-1.5 text-gold" />
                  <span className="font-display text-xs leading-tight block">{f.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
              <ShieldCheck className="h-4 w-4 text-gold" />
              <span>مجاناً تماماً · بياناتك محفوظة · أكثر من 1,200 طالب</span>
            </div>
          </motion.section>

          {/* === LEFT (auth card) === */}
          <motion.section
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="order-1 lg:order-2"
          >
            <Card className="glass-card border-gold/20 shadow-elegant">
              <CardContent className="p-6 md:p-8">
                <div className="text-center mb-5">
                  <Sparkles className="h-8 w-8 text-gold mx-auto mb-2" />
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {mode === "signup" ? "ابدأ رحلتك الآن" : "أهلاً بعودتك"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {mode === "signup"
                      ? "أنشئ حسابك المجاني وادخل إلى المسارات"
                      : "سجّل الدخول لمتابعة تعلّمك"}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full mb-3"
                  onClick={handleGoogle}
                  disabled={loading}
                >
                  <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.1A6.61 6.61 0 0 1 5.5 12c0-.73.13-1.44.35-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83z"/>
                    <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 1.45 14.97.5 12 .5A10.99 10.99 0 0 0 2.18 7.07l3.66 2.83C6.71 6.68 9.14 4.75 12 4.75z"/>
                  </svg>
                  المتابعة عبر Google
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">أو بالبريد الإلكتروني</span>
                  </div>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-3">
                  {mode === "signup" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="displayName">الاسم الكامل</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="محمد علي"
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-gold text-primary font-display font-bold text-base hover:opacity-90"
                    disabled={loading}
                  >
                    {loading ? "..." : mode === "signup" ? "إنشاء الحساب والبدء" : "تسجيل الدخول"}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-4">
                  {mode === "signup" ? "لديك حساب بالفعل؟" : "ليس لديك حساب؟"}{" "}
                  <button
                    onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                    className="text-accent font-medium hover:underline"
                  >
                    {mode === "signup" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
                  </button>
                </p>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </main>

      <footer className="relative z-10 border-t border-primary-foreground/10 py-6">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-primary-foreground/60">
          <div className="flex items-center gap-2">
            <Heart className="h-3.5 w-3.5 text-accent" />
            <span>© 2026 يمن أفضل · منصة صنعها شابٌ يمني · صُنع بـ ❤️ في اليمن.</span>
          </div>
          <Link to="/about" className="hover:text-gold transition-colors">من نحن</Link>
        </div>
      </footer>
    </div>
  );
};

export default Index;
