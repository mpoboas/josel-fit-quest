import type { TourStepId } from "./teacherTourCopy";

export type TourTab = "Home" | "Log" | "Rank" | "Goals" | "Profile";

export interface TeacherTourStepLayout {
  id: TourStepId;
  tab: TourTab;
  element: string;
  side?: "top" | "right" | "bottom" | "left" | "over";
  align?: "start" | "center" | "end";
}

export const TEACHER_TOUR_LAYOUT: TeacherTourStepLayout[] = [
  { id: "welcome", tab: "Home", element: "[data-tour='xp-card']", side: "over" },
  { id: "xp", tab: "Home", element: "[data-tour='xp-card']", side: "bottom", align: "center" },
  { id: "streak", tab: "Home", element: "[data-tour='streak-shield']", side: "top", align: "center" },
  { id: "social", tab: "Home", element: "[data-tour='friend-feed']", side: "top", align: "center" },
  { id: "nav-log", tab: "Log", element: "[data-tour='nav-log']", side: "top" },
  { id: "workout", tab: "Log", element: "[data-tour='workout-exercises']", side: "top" },
  { id: "finish", tab: "Log", element: "[data-tour='finish-workout']", side: "top" },
  { id: "nav-goals", tab: "Goals", element: "[data-tour='nav-goals']", side: "top" },
  { id: "boss", tab: "Goals", element: "[data-tour='boss-card']", side: "bottom" },
  { id: "quests", tab: "Goals", element: "[data-tour='quest-list']", side: "top" },
  { id: "nav-rank", tab: "Rank", element: "[data-tour='nav-rank']", side: "top" },
  { id: "leaderboard", tab: "Rank", element: "[data-tour='leaderboard-tabs']", side: "bottom" },
  { id: "nav-profile", tab: "Profile", element: "[data-tour='nav-profile']", side: "top" },
  { id: "motivation", tab: "Profile", element: "[data-tour='motivation-card']", side: "bottom", align: "center" },
  { id: "badges", tab: "Profile", element: "[data-tour='badges-grid']", side: "top", align: "center" },
  { id: "analytics", tab: "Profile", element: "[data-tour='analytics-section']", side: "top", align: "center" },
  { id: "done", tab: "Home", element: "[data-tour='nav-home']", side: "over" }
];

export const TOUR_STORAGE_KEY = "fq_teacher_tour_done_v1";
export const DEMO_MODE_KEY = "fq_demo_mode_v1";
export const AUTO_TOUR_KEY = "fq_auto_tour_v1";
