import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";

    // Verify caller is admin
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "غير مصرح" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roleRow } = await admin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "هذه الصفحة للأدمن فقط" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { prompt, action } = await req.json();

    // Gather platform context
    const [{ count: studentCount }, { data: topStudents }, { data: inactive }, { data: tracks }, { count: courseCount }, { count: lessonCount }] = await Promise.all([
      admin.from("profiles").select("*", { count: "exact", head: true }),
      admin.from("profiles").select("user_id,display_name,xp_points,level").order("xp_points", { ascending: false }).limit(10),
      admin.from("profiles").select("user_id,display_name,updated_at").lt("updated_at", new Date(Date.now() - 7 * 86400000).toISOString()).limit(20),
      admin.from("tracks").select("title,slug"),
      admin.from("courses").select("*", { count: "exact", head: true }),
      admin.from("lessons").select("*", { count: "exact", head: true }),
    ]);

    const context = {
      studentCount,
      courseCount,
      lessonCount,
      topStudents,
      inactiveStudents: inactive,
      tracks,
    };

    const systemPrompt = `أنت المساعد الذكي للمؤسس إيهاب المزلم في منصة "يمن أفضل" التعليمية.
مهمتك: مساعدة الأدمن في إدارة المنصة، اقتراح دورات وفيديوهات يوتيوب جاهزة، تحليل أداء الطلاب،
إرسال تنبيهات للطلاب غير النشطين، اقتراح شهادات تقدير للمتميزين.

بيانات المنصة الحالية:
- عدد الطلاب: ${studentCount ?? 0}
- عدد الدورات: ${courseCount ?? 0}
- عدد الدروس: ${lessonCount ?? 0}
- المسارات: ${tracks?.map(t => t.title).join("، ") ?? ""}
- أفضل 10 طلاب: ${JSON.stringify(topStudents ?? [])}
- طلاب لم ينشطوا منذ أسبوع+: ${JSON.stringify(inactive ?? [])}

عند اقتراح دورات يوتيوب: قدّم عناوين واضحة ومعرّفات فيديو (Video IDs) من قنوات عربية موثوقة.
ردودك باللغة العربية، مختصرة، عملية، ومرتبة بنقاط.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: "تجاوزت حد الاستخدام، حاول بعد قليل" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (aiRes.status === 402) {
      return new Response(JSON.stringify({ error: "نفدت رصيد الذكاء الاصطناعي، أضف رصيد من إعدادات Lovable" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI error", t);
      return new Response(JSON.stringify({ error: "خطأ في المساعد" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiJson = await aiRes.json();
    const reply = aiJson.choices?.[0]?.message?.content ?? "";

    // Log
    await admin.from("admin_ai_logs").insert({ admin_id: userId, prompt, response: reply, action_taken: action ?? null });

    return new Response(JSON.stringify({ reply, context }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "خطأ" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});