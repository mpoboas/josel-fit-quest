export interface Set {
  id: string;
  weight: number;
  reps: number;
  isPR?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  sets: Set[];
}

export interface Workout {
  id: string;
  title: string;
  date: string;
  rawDate: string;
  duration: number;
  exercises: Exercise[];
  xpEarned: number;
}

export interface SocialWorkout {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorTier: RankTier;
  isMe?: boolean;
  workout: Workout;
  highFived?: boolean;
  highFiveCount: number;
}

export type RankTier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Elite";

export type PlayerType = "Achiever" | "Explorer" | "Socialiser" | "Killer" | "Undecided";

export type ChallengeTrackId =
  | "weekly_prs"
  | "weekly_cardio"
  | "daily_compounds"
  | "group_leg"
  | "weekly_xp_lead";

export interface BossChallenge {
  title: string;
  description: string;
  workoutsGoal: number;
  workoutsCurrent: number;
  prGoalCount: number;
  prCurrentCount: number;
  xpReward: number;
  shieldReward: number;
  badgeReward: string;
  completed: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "Daily" | "Weekly" | "Group";
  progress: number;
  goalText: string;
  xpReward: number;
  completed: boolean;
  trackId?: ChallengeTrackId;
  squadGoal?: number;
  squadCurrent?: number;
  audience?: PlayerType[];
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  weeklyXp?: number;
  tier: RankTier;
  isMe?: boolean;
  highFived?: boolean;
  topPerformerThisWeek?: boolean;
}

export interface CategoryLeader {
  exercise: string;
  name: string;
  avatar: string;
  value: number;
  unit: string;
  isMe?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: "gold" | "blue" | "green" | "gray";
  category: "performance" | "routine" | "social" | "milestone" | "mentorship";
  unlockedAt?: string;
  animated?: boolean;
}

export interface WorkoutRecommendation {
  id: string;
  title: string;
  reason: string;
  suggestedExercises: string[];
  createdAt: string;
  actedOn?: boolean;
}

export interface AppNotification {
  id: string;
  type: "high_five" | "rank_up" | "badge" | "streak_risk" | "bonus_xp" | "season" | "follow";
  message: string;
  createdAt: string;
  read?: boolean;
}

export interface BehavioralEvent {
  ts: string;
  event: string;
  meta?: Record<string, string | number>;
}

export interface UserProfile {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  rank: RankTier;
  streak: number;
  streakShields: number;
  globalRank: number;
  workoutsCompleted: number;
  onboardingComplete: boolean;
  onboardingPhase: "survey" | "octalysis" | "done";
  restDaysLogged: number;
  playerType: PlayerType;
  fitnessGoal?: "strength" | "cardio" | "balance";
  octalysisScores: {
    meaning: number;
    accomplishment: number;
    creativity: number;
    ownership: number;
    influence: number;
    scarcity: number;
    curiosity: number;
    avoidance: number;
  };
  octalysisLastTaken?: string;
  following: string[];
  highFivesSent: number;
  highFivesReceived: number;
  day7ShieldAwarded: boolean;
  lastWorkoutDate?: string;
  lastSeasonResetAt?: string;
  lastWeeklyResetAt?: string;
  registeredAt: string;
  unlockedCosmetics: string[];
  dismissedMilestones: string[];
  lastStreakWarningDate?: string;
}

export interface GamificationState {
  profile: UserProfile;
  workouts: Workout[];
  challenges: Challenge[];
  boss: BossChallenge;
  badges: Badge[];
  friendsLb: LeaderboardEntry[];
  globalLb: LeaderboardEntry[];
  socialFeed: SocialWorkout[];
  recommendations: WorkoutRecommendation[];
  notifications: AppNotification[];
  analytics: BehavioralEvent[];
}

export interface RankUpResult {
  newRank: RankTier;
  previousRank: RankTier;
  leveledUp: boolean;
  newLevel: number;
}

export interface WorkoutFinishResult {
  profile: UserProfile;
  boss: BossChallenge;
  challenges: Challenge[];
  badges: Badge[];
  friendsLb: LeaderboardEntry[];
  feed: SocialWorkout[];
  notifications: AppNotification[];
  bonusXp: number;
  rankUp?: RankUpResult;
  newlyCompletedChallengeIds: string[];
  milestoneKey?: string;
}
