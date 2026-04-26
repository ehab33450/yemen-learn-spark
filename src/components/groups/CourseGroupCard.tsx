import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, MessageSquare, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Member { user_id: string; display_name: string; level: number; }

export function CourseGroupCard({ courseId, userId }: { courseId: string; userId: string }) {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string>("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const loadGroup = async () => {
    // Find existing membership for this course
    const { data: mems } = await supabase
      .from("group_members")
      .select("group_id, discussion_groups!inner(id,name,course_id,member_count)")
      .eq("user_id", userId);
    const mine = (mems ?? []).find((m: any) => m.discussion_groups?.course_id === courseId);
    if (!mine) { setLoading(false); return; }
    const gid = (mine as any).discussion_groups.id;
    setGroupId(gid);
    setGroupName((mine as any).discussion_groups.name);

    // Fetch member profiles
    const { data: gm } = await supabase.from("group_members").select("user_id").eq("group_id", gid);
    const ids = (gm ?? []).map((m) => m.user_id);
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles").select("user_id,display_name,level").in("user_id", ids);
      setMembers((profs ?? []) as Member[]);
    }
    setLoading(false);
  };

  useEffect(() => { loadGroup(); }, [courseId, userId]);

  const joinNow = async () => {
    setJoining(true);
    await supabase.rpc("join_or_create_discussion_group", { _user_id: userId, _course_id: courseId });
    await loadGroup();
    setJoining(false);
  };

  if (loading) return <Card className="p-5"><Skeleton className="h-32" /></Card>;

  if (!groupId) {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-accent" />
          <h3 className="font-display font-bold text-primary">مجموعة النقاش</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">انضم لمجموعة من 10 طلاب في نفس مستواك لتتعلّموا معاً.</p>
        <Button onClick={joinNow} disabled={joining} size="sm" className="w-full bg-gradient-gold text-primary font-display font-bold">
          {joining ? "جاري الانضمام..." : "انضم للمجموعة"}
        </Button>
      </Card>
    );
  }

  const groupSuffix = groupName.split(" — ")[1] ?? "المجموعة";

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-1">
        <Users className="h-5 w-5 text-accent" />
        <h3 className="font-display font-bold text-primary">مجموعتك</h3>
        <span className="mr-auto text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-display font-bold">
          {members.length}/10
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{groupSuffix}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {members.slice(0, 10).map((m) => (
          <div key={m.user_id} className="flex items-center gap-1.5" title={`${m.display_name} • مستوى ${m.level}`}>
            <Avatar className="h-8 w-8">
              <AvatarFallback className={`text-xs font-display font-bold ${m.user_id === userId ? "bg-gradient-gold text-primary" : "bg-primary text-primary-foreground"}`}>
                {m.display_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        ))}
      </div>

      <Button asChild size="sm" className="w-full bg-primary text-primary-foreground font-display font-bold">
        <Link to="/groups" className="flex items-center justify-center gap-2">
          <MessageSquare className="h-4 w-4" /> فتح المحادثة <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
    </Card>
  );
}