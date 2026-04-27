import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mic, Square, CheckCircle2, ClipboardEdit, Loader2 } from "lucide-react";

interface Props {
  lessonId: string;
  userId: string;
  taskType: "text" | "audio" | "short_answer" | string | null;
  prompt: string | null;
  minChars?: number;
  onCompleted: () => void;
}

export const PracticalTask = ({ lessonId, userId, taskType, prompt, minChars = 30, onCompleted }: Props) => {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("lesson_task_submissions")
        .select("text_answer,audio_url")
        .eq("user_id", userId).eq("lesson_id", lessonId).maybeSingle();
      if (data) {
        setText(data.text_answer ?? "");
        setAudioUrl(data.audio_url ?? null);
        if (data.text_answer || data.audio_url) setDone(true);
      }
    })();
  }, [lessonId, userId]);

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const path = `${userId}/${lessonId}-${Date.now()}.webm`;
        const { error } = await supabase.storage.from("lesson-submissions").upload(path, blob, { upsert: true });
        if (error) { toast.error("تعذّر رفع التسجيل"); return; }
        const { data: pub } = supabase.storage.from("lesson-submissions").getPublicUrl(path);
        setAudioUrl(pub.publicUrl);
        toast.success("تم حفظ التسجيل");
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch {
      toast.error("لم نستطع الوصول إلى الميكروفون");
    }
  };

  const stopRec = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const submit = async () => {
    setSaving(true);
    const isText = taskType === "text" || taskType === "short_answer";
    if (isText && text.trim().length < minChars) {
      toast.error(`الإجابة قصيرة جدًا — اكتب ${minChars} حرفًا على الأقل`);
      setSaving(false); return;
    }
    if (taskType === "audio" && !audioUrl) {
      toast.error("سجّل ردك الصوتي أولًا"); setSaving(false); return;
    }
    const { error } = await supabase.from("lesson_task_submissions").upsert({
      user_id: userId, lesson_id: lessonId, task_type: taskType ?? "text",
      text_answer: isText ? text.trim() : null, audio_url: audioUrl,
    }, { onConflict: "user_id,lesson_id" });
    setSaving(false);
    if (error) { toast.error("لم يتم الحفظ"); return; }
    setDone(true);
    toast.success("✅ أحسنت! تم تسجيل مهمتك");
    onCompleted();
  };

  if (!taskType || taskType === "none") return null;
  const isAudio = taskType === "audio";

  return (
    <Card className="p-6 mb-6 border-2 border-accent/40">
      <div className="flex items-center gap-2 mb-3">
        <ClipboardEdit className="h-5 w-5 text-accent" />
        <h2 className="font-display font-bold text-primary">المهمة العملية — مطلوبة للانتقال</h2>
        {done && <Badge className="bg-emerald text-emerald-foreground">مكتملة</Badge>}
      </div>
      {prompt && <p className="text-sm leading-loose text-foreground/90 mb-4 bg-secondary/40 p-3 rounded-lg">{prompt}</p>}

      {isAudio ? (
        <div className="space-y-3">
          {!recording ? (
            <Button type="button" onClick={startRec} variant="outline" className="gap-2"><Mic className="h-4 w-4" /> ابدأ التسجيل</Button>
          ) : (
            <Button type="button" onClick={stopRec} variant="destructive" className="gap-2"><Square className="h-4 w-4" /> إيقاف</Button>
          )}
          {audioUrl && <audio src={audioUrl} controls className="w-full" />}
        </div>
      ) : (
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder={`اكتب إجابتك هنا (${minChars} حرف على الأقل)...`} />
      )}

      <Button onClick={submit} disabled={saving} className="mt-4 bg-gradient-gold text-primary font-bold">
        {saving ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 ml-2" />}
        {done ? "تحديث المهمة" : "تسليم المهمة"}
      </Button>
    </Card>
  );
};