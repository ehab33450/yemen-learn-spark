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
