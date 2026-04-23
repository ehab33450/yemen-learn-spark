import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen, Users, Star } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { courses } from "@/data/courses";
import { tracks } from "@/data/tracks";
import type { TrackId } from "@/data/types";
import { motion } from "framer-motion";

const Courses = () => {
  const [query, setQuery] = useState("");
  const [trackFilter, setTrackFilter] = useState<TrackId | "all">("all");

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesTrack = trackFilter === "all" || c.track === trackFilter;
      const matchesQuery = !query || c.title.toLowerCase().includes(query.toLowerCase()) || c.description.toLowerCase().includes(query.toLowerCase());
      return matchesTrack && matchesQuery;
    });
  }, [query, trackFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="bg-gradient-hero text-primary-foreground py-12">
        <div className="container">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">كتالوج الدورات</h1>
          <p className="text-primary-foreground/80">اكتشف +50 دورة مجانية في اللغات والعلوم الدينية والتقنية.</p>
          <div className="mt-6 max-w-xl">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن دورة..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pr-10 bg-background text-foreground"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container py-10">
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={trackFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setTrackFilter("all")}
            className="font-display"
          >
            الكل ({courses.length})
          </Button>
          {tracks.map((t) => {
            const count = courses.filter((c) => c.track === t.id).length;
            return (
              <Button
                key={t.id}
                variant={trackFilter === t.id ? "default" : "outline"}
                size="sm"
                onClick={() => setTrackFilter(t.id)}
                className="font-display"
              >
                {t.emoji} {t.title} ({count})
              </Button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>لا توجد دورات تطابق بحثك.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link to={`/courses/${course.id}`}>
                  <Card className="glass-card h-full hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden cursor-pointer">
                    <div className="h-32 bg-gradient-hero flex items-center justify-center text-5xl">{course.emoji}</div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{course.level}</Badge>
                        <span className="text-xs text-muted-foreground">{course.duration}</span>
                      </div>
                      <CardTitle className="font-display text-base leading-snug line-clamp-2">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-muted-foreground text-xs line-clamp-2 mb-3">{course.description}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {course.lessonsCount}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.studentsCount}</span>
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 text-gold" /> {course.rating}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button size="sm" className="w-full bg-gradient-gold text-primary font-display font-semibold">
                        عرض التفاصيل
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Courses;