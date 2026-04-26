import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { PersonalGreeting } from "@/components/motivation/PersonalGreeting";
import { MotivationBanner } from "@/components/motivation/MotivationBanner";

interface Track {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  emoji: string | null;
  color: string | null;
}

interface CourseCount {
  track_id: string;
  count: number;
}

const Tracks = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: trackData } = await supabase.from("tracks").select("*").order("sort_order");
      const { data: courseData } = await supabase.from("courses").select("track_id").eq("is_published", true);
      const map: Record<string, number> = {};
      (courseData ?? []).forEach((c) => {
        map[c.track_id] = (map[c.track_id] ?? 0) + 1;
      });
      setTracks(trackData ?? []);
      setCounts(map);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MotivationBanner />
      <main className="container py-12">
        <PersonalGreeting context="tracks" />
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-extrabold text-primary mb-3">المسارات التعليمية</h1>
          <p className="text-muted-foreground">اختر مسارك وابدأ رحلتك الآن</p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {tracks.map((t) => (
              <Link key={t.id} to={`/tracks/${t.slug}`}>
                <Card
                  className="p-8 h-full hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border-2 hover:border-accent"
                  style={{ borderTopColor: t.color ?? undefined, borderTopWidth: 4 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">{t.emoji}</div>
                    <span className="text-xs bg-secondary px-3 py-1 rounded-full">
                      {counts[t.id] ?? 0} دورة
                    </span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-primary mb-2">{t.title}</h2>
                  {t.subtitle && <p className="text-accent font-semibold text-sm mb-2">{t.subtitle}</p>}
                  <p className="text-muted-foreground text-sm mb-4">{t.description}</p>
                  <div className="flex items-center gap-2 text-accent font-semibold text-sm">
                    استعرض المسار <ArrowLeft className="h-4 w-4" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Tracks;