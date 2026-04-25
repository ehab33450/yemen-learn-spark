import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, X, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface Msg { role: "user" | "assistant"; content: string }
interface Props { lessonContext?: { title: string; description?: string | null } }

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`;

export function AITutorWidget({ lessonContext }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "مرحباً! أنا معلّمك الذكي. اسألني أي شيء عن الدرس أو ما يصعب عليك." },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: Msg = { role: "user", content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          lessonContext,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        setMessages((m) => [...m, { role: "assistant", content: err.error ?? "حدث خطأ، حاول مرة أخرى." }]);
        setLoading(false);
        return;
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      let done = false;

      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) {
              acc += c;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch {
            buf = line + "\n" + buf; break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      setMessages((m) => [...m, { role: "assistant", content: "تعذّر الاتصال. حاول مرة أخرى." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-5 left-5 z-50 h-14 w-14 rounded-full bg-gradient-gold text-primary shadow-gold animate-pulse-gold flex items-center justify-center hover:scale-105 transition-transform",
          open && "animate-none"
        )}
        aria-label="المعلّم الذكي"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 left-5 z-50 w-[calc(100vw-2.5rem)] sm:w-96 h-[32rem] bg-card border border-border rounded-2xl shadow-elevated flex flex-col overflow-hidden animate-fade-in-up">
          <header className="bg-gradient-hero text-primary-foreground p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gold/20 flex items-center justify-center">
              <Bot className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm">المعلّم الذكي</h3>
              <p className="text-xs text-primary-foreground/70">جاهز لمساعدتك على التعلم</p>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-background">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-start" : "justify-end")}>
                <div
                  className={cn(
                    "max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-bl-sm"
                      : "bg-secondary text-foreground rounded-br-sm"
                  )}
                >
                  {m.content || <span className="opacity-50">…</span>}
                </div>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-end">
                <div className="bg-secondary px-3 py-2 rounded-2xl text-sm">يكتب…</div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="p-3 border-t border-border bg-card flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب سؤالك…"
              disabled={loading}
              className="flex-1 px-3 py-2 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} className="bg-gradient-gold text-primary">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}