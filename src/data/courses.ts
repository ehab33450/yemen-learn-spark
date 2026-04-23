export type TrackId = "languages" | "religious" | "tech";

export interface Track {
  id: TrackId;
  title: string;
  subtitle: string;
  emoji: string;
  description: string;
  badgeClass: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  track: TrackId;
  level: "مبتدئ" | "متوسط" | "متقدم";
  duration: string;
  lessonsCount: number;
  studentsCount: number;
  rating: number;
  instructor: string;
  instructorTitle: string;
  description: string;
  outcomes: string[];
  modules: Module[];
  xpReward: number;
  emoji: string;
}

export const tracks: Track[] = [
  {
    id: "languages",
    title: "اللغات",
    subtitle: "Languages",
    emoji: "🌍",
    description: "تعلّم الإنجليزية من A1 إلى B2، إنجليزية الأعمال، التحدث، والتركية.",
    badgeClass: "bg-emerald/10 text-emerald border-emerald/20",
  },
  {
    id: "religious",
    title: "العلوم الدينية",
    subtitle: "Islamic Studies",
    emoji: "🕌",
    description: "علوم القرآن، السيرة النبوية، الفقه الميسّر، والأخلاق والتزكية.",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
  },
  {
    id: "tech",
    title: "المهارات التقنية",
    subtitle: "Tech & AI",
    emoji: "💻",
    description: "الذكاء الاصطناعي، التصميم بـ Canva، التسويق الرقمي، والعمل الحر.",
    badgeClass: "bg-accent/10 text-accent border-accent/20",
  },
];

export const courses: Course[] = [
  {
    id: "english-a1",
    title: "الإنجليزية A1 — التأسيس",
    track: "languages",
    level: "مبتدئ",
    duration: "6 أسابيع",
    lessonsCount: 24,
    studentsCount: 1247,
    rating: 4.8,
    instructor: "د. أحمد الشامي",
    instructorTitle: "محاضر لغة إنجليزية —