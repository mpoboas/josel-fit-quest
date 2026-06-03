import type {
  Badge,
  BossChallenge,
  Challenge,
  ChallengeTrackId,
  LeaderboardEntry,
  PlayerType,
  RankTier,
  RankUpResult,
  SocialWorkout,
  UserProfile,
  Workout,
  WorkoutFinishResult,
  WorkoutRecommendation,
  AppNotification,
  CategoryLeader,
  BehavioralEvent
} from "./types";

export const TIER_ORDER: RankTier[] = ["Bronze", "Silver", "Gold", "Platinum", "Elite"];
export const DAILY_CHALLENGE_BONUS_XP = 100;
export const SEASON_MS = 90 * 24 * 60 * 60 * 1000;
export const ANALYTICS_UNLOCK_SESSIONS = 12;

export function rankForLevel(level: number): RankTier {
  if (level >= 20) return "Elite";
  if (level >= 15) return "Platinum";
  if (level >= 10) return "Gold";
  if (level >= 5) return "Silver";
  return "Bronze";
}

export function migrateProfile(raw: Partial<UserProfile> | null): UserProfile {
  const base: UserProfile = {
    name: "Athlete",
    level: 1,
    xp: 0,
    xpToNextLevel: 1000,
    rank: "Bronze",
    streak: 0,
    streakShields: 0,
    globalRank: 999,
    workoutsCompleted: 0,
    onboardingComplete: false,
    onboardingPhase: "survey",
    restDaysLogged: 0,
    playerType: "Explorer",
    octalysisScores: {
      meaning: 50,
      accomplishment: 50,
      creativity: 50,
      ownership: 50,
      influence: 50,
      scarcity: 50,
      curiosity: 50,
      avoidance: 50
    },
    following: [],
    highFivesSent: 0,
    highFivesReceived: 0,
    day7ShieldAwarded: false,
    registeredAt: new Date().toISOString(),
    unlockedCosmetics: [],
    dismissedMilestones: []
  };
  if (!raw) return base;

  const legacyComplete = raw.onboardingComplete === true && !raw.onboardingPhase;
  return {
    ...base,
    ...raw,
    onboardingPhase: raw.onboardingPhase ?? (legacyComplete ? "done" : "survey"),
    onboardingComplete: raw.onboardingPhase === "done" || legacyComplete,
    following: raw.following ?? [],
    highFivesSent: raw.highFivesSent ?? 0,
    highFivesReceived: raw.highFivesReceived ?? 0,
    day7ShieldAwarded: raw.day7ShieldAwarded ?? false,
    unlockedCosmetics: raw.unlockedCosmetics ?? [],
    dismissedMilestones: raw.dismissedMilestones ?? [],
    registeredAt: raw.registeredAt ?? new Date().toISOString()
  };
}

export function isLeaderboardUnlocked(profile: UserProfile, workouts: Workout[]): boolean {
  return profile.workoutsCompleted > 0 || workouts.some((w) => w.exercises.length > 0);
}

export function isAnalyticsUnlocked(workouts: Workout[]): boolean {
  if (typeof localStorage !== "undefined" && localStorage.getItem("fq_demo_mode_v1") === "1") {
    return true;
  }
  return workouts.filter((w) => w.exercises.length > 0).length >= ANALYTICS_UNLOCK_SESSIONS;
}

export function daysUntilSeasonReset(profile: UserProfile): number {
  const anchor = profile.lastSeasonResetAt
    ? new Date(profile.lastSeasonResetAt).getTime()
    : new Date(profile.registeredAt).getTime();
  const next = anchor + SEASON_MS;
  return Math.ceil((next - Date.now()) / (1000 * 60 * 60 * 24));
}

export function applySeasonResetIfDue(profile: UserProfile): {
  profile: UserProfile;
  reset: boolean;
  notifications: AppNotification[];
} {
  const days = daysUntilSeasonReset(profile);
  if (days > 0) return { profile, reset: false, notifications: [] };

  const idx = TIER_ORDER.indexOf(profile.rank);
  const newRank = idx > 0 ? TIER_ORDER[idx - 1] : profile.rank;
  const notifications: AppNotification[] = [
    {
      id: `season_${Date.now()}`,
      type: "season",
      message: `Season ended. Rank adjusted to ${newRank}. Climb back before the next reset!`,
      createdAt: new Date().toISOString()
    }
  ];
  return {
    profile: {
      ...profile,
      rank: newRank,
      lastSeasonResetAt: new Date().toISOString()
    },
    reset: true,
    notifications
  };
}

function getWeekMonday(d = new Date()): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function applyWeeklyResetIfDue(
  friends: LeaderboardEntry[],
  profile: UserProfile
): { friends: LeaderboardEntry[]; profile: UserProfile; reset: boolean } {
  const monday = getWeekMonday().toISOString();
  if (profile.lastWeeklyResetAt === monday) {
    return { friends, profile, reset: false };
  }

  const lastMonday = profile.lastWeeklyResetAt
    ? new Date(profile.lastWeeklyResetAt).getTime()
    : 0;
  const currentMonday = getWeekMonday().getTime();
  if (lastMonday >= currentMonday && profile.lastWeeklyResetAt) {
    return { friends, profile, reset: false };
  }

  const sorted = [...friends].sort((a, b) => (b.weeklyXp ?? b.xp) - (a.weeklyXp ?? a.xp));
  const top = sorted[0];

  const resetFriends = friends.map((f) => ({
    ...f,
    weeklyXp: 0,
    topPerformerThisWeek: f.name === top?.name
  }));

  return {
    friends: resetFriends,
    profile: { ...profile, lastWeeklyResetAt: monday },
    reset: true
  };
}

function workoutsInLastDays(workouts: Workout[], days: number): Workout[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return workouts.filter((w) => new Date(w.rawDate).getTime() >= cutoff && w.exercises.length > 0);
}

function countPRsInWorkouts(workouts: Workout[]): number {
  let n = 0;
  workouts.forEach((w) =>
    w.exercises.forEach((e) => e.sets.forEach((s) => {
      if (s.isPR) n++;
    }))
  );
  return n;
}

function hasCardioInWorkouts(workouts: Workout[]): boolean {
  return workouts.some((w) => w.exercises.some((e) => e.category === "Cardio"));
}

function countLegExercisesInWorkouts(workouts: Workout[]): number {
  let n = 0;
  workouts.forEach((w) =>
    w.exercises.forEach((e) => {
      if (e.category === "Legs") n += e.sets.length;
    })
  );
  return n;
}

export function computeChallengeProgress(
  challenge: Challenge,
  workouts: Workout[],
  profile: UserProfile,
  friendsLb: LeaderboardEntry[]
): { progress: number; goalText: string; squadCurrent?: number } {
  const week = workoutsInLastDays(workouts, 7);

  switch (challenge.trackId) {
    case "weekly_prs": {
      const prs = countPRsInWorkouts(week);
      const goal = 3;
      return {
        progress: Math.min(100, Math.round((prs / goal) * 100)),
        goalText: `${prs} / ${goal} PRs hit`
      };
    }
    case "weekly_cardio": {
      const done = hasCardioInWorkouts(week) ? 1 : 0;
      return { progress: done ? 100 : 0, goalText: `${done} / 1 session` };
    }
    case "daily_compounds": {
      const today = new Date().toDateString();
      const todayW = workouts.find(
        (w) => new Date(w.rawDate).toDateString() === today && w.exercises.length > 0
      );
      const compounds = todayW
        ? todayW.exercises.filter((e) =>
            ["Chest", "Back", "Legs", "Shoulders"].includes(e.category)
          ).length
        : 0;
      const goal = 3;
      return {
        progress: Math.min(100, Math.round((compounds / goal) * 100)),
        goalText: `${Math.min(compounds, goal)} / ${goal} compounds logged`
      };
    }
    case "group_leg": {
      const userLegs = countLegExercisesInWorkouts(week);
      const squadMock = Math.min(3, Math.floor(week.length * 0.8));
      const squadCurrent = Math.min(
        challenge.squadGoal ?? 10,
        userLegs + squadMock
      );
      const goal = challenge.squadGoal ?? 10;
      return {
        progress: Math.min(100, Math.round((squadCurrent / goal) * 100)),
        goalText: `${squadCurrent} / ${goal} squad leg sets`,
        squadCurrent
      };
    }
    case "weekly_xp_lead": {
      const me = friendsLb.find((f) => f.isMe);
      const rank = me?.rank ?? 99;
      const progress = rank === 1 ? 100 : Math.max(10, 100 - (rank - 1) * 15);
      return { progress, goalText: `Currently rank #${rank}` };
    }
    default:
      return { progress: challenge.progress, goalText: challenge.goalText };
  }
}

export function syncChallengesFromWorkouts(
  challenges: Challenge[],
  workouts: Workout[],
  profile: UserProfile,
  friendsLb: LeaderboardEntry[]
): Challenge[] {
  return challenges.map((ch) => {
    if (ch.completed || !ch.trackId) return ch;
    const { progress, goalText, squadCurrent } = computeChallengeProgress(
      ch,
      workouts,
      profile,
      friendsLb
    );
    return {
      ...ch,
      progress,
      goalText,
      ...(squadCurrent !== undefined ? { squadCurrent } : {}),
      completed: progress >= 100
    };
  });
}

const PLAYER_PRIORITY: Record<PlayerType, ChallengeTrackId[]> = {
  Achiever: ["weekly_prs", "daily_compounds", "weekly_xp_lead"],
  Explorer: ["weekly_cardio", "daily_compounds", "group_leg"],
  Socialiser: ["group_leg", "weekly_xp_lead", "weekly_cardio"],
  Killer: ["weekly_xp_lead", "weekly_prs", "group_leg"],
  Undecided: ["daily_compounds", "weekly_prs", "weekly_cardio"]
};

export function personalizeChallengeOrder(
  challenges: Challenge[],
  playerType: PlayerType
): Challenge[] {
  const priority = PLAYER_PRIORITY[playerType] ?? [];
  return [...challenges].sort((a, b) => {
    const ai = a.trackId ? priority.indexOf(a.trackId) : 99;
    const bi = b.trackId ? priority.indexOf(b.trackId) : 99;
    const as = ai === -1 ? 99 : ai;
    const bs = bi === -1 ? 99 : bi;
    if (as !== bs) return as - bs;
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return 0;
  });
}

export function applyXp(
  profile: UserProfile,
  amount: number
): { profile: UserProfile; rankUp?: RankUpResult } {
  let currentXp = profile.xp + amount;
  let currentLevel = profile.level;
  let newXpGoal = profile.xpToNextLevel;
  const startRank = profile.rank;

  while (currentXp >= newXpGoal) {
    currentXp -= newXpGoal;
    currentLevel += 1;
    newXpGoal = Math.round(newXpGoal * 1.15);
  }

  const newRank = rankForLevel(currentLevel);
  const profileOut: UserProfile = {
    ...profile,
    level: currentLevel,
    xp: currentXp,
    xpToNextLevel: newXpGoal,
    rank: newRank
  };

  const cosmetics = [...profile.unlockedCosmetics];
  if (newRank === "Silver" && !cosmetics.includes("frame_silver")) cosmetics.push("frame_silver");
  if (newRank === "Gold" && !cosmetics.includes("frame_gold")) cosmetics.push("frame_gold");
  if (newRank === "Platinum" && !cosmetics.includes("aura_platinum")) cosmetics.push("aura_platinum");
  if (newRank === "Elite" && !cosmetics.includes("aura_elite")) cosmetics.push("aura_elite");
  profileOut.unlockedCosmetics = cosmetics;

  let rankUp: RankUpResult | undefined;
  if (newRank !== startRank) {
    rankUp = {
      newRank,
      previousRank: startRank,
      leveledUp: currentLevel > profile.level,
      newLevel: currentLevel
    };
  } else if (currentLevel > profile.level) {
    rankUp = {
      newRank,
      previousRank: startRank,
      leveledUp: true,
      newLevel: currentLevel
    };
  }

  return { profile: profileOut, rankUp };
}

function unlockBadge(badges: Badge[], id: string): Badge[] {
  const now = new Date().toISOString();
  return badges.map((b) => (b.id === id && !b.unlockedAt ? { ...b, unlockedAt: now } : b));
}

function streakMilestoneXp(streak: number): number {
  if (streak === 7) return 200;
  if (streak === 14) return 400;
  if (streak === 30) return 1000;
  return 0;
}

export function processWorkoutFinish(
  workout: Workout,
  profile: UserProfile,
  workouts: Workout[],
  challenges: Challenge[],
  boss: BossChallenge,
  badges: Badge[],
  friendsLb: LeaderboardEntry[],
  feed: SocialWorkout[],
  meAvatar: string
): WorkoutFinishResult {
  const hasPR = workout.exercises.some((e) => e.sets.some((s) => s.isPR));
  const notifications: AppNotification[] = [];
  const newlyCompletedChallengeIds: string[] = [];

  const lastWorkout = workouts[0];
  let missedDay = false;
  if (lastWorkout) {
    const diffDays = Math.floor(
      (Date.now() - new Date(lastWorkout.rawDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    missedDay = diffDays > 1;
  }

  let newProfile = { ...profile };
  let newShields = profile.streakShields;

  if (missedDay) {
    if (newShields > 0) {
      newShields -= 1;
      notifications.push({
        id: `shield_${Date.now()}`,
        type: "streak_risk",
        message: "Streak Shield used! Your streak is protected.",
        createdAt: new Date().toISOString()
      });
    } else {
      newProfile.streak = 1;
    }
  } else {
    newProfile.streak = profile.streak + 1;
  }

  newProfile.streakShields = newShields;
  newProfile.workoutsCompleted = profile.workoutsCompleted + 1;
  newProfile.lastWorkoutDate = workout.rawDate;
  newProfile.globalRank = Math.max(10, profile.globalRank - (workout.xpEarned > 500 ? 1 : 0));

  if (newProfile.streak >= 7 && !newProfile.day7ShieldAwarded) {
    newProfile.streakShields += 1;
    newProfile.day7ShieldAwarded = true;
    notifications.push({
      id: `d7_${Date.now()}`,
      type: "badge",
      message: "7-day streak! You earned a free Streak Shield.",
      createdAt: new Date().toISOString()
    });
  }

  const milestoneXp = streakMilestoneXp(newProfile.streak);
  let bonusXp = 0;
  if (Math.random() < 0.12) {
    bonusXp = Math.round(50 + Math.random() * 100);
    notifications.push({
      id: `bonus_${Date.now()}`,
      type: "bonus_xp",
      message: `Surprise bonus! +${bonusXp} XP from a mystery event.`,
      createdAt: new Date().toISOString()
    });
  }

  let newBoss = { ...boss };
  const newBossWorkouts = Math.min(boss.workoutsGoal, boss.workoutsCurrent + 1);
  const newBossPRs = hasPR
    ? Math.min(boss.prGoalCount, boss.prCurrentCount + 1)
    : boss.prCurrentCount;
  const bossJustCompleted =
    !boss.completed && newBossWorkouts >= boss.workoutsGoal && newBossPRs >= boss.prGoalCount;

  newBoss = {
    ...newBoss,
    workoutsCurrent: newBossWorkouts,
    prCurrentCount: newBossPRs,
    completed: bossJustCompleted || boss.completed
  };

  if (bossJustCompleted) {
    newProfile.streakShields += boss.shieldReward;
  }

  const allWorkouts = [workout, ...workouts];
  let syncedChallenges = syncChallengesFromWorkouts(
    challenges,
    allWorkouts,
    newProfile,
    friendsLb
  );

  syncedChallenges = syncedChallenges.map((ch) => {
    if (ch.completed && !challenges.find((c) => c.id === ch.id)?.completed) {
      newlyCompletedChallengeIds.push(ch.id);
      const bonus = ch.type === "Daily" ? DAILY_CHALLENGE_BONUS_XP : 0;
      return { ...ch, xpReward: ch.xpReward + bonus };
    }
    return ch;
  });

  let newBadges = [...badges];
  if (hasPR) newBadges = unlockBadge(newBadges, "pr_hunter");
  if (newProfile.workoutsCompleted === 1) newBadges = unlockBadge(newBadges, "first_log");
  if (newProfile.streak >= 7) newBadges = unlockBadge(newBadges, "streak_7");
  if (newProfile.streak >= 14) newBadges = unlockBadge(newBadges, "streak_14");
  if (hasCardioInWorkouts([workout])) newBadges = unlockBadge(newBadges, "cardio_start");
  if (bossJustCompleted) newBadges = unlockBadge(newBadges, boss.badgeReward);

  let xpGain = workout.xpEarned + bonusXp + milestoneXp;
  syncedChallenges.forEach((ch) => {
    if (newlyCompletedChallengeIds.includes(ch.id)) {
      xpGain += ch.xpReward;
      if (ch.trackId === "group_leg") newBadges = unlockBadge(newBadges, "squad_lead");
    }
  });
  if (bossJustCompleted) xpGain += boss.xpReward;

  const week = workoutsInLastDays(allWorkouts, 7);
  if (hasCardioInWorkouts(week) && week.some((w) => w.exercises.some((e) => e.category !== "Cardio"))) {
    newBadges = unlockBadge(newBadges, "variety_week");
  }

  const xpResult = applyXp(newProfile, xpGain);
  newProfile = xpResult.profile;

  if (xpResult.rankUp) {
    notifications.push({
      id: `rank_${Date.now()}`,
      type: "rank_up",
      message: `Rank up! You are now ${xpResult.rankUp.newRank}.`,
      createdAt: new Date().toISOString()
    });
  }

  const newFriends = friendsLb
    .map((friend) => {
      if (friend.isMe) {
        return {
          ...friend,
          xp: friend.xp + workout.xpEarned,
          weeklyXp: (friend.weeklyXp ?? 0) + workout.xpEarned,
          tier: newProfile.rank
        };
      }
      return {
        ...friend,
        xp: friend.xp + Math.round(Math.random() * 80 + 30),
        weeklyXp: (friend.weeklyXp ?? 0) + Math.round(Math.random() * 40 + 20)
      };
    })
    .sort((a, b) => b.xp - a.xp)
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  const meEntry = newFriends.find((f) => f.isMe);
  if (meEntry?.rank === 1) newBadges = unlockBadge(newBadges, "top_performer");

  const feedEntry: SocialWorkout = {
    id: `sw_${Date.now()}`,
    authorName: newProfile.name,
    authorAvatar: meAvatar,
    authorTier: newProfile.rank,
    isMe: true,
    highFiveCount: 0,
    workout: { ...workout, date: "Just now" }
  };

  let milestoneKey: string | undefined;
  if (xpResult.rankUp) milestoneKey = `rank_${xpResult.rankUp.newRank}`;
  else if (bossJustCompleted) milestoneKey = "boss_complete";
  else if (newlyCompletedChallengeIds.length > 0) milestoneKey = `quest_${newlyCompletedChallengeIds[0]}`;

  return {
    profile: newProfile,
    boss: newBoss,
    challenges: syncedChallenges,
    badges: newBadges,
    friendsLb: newFriends,
    feed: [feedEntry, ...feed],
    notifications,
    bonusXp: bonusXp + milestoneXp,
    rankUp: xpResult.rankUp,
    newlyCompletedChallengeIds,
    milestoneKey
  };
}

export function generateRecommendations(
  profile: UserProfile,
  workouts: Workout[]
): WorkoutRecommendation[] {
  const week = workoutsInLastDays(workouts, 7);
  const recs: WorkoutRecommendation[] = [];
  const hasCardio = hasCardioInWorkouts(week);
  const hasStrength = week.some((w) =>
    w.exercises.some((e) => e.category !== "Cardio")
  );

  if (!hasCardio && profile.fitnessGoal !== "strength") {
    recs.push({
      id: "rec_cardio",
      title: "Add a cardio balance session",
      reason: "Scope goal: balance lifting with conditioning. No cardio logged this week.",
      suggestedExercises: ["Treadmill Run", "Stationary Bike"],
      createdAt: new Date().toISOString()
    });
  }

  if (!hasStrength && profile.fitnessGoal !== "cardio") {
    recs.push({
      id: "rec_strength",
      title: "Upper body strength day",
      reason: "Build competence with compound lifts based on your strength goal.",
      suggestedExercises: ["Bench Press", "Barbell Rows"],
      createdAt: new Date().toISOString()
    });
  }

  if (profile.playerType === "Explorer") {
    recs.push({
      id: "rec_explore",
      title: "Try a new movement",
      reason: "Explorer drive: variety keeps motivation high.",
      suggestedExercises: ["Lat Pulldowns", "Leg Raises"],
      createdAt: new Date().toISOString()
    });
  }

  if (profile.playerType === "Killer" && profile.globalRank > 20) {
    recs.push({
      id: "rec_compete",
      title: "High-volume push for rank climb",
      reason: "Killer drive: extra volume can move you up the global board.",
      suggestedExercises: ["Squats", "Bench Press"],
      createdAt: new Date().toISOString()
    });
  }

  return recs.slice(0, 2);
}

export function computeCategoryLeaders(workouts: Workout[], userName: string): CategoryLeader[] {
  const best: Record<string, { value: number; name: string }> = {};
  const mockFriends = [
    { name: "Ana S.", avatar: "AS", bench: 95, squat: 120, dead: 160 },
    { name: "João R.", avatar: "JR", bench: 88, squat: 110, dead: 150 }
  ];

  mockFriends.forEach((f) => {
    best["Bench Press"] = { value: f.bench, name: f.name };
    best["Squats"] = { value: f.squat, name: f.name };
    best["Deadlifts"] = { value: f.dead, name: f.name };
  });

  workouts.forEach((w) => {
    w.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        const val = (s.weight || 0) * (s.reps || 0);
        if (!best[ex.name] || val > best[ex.name].value) {
          best[ex.name] = { value: val, name: userName.split(" ")[0] + " P." };
        }
      });
    });
  });

  return ["Bench Press", "Squats", "Deadlifts"].map((exercise) => {
    const b = best[exercise] ?? { value: 0, name: "—" };
    return {
      exercise,
      name: b.name,
      avatar: b.name.slice(0, 2).toUpperCase(),
      value: b.value,
      unit: "kg·reps",
      isMe: b.name.includes(userName.split(" ")[0])
    };
  });
}

export function shouldShowStreakWarning(profile: UserProfile): boolean {
  if (profile.streak < 1) return false;
  const today = new Date().toDateString();
  if (profile.lastStreakWarningDate === today) return false;
  if (profile.lastWorkoutDate && new Date(profile.lastWorkoutDate).toDateString() === today) {
    return false;
  }
  const hour = new Date().getHours();
  return hour >= 16;
}

export function logEvent(
  analytics: BehavioralEvent[],
  event: string,
  meta?: Record<string, string | number>
): BehavioralEvent[] {
  return [
    { ts: new Date().toISOString(), event, meta },
    ...analytics
  ].slice(0, 200);
}

export function needsQuarterlyOctalysis(profile: UserProfile): boolean {
  if (!profile.octalysisLastTaken) return false;
  const last = new Date(profile.octalysisLastTaken).getTime();
  const quarterMs = 90 * 24 * 60 * 60 * 1000;
  return Date.now() - last > quarterMs;
}
