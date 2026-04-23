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
  preview?: boolean;
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
  level: string;
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