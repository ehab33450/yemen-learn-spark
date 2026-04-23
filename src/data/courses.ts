export type TrackId = "languages" | "religious" | "tech";

export interface Track {
  id: TrackId;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  description: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
}

export interface