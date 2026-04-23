import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Award, Download } from "lucide-react";

interface Cert {
  id: string; kind: string; issued_at: string;
  course_id: string | null; track_id: string | null;
  course_title?: string; track_title?: string;
}

const Certificates = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [certs, setCerts] = useState<Cert[]>([]);
  const [profileName, setProfileName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: prof } = await supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle();
      setProfileName(prof?.display_name ?? "الطالب");

      const { data } = await supabase.from("certificates").select("*").eq("user_id", user.id).order("issued_at", { ascending: false });
      const items: Cert[] = data ?? [];
      const courseIds = items.filter((c) => c.course_id).map((c) => c.course_id!) as string[];
      const trackIds = items.filter((c) => c.track_id).map((c) => c.track_id!) as string[];

      if (courseIds.length) {
        const { data: cs } = await supabase.from("courses").select("id,title").in("id", courseIds);
        items.forEach((c) => { if (c.course_id) c.course_title = cs?.find((x) => x.id === c.course_id)?.title; });
      }
      if (trackIds.length) {
        const { data: ts } = await supabase.from("tracks").select("id,title").in("id", trackIds);
        items.forEach((c) => { if (c.track_id) c.track_title = ts?.find((x) => x.id === c.track_id)?.title; });
      }
      setCerts(items);
      setLoading(false);
    })();
  }, [user]);

  const printCert = (c: Cert) => {
    const w = window.open("", "_blank");
    if (!w) return;
    const title = c.course_title || c.track_title || "دورة";
    const date = new Date(c.issued_at).toLocaleDateString("ar-EG");
    w.document.write(`
<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>شهادة ${title}</title>
<style>
body{font-family:sans-serif;background:linear-gradient(135deg,#1a3a5c,#2d5a8a);color:#fff;margin:0;height:100vh;display:flex;align-items:center;justify-content:center}
.cert{background:#fffaf2;color:#1a3a5c;padding:60px;border:8px double #c8a050;border-radius:16px;text-align:center;max-width:700px;width:90%}
h1{font-size:42px;margin:0 0 8px;color:#c8a050}
h2{font-size:28px;margin:30px 0 10px}
p{font-size:18px;line-height:1.8;margin:6px 0}
.name{font-size:36px;font-weight:bold;color:#1a3a5c;margin:20px 0;border-bottom:2px solid #c8a050;display:inline-block;padding:0 30px 8px}
.date{margin-top:30px;color:#666;font-size:14px}
button{margin-top:20px;padding:10px 20px;background:#c8a050;color:#fff;border:0;border-radius:6px;cursor:pointer}
@media print{button{display:none}}
</style></head><body>
<div class="cert">
  <h1>🏆 شهادة إتمام</h1>
  <p>تشهد منصة الشباب اليمني للتعلم المجاني بأن</p>
  <div class="name">${profileName}</div>
  <p>قد أكمل بنجاح ${c.kind === "course" ? "دورة" : "مسار"}</p>
  <h2>${title}</h2>
  <p class="date">تاريخ الإصدار: ${date}</p>
  <button onclick="window.print()">طباعة / حفظ PDF</button>
</div></body></html>`);
    w.document.close();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10">
        <h1 className="font-display text-3xl font-extrabold text-primary mb-2">شهاداتي</h1>
        <p className="text-muted-foreground mb-8">شهاداتك التي حصلت عليها بإكمال الدورات والمسارات.</p>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">{[1, 2].map((i) => <Skeleton key={i} className="h-32" />)}</div>
        ) : certs.length === 0 ? (
          <Card className="p-10 text-center">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">لم تحصل على شهادات بعد. أكمل دورة لتحصل على أول شهادة!</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {certs.map((c) => (
              <Card key={c.id} className="p-6 border-r-4 border-accent">
                <div className="flex items-start gap-3">
                  <div className="text-4xl">🏆</div>
                  <div className="flex-1">
                    <div className="text-xs text-accent font-bold uppercase">{c.kind === "course" ? "شهادة دورة" : "شهادة مسار"}</div>
                    <h3 className="font-display font-bold text-primary mt-1">{c.course_title || c.track_title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(c.issued_at).toLocaleDateString("ar-EG")}</p>
                    <Button size="sm" variant="outline" className="mt-3" onClick={() => printCert(c)}>
                      <Download className="ml-1 h-3 w-3" /> عرض/تحميل
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Certificates;