import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Send, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MotivationBanner } from "@/components/motivation/MotivationBanner";
import { toast } from "@/hooks/use-toast";

interface MyGroup { group_id: string; name: string; member_count: number; course_title: string; course_slug: string; }
interface Message { id: string; user_id: string; content: string; created_at: string; display_name: string; }

const Groups = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<MyGroup[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: mems } = await supabase
        .from("group_members")
        .select("group_id, discussion_groups(id, name, member_count, course_id, courses(title, slug))")
        .eq("user_id", user.id);
      const list: MyGroup[] = (mems ?? []).map((m: any) => ({
        group_id: m.discussion_groups.id,
        name: m.discussion_groups.name,
        member_count: m.discussion_groups.member_count,
        course_title: m.discussion_groups.courses?.title ?? "",
        course_slug: m.discussion_groups.courses?.slug ?? "",
      }));
      setGroups(list);
      if (list.length && !activeId) setActiveId(list[0].group_id);
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!activeId) return;
    (async () => {
      const { data: msgs } = await supabase
        .from("group_messages")
        .select("id, user_id, content, created_at")
        .eq("group_id", activeId)
        .order("created_at", { ascending: true })
        .limit(100);
      const userIds = Array.from(new Set((msgs ?? []).map((m) => m.user_id)));
      const { data: profs } = await supabase
        .from("profiles").select("user_id, display_name").in("user_id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
      const nameMap = new Map((profs ?? []).map((p: any) => [p.user_id, p.display_name]));
      setMessages((msgs ?? []).map((m: any) => ({ ...m, display_name: nameMap.get(m.user_id) ?? "طالب" })));
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }), 50);
    })();
  }, [activeId]);

  const send = async () => {
    if (!input.trim() || !activeId || !user) return;
    setSending(true);
    const content = input.trim();
    setInput("");
    const { error } = await supabase.from("group_messages").insert({ group_id: activeId, user_id: user.id, content });
    if (error) { toast({ title: "خطأ", description: "تعذّر الإرسال", variant: "destructive" }); }
    else {
      const { data: prof } = await supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle();
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), user_id: user.id, content, created_at: new Date().toISOString(), display_name: prof?.display_name ?? "أنت" }]);
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
    }
    setSending(false);
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MotivationBanner />
      <main className="container py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-extrabold text-primary mb-1 flex items-center gap-2">
            <Users className="h-7 w-7 text-accent" />
            مجموعات النقاش
          </h1>
          <p className="text-muted-foreground text-sm">تواصل مع زملائك في نفس الدورة (10 طلاب لكل مجموعة)</p>
        </div>

        {loading ? (
          <Skeleton className="h-96" />
        ) : groups.length === 0 ? (
          <Card className="p-10 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">لم تنضم لأي مجموعة بعد. ادخل أي دورة لتنضم تلقائياً لمجموعتها.</p>
            <Button onClick={() => navigate("/tracks")} className="bg-gradient-gold text-primary font-display font-bold">استعرض المسارات</Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-[260px_1fr] gap-4 h-[70vh]">
            <Card className="p-3 overflow-y-auto">
              {groups.map((g) => (
                <button
                  key={g.group_id}
                  onClick={() => setActiveId(g.group_id)}
                  className={`w-full text-right p-3 rounded-lg mb-1 transition-colors ${activeId === g.group_id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                >
                  <div className="font-display font-bold text-sm truncate">{g.course_title}</div>
                  <div className="text-xs opacity-70 mt-0.5">{g.member_count} عضو • {g.name.split(" — ")[1] ?? "المجموعة"}</div>
                </button>
              ))}
            </Card>

            <Card className="flex flex-col overflow-hidden">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-10">كن أول من يكسر الصمت 💬</div>
                ) : messages.map((m) => {
                  const mine = m.user_id === user.id;
                  return (
                    <div key={m.id} className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                      <Avatar className="h-8 w-8 shrink-0"><AvatarFallback className="bg-primary text-primary-foreground text-xs">{m.display_name.charAt(0)}</AvatarFallback></Avatar>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${mine ? "bg-gradient-gold text-primary" : "bg-secondary"}`}>
                        {!mine && <div className="text-[10px] font-display font-bold opacity-70 mb-0.5">{m.display_name}</div>}
                        <div className="text-sm whitespace-pre-wrap break-words">{m.content}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t p-3 flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                  placeholder="اكتب رسالة..."
                  disabled={sending}
                />
                <Button onClick={send} disabled={sending || !input.trim()} className="bg-gradient-gold text-primary font-display font-bold shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Groups;