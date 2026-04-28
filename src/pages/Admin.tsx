import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, BookOpen, Send, Award, BarChart3, Bell, Plus, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [stats, setStats] = useState<any>({ students: 0, courses: 0, lessons: 0, certs: 0 });
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  // AI assistant
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // forms
  const [newCourse, setNewCourse] = useState({ track_id: "", title: "", slug: "", description: "", emoji: "📘", duration: "" });
  const [newLesson, setNewLesson] = useState({ module_id: "", title: "", youtube_id: "", description: "", practical_task_prompt: "" });
  const [modules, setModules] = useState<any[]>([]);
  const [msg, setMsg] = useState({ recipient_id: "", title: "", body: "", broadcast: false });
  const [appreciation, setAppreciation] = useState({ user_id: "", title: "شهادة تقدير وتميز", reason: "" });

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
    if (!adminLoading && user && !isAdmin) {
      toast.error("هذه الصفحة مخصصة للأدمن فقط");
      navigate("/dashboard");
    }
  }, [authLoading, adminLoading, user, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const [{ count: students }, { count: cCount }, { count: lCount }, { count: certs }, { data: top }, { data: all }, { data: trk }, { data: crs }, { data: mods }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("lessons").select("*", { count: "exact", head: true }),
        supabase.from("certificates").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("user_id,display_name,xp_points,level,city").order("xp_points", { ascending: false }).limit(20),
        supabase.from("profiles").select("user_id,display_name,xp_points,level,city,updated_at").order("updated_at", { ascending: false }).limit(200),
        supabase.from("tracks").select("*").order("sort_order"),
        supabase.from("courses").select("id,title,track_id").order("sort_order"),
        supabase.from("modules").select("id,title,course_id").order("sort_order"),
      ]);
      setStats({ students: students ?? 0, courses: cCount ?? 0, lessons: lCount ?? 0, certs: certs ?? 0 });
      setTopStudents(top ?? []);
      setAllStudents(all ?? []);
      setTracks(trk ?? []);
      setCourses(crs ?? []);
      setModules(mods ?? []);
    })();
  }, [isAdmin]);

  const askAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-ai-assistant", { body: { prompt: aiPrompt } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setAiReply((data as any).reply);
    } catch (e: any) {
      toast.error(e.message ?? "خطأ في المساعد");
    } finally {
      setAiLoading(false);
    }
  };

  const addCourse = async () => {
    if (!newCourse.track_id || !newCourse.title || !newCourse.slug) { toast.error("املأ الحقول المطلوبة"); return; }
    const { error } = await supabase.from("courses").insert(newCourse as any);
    if (error) return toast.error(error.message);
    toast.success("تمت إضافة الدورة");
    setNewCourse({ track_id: "", title: "", slug: "", description: "", emoji: "📘", duration: "" });
  };

  const addLesson = async () => {
    if (!newLesson.module_id || !newLesson.title || !newLesson.youtube_id) { toast.error("املأ الحقول المطلوبة"); return; }
    const { error } = await supabase.from("lessons").insert({ ...newLesson, practical_task_type: newLesson.practical_task_prompt ? "short_answer" : null } as any);
    if (error) return toast.error(error.message);
    toast.success("تمت إضافة الدرس");
    setNewLesson({ module_id: "", title: "", youtube_id: "", description: "", practical_task_prompt: "" });
  };

  const sendMessage = async () => {
    if (!msg.title || !msg.body) { toast.error("اكتب العنوان والمحتوى"); return; }
    if (!msg.broadcast && !msg.recipient_id) { toast.error("اختر طالباً أو فعّل الإرسال للجميع"); return; }
    const { error } = await supabase.from("admin_messages").insert({
      sender_id: user!.id,
      recipient_id: msg.broadcast ? null : msg.recipient_id,
      is_broadcast: msg.broadcast,
      title: msg.title,
      body: msg.body,
    });
    if (error) return toast.error(error.message);
    toast.success("تم الإرسال");
    setMsg({ recipient_id: "", title: "", body: "", broadcast: false });
  };

  const giveAppreciation = async () => {
    if (!appreciation.user_id || !appreciation.title) { toast.error("اختر طالباً وعنواناً"); return; }
    const { error } = await supabase.from("appreciation_certificates").insert({
      user_id: appreciation.user_id,
      awarded_by: user!.id,
      title: appreciation.title,
      reason: appreciation.reason,
    });
    if (error) return toast.error(error.message);
    toast.success("تم منح شهادة التقدير");
    setAppreciation({ user_id: "", title: "شهادة تقدير وتميز", reason: "" });
  };

  const promoteAdmin = async (uid: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: uid, role: "admin" as any });
    if (error) return toast.error(error.message);
    toast.success("تمت ترقية المستخدم إلى أدمن");
  };

  if (authLoading || adminLoading) {
    return <div className="container py-12"><Skeleton className="h-96 w-full" /></div>;
  }
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-display font-bold">لوحة تحكم المؤسس</h1>
            <p className="text-muted-foreground text-sm">إدارة كاملة للمنصة، الطلاب، والمحتوى</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4"><div className="text-xs text-muted-foreground">الطلاب</div><div className="text-2xl font-bold">{stats.students}</div></Card>
          <Card className="p-4"><div className="text-xs text-muted-foreground">الدورات</div><div className="text-2xl font-bold">{stats.courses}</div></Card>
          <Card className="p-4"><div className="text-xs text-muted-foreground">الدروس</div><div className="text-2xl font-bold">{stats.lessons}</div></Card>
          <Card className="p-4"><div className="text-xs text-muted-foreground">الشهادات</div><div className="text-2xl font-bold">{stats.certs}</div></Card>
        </div>

        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
            <TabsTrigger value="ai"><Sparkles className="h-4 w-4 ml-1" />المساعد</TabsTrigger>
            <TabsTrigger value="students"><Users className="h-4 w-4 ml-1" />الطلاب</TabsTrigger>
            <TabsTrigger value="content"><BookOpen className="h-4 w-4 ml-1" />المحتوى</TabsTrigger>
            <TabsTrigger value="messages"><Send className="h-4 w-4 ml-1" />رسائل</TabsTrigger>
            <TabsTrigger value="appreciation"><Award className="h-4 w-4 ml-1" />تقدير</TabsTrigger>
            <TabsTrigger value="admins"><ShieldCheck className="h-4 w-4 ml-1" />الأدمن</TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-display font-bold mb-2 flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />المساعد الذكي</h3>
              <p className="text-sm text-muted-foreground mb-4">اطلب اقتراح دورات يوتيوب، تحليل الأداء، تنبيهات للطلاب غير النشطين، أو شهادات للمتميزين.</p>
              <Textarea rows={4} value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="مثال: اقترح 5 دورات في تطوير الذات من قنوات يوتيوب عربية، أو: من هم الطلاب الذين يستحقون شهادة تقدير هذا الأسبوع؟" />
              <Button onClick={askAI} disabled={aiLoading} className="mt-3 bg-gradient-gold text-primary font-semibold">{aiLoading ? "جاري التفكير..." : "اسأل المساعد"}</Button>
              {aiReply && (
                <div className="mt-4 p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm leading-relaxed">{aiReply}</div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-display font-bold mb-3 flex items-center gap-2"><BarChart3 className="h-5 w-5" />أفضل 20 طالب</h3>
              <div className="space-y-2">
                {topStudents.map((s, i) => (
                  <div key={s.user_id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <div className="flex items-center gap-3">
                      <span className="font-bold w-6 text-primary">#{i + 1}</span>
                      <div>
                        <div className="font-medium">{s.display_name}</div>
                        <div className="text-xs text-muted-foreground">{s.city ?? "—"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">المستوى {s.level}</Badge>
                      <Badge>{s.xp_points} XP</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="font-display font-bold mb-3">جميع الطلاب ({allStudents.length})</h3>
              <div className="max-h-96 overflow-y-auto space-y-1">
                {allStudents.map(s => (
                  <div key={s.user_id} className="flex justify-between items-center p-2 hover:bg-muted/50 rounded text-sm">
                    <span>{s.display_name}</span>
                    <span className="text-xs text-muted-foreground">{s.xp_points} XP • آخر نشاط: {new Date(s.updated_at).toLocaleDateString("ar")}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-display font-bold mb-3 flex items-center gap-2"><Plus className="h-4 w-4" />إضافة دورة جديدة</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div><Label>المسار</Label>
                  <select className="w-full p-2 rounded border bg-background" value={newCourse.track_id} onChange={e => setNewCourse({ ...newCourse, track_id: e.target.value })}>
                    <option value="">اختر المسار</option>
                    {tracks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                </div>
                <div><Label>عنوان الدورة</Label><Input value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} /></div>
                <div><Label>المعرّف (slug)</Label><Input value={newCourse.slug} onChange={e => setNewCourse({ ...newCourse, slug: e.target.value })} placeholder="my-course" /></div>
                <div><Label>المدة</Label><Input value={newCourse.duration} onChange={e => setNewCourse({ ...newCourse, duration: e.target.value })} placeholder="4 ساعات" /></div>
                <div className="md:col-span-2"><Label>الوصف</Label><Textarea value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} /></div>
              </div>
              <Button onClick={addCourse} className="mt-3">إضافة الدورة</Button>
            </Card>

            <Card className="p-6">
              <h3 className="font-display font-bold mb-3 flex items-center gap-2"><Plus className="h-4 w-4" />إضافة درس / فيديو يوتيوب</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div><Label>الوحدة (Module)</Label>
                  <select className="w-full p-2 rounded border bg-background" value={newLesson.module_id} onChange={e => setNewLesson({ ...newLesson, module_id: e.target.value })}>
                    <option value="">اختر الوحدة</option>
                    {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
                <div><Label>عنوان الدرس</Label><Input value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} /></div>
                <div><Label>YouTube Video ID</Label><Input value={newLesson.youtube_id} onChange={e => setNewLesson({ ...newLesson, youtube_id: e.target.value })} placeholder="dQw4w9WgXcQ" /></div>
                <div><Label>الوصف</Label><Input value={newLesson.description} onChange={e => setNewLesson({ ...newLesson, description: e.target.value })} /></div>
                <div className="md:col-span-2"><Label>المهمة العملية (اختياري)</Label><Textarea value={newLesson.practical_task_prompt} onChange={e => setNewLesson({ ...newLesson, practical_task_prompt: e.target.value })} placeholder="اكتب ملخصاً في 50 كلمة..." /></div>
              </div>
              <Button onClick={addLesson} className="mt-3">إضافة الدرس</Button>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-display font-bold mb-3 flex items-center gap-2"><Bell className="h-4 w-4" />إرسال تعليمات / رسالة للطلاب</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="bc" checked={msg.broadcast} onChange={e => setMsg({ ...msg, broadcast: e.target.checked })} />
                  <Label htmlFor="bc">إرسال لجميع الطلاب</Label>
                </div>
                {!msg.broadcast && (
                  <div><Label>الطالب</Label>
                    <select className="w-full p-2 rounded border bg-background" value={msg.recipient_id} onChange={e => setMsg({ ...msg, recipient_id: e.target.value })}>
                      <option value="">اختر طالباً</option>
                      {allStudents.map(s => <option key={s.user_id} value={s.user_id}>{s.display_name}</option>)}
                    </select>
                  </div>
                )}
                <div><Label>العنوان</Label><Input value={msg.title} onChange={e => setMsg({ ...msg, title: e.target.value })} /></div>
                <div><Label>المحتوى</Label><Textarea rows={4} value={msg.body} onChange={e => setMsg({ ...msg, body: e.target.value })} /></div>
                <Button onClick={sendMessage}><Send className="h-4 w-4 ml-2" />إرسال</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="appreciation" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-display font-bold mb-3 flex items-center gap-2"><Award className="h-4 w-4 text-primary" />منح شهادة تقدير</h3>
              <div className="space-y-3">
                <div><Label>الطالب</Label>
                  <select className="w-full p-2 rounded border bg-background" value={appreciation.user_id} onChange={e => setAppreciation({ ...appreciation, user_id: e.target.value })}>
                    <option value="">اختر طالباً</option>
                    {allStudents.map(s => <option key={s.user_id} value={s.user_id}>{s.display_name} ({s.xp_points} XP)</option>)}
                  </select>
                </div>
                <div><Label>عنوان الشهادة</Label><Input value={appreciation.title} onChange={e => setAppreciation({ ...appreciation, title: e.target.value })} /></div>
                <div><Label>سبب التقدير</Label><Textarea value={appreciation.reason} onChange={e => setAppreciation({ ...appreciation, reason: e.target.value })} placeholder="تفوّق في المسار، إنجاز متميز..." /></div>
                <Button onClick={giveAppreciation} className="bg-gradient-gold text-primary font-semibold"><Award className="h-4 w-4 ml-2" />منح الشهادة</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="admins" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-display font-bold mb-3 flex items-center gap-2"><ShieldCheck className="h-4 w-4" />ترقية مستخدم إلى أدمن</h3>
              <p className="text-sm text-muted-foreground mb-3">اختر مستخدماً موجوداً لمنحه صلاحيات الأدمن الكاملة.</p>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {allStudents.map(s => (
                  <div key={s.user_id} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                    <span className="font-medium">{s.display_name}</span>
                    <Button size="sm" variant="outline" onClick={() => promoteAdmin(s.user_id)}>ترقية إلى أدمن</Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;