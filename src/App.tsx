import { useState, useEffect } from "react";
import { UserProfile, Workout, Challenge, BossChallenge, LeaderboardEntry, Badge, SocialWorkout } from "./types";
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

import HomeView from "./components/HomeView";
import WorkoutLogView from "./components/WorkoutLogView";
import LeaderboardView from "./components/LeaderboardView";
import ChallengesView from "./components/ChallengesView";
import ProfileView from "./components/ProfileView";
import OnboardingSurvey from "./components/OnboardingSurvey";
import MainQuizOverlay from "./components/MainQuizOverlay";

import { Home, Plus, Trophy, Target, User } from "lucide-react";

type Tab = "Home" | "Log" | "Rank" | "Goals" | "Profile";

const NAV_ITEMS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "Home", label: "Home", icon: Home },
  { id: "Rank", label: "Rank", icon: Trophy },
  { id: "Log", label: "Log", icon: Plus },
  { id: "Goals", label: "Goals", icon: Target },
  { id: "Profile", label: "Profile", icon: User },
];

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("fq_profile_v2");
    return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
  });

  const [workoutHistory, setWorkoutHistory] = useState<Workout[]>(() => {
    const saved = localStorage.getItem("fq_workouts_v2");
    return saved ? JSON.parse(saved) : INITIAL_WORKOUT_HISTORY;
  });

  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem("fq_challenges_v2");
    return saved ? JSON.parse(saved) : INITIAL_CHALLENGES;
  });

  const [bossChallenge, setBossChallenge] = useState<BossChallenge>(() => {
    const saved = localStorage.getItem("fq_boss_v2");
    return saved ? JSON.parse(saved) : INITIAL_BOSS_CHALLENGE;
  });

  const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardEntry[]>(() => {
    const saved = localStorage.getItem("fq_friends_v2");
    return saved ? JSON.parse(saved) : INITIAL_FRIENDS_LEADERBOARD;
  });

  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>(() => {
    const saved = localStorage.getItem("fq_global_v2");
    return saved ? JSON.parse(saved) : INITIAL_GLOBAL_LEADERBOARD;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem("fq_badges_v2");
    return saved ? JSON.parse(saved) : INITIAL_BADGES;
  });

  const [socialFeed, setSocialFeed] = useState<SocialWorkout[]>(() => {
    const saved = localStorage.getItem("fq_social_feed_v2");
    return saved ? JSON.parse(saved) : INITIAL_SOCIAL_FEED;
  });

  const [activeTab, setActiveTab] = useState<Tab>("Home");
  const [showDrivesQuiz, setShowDrivesQuiz] = useState(false);
  const [homeToast, setHomeToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("fq_profile_v2", JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("fq_workouts_v2", JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  useEffect(() => {
    localStorage.setItem("fq_challenges_v2", JSON.stringify(activeChallenges));
  }, [activeChallenges]);

  useEffect(() => {
    localStorage.setItem("fq_boss_v2", JSON.stringify(bossChallenge));
  }, [bossChallenge]);

  useEffect(() => {
    localStorage.setItem("fq_friends_v2", JSON.stringify(friendsLeaderboard));
  }, [friendsLeaderboard]);

  useEffect(() => {
    localStorage.setItem("fq_global_v2", JSON.stringify(globalLeaderboard));
  }, [globalLeaderboard]);

  useEffect(() => {
    localStorage.setItem("fq_badges_v2", JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem("fq_social_feed_v2", JSON.stringify(socialFeed));
  }, [socialFeed]);

  const handleOnboardingComplete = (surveyProfile: Partial<UserProfile>) => {
    setUserProfile((prev) => ({
      ...prev,
      ...surveyProfile,
      onboardingComplete: true
    }));
  };

  const handleUpdateScores = (newScores: UserProfile["octalysisScores"]) => {
    setUserProfile((prev) => ({
      ...prev,
      octalysisScores: newScores
    }));
    setShowDrivesQuiz(false);
  };

  const handleCompleteChallenge = (id: string) => {
    let xpCollected = 0;
    setActiveChallenges((prev) =>
      prev.map((ch) => {
        if (ch.id === id && !ch.completed) {
          xpCollected = ch.xpReward;
          return { ...ch, completed: true, progress: 100 };
        }
        return ch;
      })
    );

    if (xpCollected > 0) {
      handleIncrementXP(xpCollected);
    }
  };

  const handleIncrementXP = (amount: number) => {
    setUserProfile((prev) => {
      let currentXp = prev.xp + amount;
      let currentLevel = prev.level;
      let newXpGoal = prev.xpToNextLevel;

      while (currentXp >= newXpGoal) {
        currentXp -= newXpGoal;
        currentLevel += 1;
        newXpGoal = Math.round(newXpGoal * 1.15);
      }

      return {
        ...prev,
        level: currentLevel,
        xp: currentXp,
        xpToNextLevel: newXpGoal
      };
    });
  };

  const handleFinishWorkout = (workout: Workout) => {
    const hasPR = workout.exercises.some((e) => e.sets.some((s) => s.isPR));

    const lastWorkout = workoutHistory[0];
    let missedDay = false;
    if (lastWorkout) {
      const lastDate = new Date(lastWorkout.rawDate);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      missedDay = diffDays > 1;
    }

    const newBossWorkouts = Math.min(bossChallenge.workoutsGoal, bossChallenge.workoutsCurrent + 1);
    const newBossPRs = hasPR
      ? Math.min(bossChallenge.prGoalCount, bossChallenge.prCurrentCount + 1)
      : bossChallenge.prCurrentCount;
    const bossJustCompleted =
      !bossChallenge.completed &&
      newBossWorkouts >= bossChallenge.workoutsGoal &&
      newBossPRs >= bossChallenge.prGoalCount;

    setWorkoutHistory((prev) => [workout, ...prev]);

    setUserProfile((prev) => {
      let newStreak = prev.streak;
      let newShields = prev.streakShields;

      if (missedDay) {
        if (prev.streakShields > 0) {
          newShields = prev.streakShields - 1;
        } else {
          newStreak = 1;
        }
      } else {
        newStreak = prev.streak + 1;
      }

      return {
        ...prev,
        streak: newStreak,
        streakShields: newShields + (bossJustCompleted ? bossChallenge.shieldReward : 0),
        workoutsCompleted: prev.workoutsCompleted + 1,
        globalRank: Math.max(10, prev.globalRank - (workout.xpEarned > 500 ? 1 : 0))
      };
    });

    if (missedDay && userProfile.streakShields > 0) {
      setHomeToast("Streak Shield used! Your streak is protected.");
    }

    setBossChallenge((prev) => ({
      ...prev,
      workoutsCurrent: newBossWorkouts,
      prCurrentCount: newBossPRs,
      completed: bossJustCompleted || prev.completed
    }));

    if (hasPR) {
      setBadges((prev) =>
        prev.map((b) => (b.id === "pr_hunter" ? { ...b, unlockedAt: new Date().toISOString() } : b))
      );
    }

    if (bossJustCompleted) {
      setBadges((prev) =>
        prev.map((b) =>
          b.id === bossChallenge.badgeReward ? { ...b, unlockedAt: new Date().toISOString() } : b
        )
      );
      handleIncrementXP(bossChallenge.xpReward);
    }

    handleIncrementXP(workout.xpEarned);

    setFriendsLeaderboard((prev) =>
      prev
        .map((friend) => {
          if (friend.isMe) {
            return { ...friend, xp: friend.xp + workout.xpEarned };
          }
          return { ...friend, xp: friend.xp + Math.round(Math.random() * 80 + 30) };
        })
        .sort((a, b) => b.xp - a.xp)
        .map((entry, idx) => ({ ...entry, rank: idx + 1 }))
    );

    setSocialFeed((prev) => {
      const me = friendsLeaderboard.find((f) => f.isMe);
      const feedEntry: SocialWorkout = {
        id: `sw_${Date.now()}`,
        authorName: me?.name || userProfile.name,
        authorAvatar: me?.avatar || userProfile.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
        authorTier: userProfile.rank,
        isMe: true,
        highFiveCount: 0,
        workout: { ...workout, date: "Just now" }
      };
      return [feedEntry, ...prev];
    });
  };

  const handleHighFiveFeed = (id: string) => {
    setSocialFeed((prev) =>
      prev.map((item) =>
        item.id === id && !item.highFived && !item.isMe
          ? { ...item, highFived: true, highFiveCount: item.highFiveCount + 1 }
          : item
      )
    );
  };

  const handleLogRestDay = () => {
    setUserProfile((prev) => ({
      ...prev,
      streak: prev.streak + 1,
      restDaysLogged: (prev.restDaysLogged || 0) + 1
    }));
    handleIncrementXP(100);

    setSocialFeed((prev) => {
      const me = friendsLeaderboard.find((f) => f.isMe);
      const restEntry: SocialWorkout = {
        id: `sw_rest_${Date.now()}`,
        authorName: me?.name || userProfile.name,
        authorAvatar: me?.avatar || userProfile.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        authorTier: userProfile.rank,
        isMe: true,
        highFiveCount: 0,
        workout: {
          id: `rest_${Date.now()}`,
          title: "Recovery Day",
          date: "Just now",
          rawDate: new Date().toISOString(),
          duration: 0,
          exercises: [],
          xpEarned: 100
        }
      };
      return [restEntry, ...prev];
    });
  };

  const handleUpdateLeaderboard = (friends: LeaderboardEntry[], global: LeaderboardEntry[]) => {
    setFriendsLeaderboard(friends);
    setGlobalLeaderboard(global);
  };

  const resetAllLocalState = () => {
    if (confirm("Reset FitQuest and wipe all progress?")) {
      localStorage.removeItem("fq_profile_v2");
      localStorage.removeItem("fq_workouts_v2");
      localStorage.removeItem("fq_challenges_v2");
      localStorage.removeItem("fq_boss_v2");
      localStorage.removeItem("fq_friends_v2");
      localStorage.removeItem("fq_global_v2");
      localStorage.removeItem("fq_badges_v2");
      localStorage.removeItem("fq_social_feed_v2");
      window.location.reload();
    }
  };

  return (
    <div className="h-dvh bg-fq-bg flex flex-col font-sans text-[#f0f0f0] safe-x overflow-hidden">
      {!userProfile.onboardingComplete && (
        <OnboardingSurvey onComplete={handleOnboardingComplete} />
      )}

      {showDrivesQuiz && (
        <MainQuizOverlay
          userProfile={userProfile}
          onUpdateScores={handleUpdateScores}
          onClose={() => setShowDrivesQuiz(false)}
        />
      )}

      <main className="flex-1 min-h-0 overflow-hidden main-with-nav">
        <div className="h-full min-h-0">
          {activeTab === "Home" && (
            <HomeView
              userProfile={userProfile}
              workoutHistory={workoutHistory}
              activeChallenges={activeChallenges}
              socialFeed={socialFeed}
              homeToast={homeToast}
              onChangeUserProfile={(updates) => setUserProfile((prev) => ({ ...prev, ...updates }))}
              onNavigateToTab={setActiveTab}
              onHighFiveFeed={handleHighFiveFeed}
              onLogRestDay={handleLogRestDay}
              onClearHomeToast={() => setHomeToast(null)}
            />
          )}
          {activeTab === "Log" && (
            <WorkoutLogView
              userProfile={userProfile}
              lastWorkout={workoutHistory[0]}
              onFinishWorkout={handleFinishWorkout}
              onNavigateToTab={setActiveTab}
            />
          )}
          {activeTab === "Rank" && (
            <LeaderboardView
              userProfile={userProfile}
              friendsLeaderboard={friendsLeaderboard}
              globalLeaderboard={globalLeaderboard}
              onChangeLeaderboards={handleUpdateLeaderboard}
            />
          )}
          {activeTab === "Goals" && (
            <ChallengesView
              bossChallenge={bossChallenge}
              activeChallenges={activeChallenges}
              onCompleteChallenge={handleCompleteChallenge}
              onNavigateToTab={setActiveTab}
            />
          )}
          {activeTab === "Profile" && (
            <ProfileView
              userProfile={userProfile}
              workoutHistory={workoutHistory}
              badges={badges}
              onChangeUserProfile={(updates) => setUserProfile((prev) => ({ ...prev, ...updates }))}
              onNavigateToTab={setActiveTab}
              onOpenDrivesQuiz={() => setShowDrivesQuiz(true)}
              onResetApp={resetAllLocalState}
            />
          )}
        </div>
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-30 bg-fq-bg border-t border-white/[0.07] safe-bottom safe-x"
        style={{ height: "calc(60px + env(safe-area-inset-bottom, 0px))" }}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around h-[60px] px-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            const isLog = id === "Log";

            if (isLog) {
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  aria-label={label}
                  aria-current={isActive ? "page" : undefined}
                  className="flex flex-col items-center justify-center flex-none mx-1 touch-target"
                  style={{ marginBottom: 4 }}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform active:scale-95 ${
                      isActive ? "ring-2 ring-fq-accent/40" : ""
                    }`}
                    style={{
                      background: "linear-gradient(135deg, #7ee8a2, #3db87a)",
                      color: "#0e1117"
                    }}
                  >
                    <Icon className="w-[22px] h-[22px] stroke-[2.5px]" />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center gap-[3px] flex-1 touch-target transition-colors active:scale-95 ${
                  isActive ? "text-fq-accent" : "text-white/35"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.25 : 1.75} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
