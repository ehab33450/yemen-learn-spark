import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";

const signInSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل"),
});

const signUpSchema = signInSchema.extend({
  displayName: z.string().trim().min(2, "الاسم قصير").max(60, "الاسم طويل"),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

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
            emailRedirectTo: `${window.location.origin}/dashboard`,
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
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) throw error;
        toast.success("مرحباً بعودتك!");
        navigate("/dashboard");
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
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/dashboard` });
    if (result.error) {
      toast.error("تعذّر تسجيل الدخول عبر Google");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6 text-primary-foreground">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-gold">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <span className="font-display font-bold text-xl">YYL</span>
        </Link>
        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">
              {mode === "signup" ? "إنشاء حساب" : "تسجيل الدخول"}
            </CardTitle>
            <CardDescription>
              {mode === "signup" ? "انضم إلى آلاف المتعلمين مجاناً" : "أهلاً بعودتك إلى رحلة التعلم"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
              <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1A6.61 6.61 0 0 1 5.5 12c0-.73.13-1.44.35-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 1.45 14.97.5 12 .5A10.99 10.99 0 0 0 2.18 7.07l3.66 2.83C6.71 6.68 9.14 4.75 12 4.75z"/></svg>
              المتابعة عبر Google
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">أو</span></div>
            </div>
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="displayName">الاسم الكامل</Label>
                  <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="محمد علي" required />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
              </div>
              <Button type="submit" className="w-full bg-gradient-gold text-primary font-display font-semibold" disabled={loading}>
                {loading ? "..." : mode === "signup" ? "إنشاء الحساب" : "دخول"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground">
              {mode === "signup" ? "لديك حساب بالفعل؟" : "ليس لديك حساب؟"}{" "}
              <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="text-accent font-medium hover:underline">
                {mode === "signup" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;