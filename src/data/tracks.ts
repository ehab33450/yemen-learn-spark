import type { Track } from "./types";

export const tracks: Track[] = [
  {
    id: "languages",
    title: "اللغات",
    subtitle: "Languages",
    emoji: "🌍",
    description: "تعلم الإنجليزية A1-B2 والتركية ومهارات التحدث.",
    badgeClass: "bg-emerald/10 text-emerald border-emerald/30",
  },
  {
    id: "religious",
    title: "العلوم الدينية",
    subtitle: "Islamic Studies",
    emoji: "🕌",
    description: "علوم القرآن والسيرة النبوية والفقه الميسّر.",
    badgeClass: "bg-primary/10 text-primary border-primary/30",
  },
  {
    id: "tech",
    title: "المهارات التقنية",
    subtitle: "Tech & AI",
    emoji: "💻",
    description: "الذكاء الاصطناعي والتصميم والتسويق الرقمي والعمل الحر.",
    badgeClass: "bg-accent/10 text-accent border-accent/30",
  },
];
