import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Clock, BookOpen, ArrowLeft } from "lucide-react";

interface Track { id: string; slug: string; title: string; subtitle: string | null; description: string | null; emoji: string | null; }
interface Course { id: string; slug: string; title: string; description: string | null; level: string | null; duration: string | null; emoji: string | null; }

const TrackDetail = () => {
  const { slug } = useParams();
  const [track, setTrack] = useState<Track | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: t } = await supabase.from("tracks").select("*").eq("slug", slug).maybeSingle();
      if (t) {
        const { data: c } = await supabase
          .from("courses")
          .select("id,slug,title,description,level,duration,emoji")
          .eq("track_id", t.id)
          .eq("is_published", true)
          .order("sort_order");
        setTrack(t);
        setCourses(c ?? []);
      }
      setLoading(false);
    })();
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        {loading ? (
          <Skeleton className="h-32 mb-8" />
        ) : track ? (
          <>
            <Link to="/tracks" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mb-6">
              <ArrowLeft className="h-4 w-4" /> كل المسارات
            </Link>
            <div className="mb-10 text-center">
              <div className="text-6xl mb-4">{track.emoji}</div>
              <h1 className="font-display text-4xl font-extrabold text-primary mb-2">{track.title}</h1>
              {track.subtitle && <p className="text-accent font-semibold">{track.subtitle}</p>}
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">{track.description}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((c) => (
                <Link key={c.id} to={`/courses/${c.slug}`}>
                  <Card className="p-6 h-full hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{c.emoji}</span>
                      {c.level && <Badge variant="secondary">{c.level}</Badge>}
                    </div>
                    <h3 className="font-display font-bold text-lg text-primary mb-2 line-clamp-2">{c.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{c.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {c.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.duration}</span>}
                    </div>
                  </Card>
                </Link>
              ))}
              {courses.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-12">لا توجد دورات حالياً.</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-center py-20">المسار غير موجود.</p>
        )}
      </main>
    </div>
  );
};

export default TrackDetail;