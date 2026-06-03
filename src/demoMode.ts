import {
  DEFAULT_USER_PROFILE,
  INITIAL_CHALLENGES,
  INITIAL_BOSS_CHALLENGE,
  INITIAL_FRIENDS_LEADERBOARD,
  INITIAL_GLOBAL_LEADERBOARD,
  INITIAL_BADGES,
  INITIAL_WORKOUT_HISTORY,
  INITIAL_SOCIAL_FEED
} from "./data";
import { DEMO_MODE_KEY, AUTO_TOUR_KEY, TOUR_STORAGE_KEY } from "./data/teacherTour";

/** Load full demo seed data so evaluators see unlocked features immediately. */
export function loadTeacherDemo(options?: { restartTour?: boolean }) {
  const profile = {
    ...DEFAULT_USER_PROFILE,
    onboardingPhase: "done" as const,
    onboardingComplete: true,
    workoutsCompleted: 48
  };

  localStorage.setItem("fq_profile_v2", JSON.stringify(profile));
  localStorage.setItem("fq_workouts_v2", JSON.stringify(INITIAL_WORKOUT_HISTORY));
  localStorage.setItem("fq_challenges_v2", JSON.stringify(INITIAL_CHALLENGES));
  localStorage.setItem("fq_boss_v2", JSON.stringify(INITIAL_BOSS_CHALLENGE));
  localStorage.setItem("fq_friends_v2", JSON.stringify(INITIAL_FRIENDS_LEADERBOARD));
  localStorage.setItem("fq_global_v2", JSON.stringify(INITIAL_GLOBAL_LEADERBOARD));
  localStorage.setItem("fq_badges_v2", JSON.stringify(INITIAL_BADGES));
  localStorage.setItem("fq_social_feed_v2", JSON.stringify(INITIAL_SOCIAL_FEED));
  localStorage.setItem("fq_notifications_v2", JSON.stringify([]));
  localStorage.setItem("fq_recommendations_v2", JSON.stringify([]));
  localStorage.setItem("fq_analytics_v2", JSON.stringify([]));
  localStorage.setItem(DEMO_MODE_KEY, "1");
  localStorage.setItem(AUTO_TOUR_KEY, "1");

  if (options?.restartTour) {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  }
}

export function isDemoMode(): boolean {
  return localStorage.getItem(DEMO_MODE_KEY) === "1";
}
