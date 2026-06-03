import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { pageTransition, tapScale } from "./motionPresets";
import type {
  UserProfile,
  Workout,
  Challenge,
  BossChallenge,
  LeaderboardEntry,
  Badge,
  SocialWorkout,
  AppNotification,
  WorkoutRecommendation,
  BehavioralEvent,
  RankUpResult
} from "./types";
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
import {
  migrateProfile,
  applySeasonResetIfDue,
  applyWeeklyResetIfDue,
  syncChallengesFromWorkouts,
  personalizeChallengeOrder,
  processWorkoutFinish,
  generateRecommendations,
  applyXp,
  logEvent,
  needsQuarterlyOctalysis,
  shouldShowStreakWarning,
  isLeaderboardUnlocked,
  isAnalyticsUnlocked
} from "./gamification";

import HomeView from "./components/HomeView";
import WorkoutLogView from "./components/WorkoutLogView";
import LeaderboardView from "./components/LeaderboardView";
import ChallengesView from "./components/ChallengesView";
import ProfileView from "./components/ProfileView";
import OnboardingSurvey from "./components/OnboardingSurvey";
import MainQuizOverlay from "./components/MainQuizOverlay";
import RankUpOverlay from "./components/RankUpOverlay";
import MilestoneFeedbackModal from "./components/MilestoneFeedbackModal";
import { loadTeacherDemo } from "./demoMode";
import {
  getStoredTourLang,
  isTeacherTourDone,
  parseTourLangParam,
  setStoredTourLang,
  shouldAutoStartTour,
  startTeacherTour,
  type TourLang
} from "./teacherTour";

import { Home, Plus, Trophy, Target, User } from "lucide-react";

type Tab = "Home" | "Log" | "Rank" | "Goals" | "Profile";

const NAV_ITEMS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "Home", label: "Home", icon: Home },
  { id: "Rank", label: "Rank", icon: Trophy },
  { id: "Log", label: "Log", icon: Plus },
  { id: "Goals", label: "Goals", icon: Target },
  { id: "Profile", label: "Profile", icon: User },
];

function meAvatar(profile: UserProfile) {
  return profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    migrateProfile(
      localStorage.getItem("fq_profile_v2")
        ? JSON.parse(localStorage.getItem("fq_profile_v2")!)
        : null
    )
  );

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

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem("fq_notifications_v2");
    return saved ? JSON.parse(saved) : [];
  });

  const [recommendations, setRecommendations] = useState<WorkoutRecommendation[]>(() => {
    const saved = localStorage.getItem("fq_recommendations_v2");
    return saved ? JSON.parse(saved) : [];
  });

  const [analytics, setAnalytics] = useState<BehavioralEvent[]>(() => {
    const saved = localStorage.getItem("fq_analytics_v2");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<Tab>("Home");
  const [showDrivesQuiz, setShowDrivesQuiz] = useState(false);
  const [homeToast, setHomeToast] = useState<string | null>(null);
  const [rankUpOverlay, setRankUpOverlay] = useState<RankUpResult | null>(null);
  const [milestoneKey, setMilestoneKey] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const tourAutoStarted = useRef(false);
  const [tourCompleted, setTourCompleted] = useState(() => isTeacherTourDone());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLang = parseTourLangParam(params.get("lang"));
    if (urlLang) setStoredTourLang(urlLang);

    if (params.get("tour") === "1" && sessionStorage.getItem("fq_demo_seeded") !== "1") {
      loadTeacherDemo({ restartTour: true });
      sessionStorage.setItem("fq_demo_seeded", "1");
      const next = new URLSearchParams({ tour: "1" });
      if (urlLang) next.set("lang", urlLang);
      window.location.replace(`${window.location.pathname}?${next.toString()}`);
    }
  }, []);

  const leaderboardUnlocked = isLeaderboardUnlocked(userProfile, workoutHistory);
  const analyticsUnlocked = isAnalyticsUnlocked(workoutHistory);

  const orderedChallenges = useMemo(
    () => personalizeChallengeOrder(activeChallenges, userProfile.playerType),
    [activeChallenges, userProfile.playerType]
  );

  const syncedChallenges = useMemo(
    () => syncChallengesFromWorkouts(activeChallenges, workoutHistory, userProfile, friendsLeaderboard),
    [activeChallenges, workoutHistory, userProfile, friendsLeaderboard]
  );

  useEffect(() => {
    if (hydrated) return;
    let profile = migrateProfile(userProfile);
    const season = applySeasonResetIfDue(profile);
    profile = season.profile;
    const weekly = applyWeeklyResetIfDue(friendsLeaderboard, profile);
    profile = weekly.profile;
    if (season.reset || weekly.reset) {
      setUserProfile(profile);
      if (weekly.reset) setFriendsLeaderboard(weekly.friends);
      setNotifications((n) => [...season.notifications, ...n]);
    }
    const synced = syncChallengesFromWorkouts(
      activeChallenges,
      workoutHistory,
      profile,
      weekly.friends
    );
    setActiveChallenges(synced);
    setRecommendations(generateRecommendations(profile, workoutHistory));
    if (needsQuarterlyOctalysis(profile)) setShowDrivesQuiz(true);
    setHydrated(true);
    setAnalytics((a) => logEvent(a, "app_open"));
  }, []);

  useEffect(() => {
    localStorage.setItem("fq_profile_v2", JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("fq_workouts_v2", JSON.stringify(workoutHistory));
    setRecommendations(generateRecommendations(userProfile, workoutHistory));
    const synced = syncChallengesFromWorkouts(
      activeChallenges,
      workoutHistory,
      userProfile,
      friendsLeaderboard
    );
    if (JSON.stringify(synced) !== JSON.stringify(activeChallenges)) {
      setActiveChallenges(synced);
    }
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

  useEffect(() => {
    localStorage.setItem("fq_notifications_v2", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("fq_recommendations_v2", JSON.stringify(recommendations));
  }, [recommendations]);

  useEffect(() => {
    localStorage.setItem("fq_analytics_v2", JSON.stringify(analytics));
  }, [analytics]);

  useEffect(() => {
    if (shouldShowStreakWarning(userProfile)) {
      setNotifications((prev) => {
        if (prev.some((n) => n.type === "streak_risk" && !n.read)) return prev;
        return [
          {
            id: `streak_warn_${Date.now()}`,
            type: "streak_risk",
            message: "Your streak is at risk today. Log a workout or rest day before midnight.",
            createdAt: new Date().toISOString()
          },
          ...prev
        ];
      });
      setUserProfile((p) => ({ ...p, lastStreakWarningDate: new Date().toDateString() }));
    }
  }, [userProfile.streak, userProfile.lastWorkoutDate]);

  const handleOnboardingSurveyComplete = (surveyProfile: Partial<UserProfile>) => {
    setUserProfile((prev) => ({
      ...prev,
      ...surveyProfile,
      onboardingPhase: "octalysis",
      onboardingComplete: false
    }));
    setAnalytics((a) => logEvent(a, "onboarding_survey_complete"));
  };

  const handleOctalysisComplete = (newScores: UserProfile["octalysisScores"]) => {
    setUserProfile((prev) => ({
      ...prev,
      octalysisScores: newScores,
      octalysisLastTaken: new Date().toISOString(),
      onboardingPhase: "done",
      onboardingComplete: true
    }));
    setShowDrivesQuiz(false);
    setAnalytics((a) => logEvent(a, "octalysis_complete"));
  };

  const handleUpdateScores = (newScores: UserProfile["octalysisScores"]) => {
    handleOctalysisComplete(newScores);
  };

  const handleIncrementXP = useCallback((amount: number) => {
    setUserProfile((prev) => {
      const { profile, rankUp } = applyXp(prev, amount);
      if (rankUp) setRankUpOverlay(rankUp);
      return profile;
    });
  }, []);

  const handleFinishWorkout = (workout: Workout) => {
    const result = processWorkoutFinish(
      workout,
      userProfile,
      workoutHistory,
      activeChallenges,
      bossChallenge,
      badges,
      friendsLeaderboard,
      socialFeed,
      meAvatar(userProfile)
    );

    setWorkoutHistory((prev) => [workout, ...prev]);
    setUserProfile(result.profile);
    setBossChallenge(result.boss);
    setActiveChallenges(result.challenges);
    setBadges(result.badges);
    setFriendsLeaderboard(result.friendsLb);
    setSocialFeed(result.feed);
    setNotifications((n) => [...result.notifications, ...n]);

    if (result.rankUp) setRankUpOverlay(result.rankUp);
    if (result.milestoneKey && !userProfile.dismissedMilestones.includes(result.milestoneKey)) {
      setMilestoneKey(result.milestoneKey);
    }

    const toast = result.notifications[0]?.message;
    if (toast) setHomeToast(toast);

    setAnalytics((a) =>
      logEvent(a, "workout_complete", { xp: workout.xpEarned, pr: result.newlyCompletedChallengeIds.length })
    );
  };

  const handleHighFiveFeed = (id: string) => {
    const entry = socialFeed.find((i) => i.id === id);
    setSocialFeed((prev) =>
      prev.map((item) =>
        item.id === id && !item.highFived && !item.isMe
          ? { ...item, highFived: true, highFiveCount: item.highFiveCount + 1 }
          : item
      )
    );
    setUserProfile((p) => {
      const next = { ...p, highFivesSent: p.highFivesSent + 1 };
      return next;
    });
    setBadges((prev) => {
      const sent = userProfile.highFivesSent + 1;
      if (sent >= 10) {
        return prev.map((b) =>
          b.id === "high_five_10" && !b.unlockedAt
            ? { ...b, unlockedAt: new Date().toISOString() }
            : b
        );
      }
      if (sent >= 5) {
        return prev.map((b) =>
          b.id === "mentor" && !b.unlockedAt ? { ...b, unlockedAt: new Date().toISOString() } : b
        );
      }
      return prev;
    });
    if (entry) {
      setNotifications((n) => [
        {
          id: `hf_${Date.now()}`,
          type: "high_five",
          message: `High five sent to ${entry.authorName.split(" ")[0]}! They got a notification.`,
          createdAt: new Date().toISOString()
        },
        ...n
      ]);
    }
    setAnalytics((a) => logEvent(a, "high_five_sent"));
  };

  const handleLogRestDay = () => {
    setUserProfile((prev) => ({
      ...prev,
      streak: prev.streak + 1,
      restDaysLogged: (prev.restDaysLogged || 0) + 1,
      lastWorkoutDate: new Date().toISOString()
    }));
    handleIncrementXP(100);
    setSocialFeed((prev) => {
      const restEntry: SocialWorkout = {
        id: `sw_rest_${Date.now()}`,
        authorName: userProfile.name,
        authorAvatar: meAvatar(userProfile),
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
    setAnalytics((a) => logEvent(a, "rest_day_logged"));
  };

  const handleToggleFollow = (name: string) => {
    setUserProfile((p) => {
      const following = p.following.includes(name)
        ? p.following.filter((n) => n !== name)
        : [...p.following, name];
      return { ...p, following };
    });
    setAnalytics((a) => logEvent(a, "follow_toggle", { name }));
  };

  const handleActOnRecommendation = (id: string) => {
    setRecommendations((r) => r.map((rec) => (rec.id === id ? { ...rec, actedOn: true } : rec)));
    setActiveTab("Log");
    setAnalytics((a) => logEvent(a, "recommendation_acted", { id }));
  };

  const handleMilestoneFeedback = (rating: number) => {
    if (milestoneKey) {
      setUserProfile((p) => ({
        ...p,
        dismissedMilestones: [...p.dismissedMilestones, milestoneKey]
      }));
      setAnalytics((a) => logEvent(a, "milestone_feedback", { key: milestoneKey, rating }));
    }
    setMilestoneKey(null);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setAnalytics((a) => logEvent(a, "tab_view", { tab }));
  };

  const handleStartTeacherTour = useCallback((lang: TourLang) => {
    startTeacherTour(handleTabChange, lang, {
      onComplete: () => setTourCompleted(true)
    });
  }, []);

  const handleLoadTeacherDemo = useCallback(() => {
    loadTeacherDemo({ restartTour: true });
    sessionStorage.setItem("fq_demo_seeded", "1");
    window.location.reload();
  }, []);

  const resetAllLocalState = () => {
    if (confirm("Reset FitQuest and wipe all progress?")) {
      [
        "fq_profile_v2",
        "fq_workouts_v2",
        "fq_challenges_v2",
        "fq_boss_v2",
        "fq_friends_v2",
        "fq_global_v2",
        "fq_badges_v2",
        "fq_social_feed_v2",
        "fq_notifications_v2",
        "fq_recommendations_v2",
        "fq_analytics_v2",
        "fq_teacher_tour_done_v1",
        "fq_demo_mode_v1",
        "fq_auto_tour_v1",
        "fq_tour_lang_v1"
      ].forEach((k) => localStorage.removeItem(k));
      window.location.reload();
    }
  };

  const showMainApp = userProfile.onboardingPhase === "done";
  const showOctalysis =
    userProfile.onboardingPhase === "octalysis" || (showDrivesQuiz && showMainApp);

  useEffect(() => {
    if (!showMainApp || tourAutoStarted.current || isTeacherTourDone()) return;
    if (!shouldAutoStartTour()) return;
    tourAutoStarted.current = true;
    const timer = window.setTimeout(() => {
      startTeacherTour(handleTabChange, getStoredTourLang(), {
        onComplete: () => setTourCompleted(true)
      });
    }, 900);
    return () => window.clearTimeout(timer);
  }, [showMainApp, handleTabChange]);

  return (
    <div className="h-dvh bg-fq-bg flex flex-col font-sans text-[#f0f0f0] safe-x overflow-hidden">
      {userProfile.onboardingPhase === "survey" && (
        <OnboardingSurvey onComplete={handleOnboardingSurveyComplete} />
      )}

      {showOctalysis && (
        <MainQuizOverlay
          userProfile={userProfile}
          onUpdateScores={handleUpdateScores}
          onClose={() => {
            if (userProfile.onboardingPhase === "done") setShowDrivesQuiz(false);
          }}
          required={userProfile.onboardingPhase === "octalysis"}
        />
      )}

      {rankUpOverlay && (
        <RankUpOverlay rankUp={rankUpOverlay} onClose={() => setRankUpOverlay(null)} />
      )}

      {milestoneKey && (
        <MilestoneFeedbackModal
          milestoneKey={milestoneKey}
          onSubmit={handleMilestoneFeedback}
          onDismiss={() => setMilestoneKey(null)}
        />
      )}

      {showMainApp && (
        <>
          <main className="flex-1 min-h-0 overflow-hidden main-with-nav">
            <div className="h-full min-h-0">
              <AnimatePresence mode="wait">
                {activeTab === "Home" && (
                  <motion.div key="Home" className="h-full min-h-0" {...pageTransition}>
                    <HomeView
                      userProfile={userProfile}
                      workoutHistory={workoutHistory}
                      activeChallenges={orderedChallenges}
                      socialFeed={socialFeed}
                      recommendations={recommendations}
                      notifications={notifications}
                      homeToast={homeToast}
                      leaderboardUnlocked={leaderboardUnlocked}
                      showTourPromo={!tourCompleted}
                      onChangeUserProfile={(updates) => setUserProfile((prev) => ({ ...prev, ...updates }))}
                      onNavigateToTab={(t) => handleTabChange(t as Tab)}
                      onHighFiveFeed={handleHighFiveFeed}
                      onLogRestDay={handleLogRestDay}
                      onClearHomeToast={() => setHomeToast(null)}
                      onActOnRecommendation={handleActOnRecommendation}
                      onDismissNotification={(id) =>
                        setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)))
                      }
                      onStartTeacherTour={handleStartTeacherTour}
                    />
                  </motion.div>
                )}
                {activeTab === "Log" && (
                  <motion.div key="Log" className="h-full min-h-0" {...pageTransition}>
                    <WorkoutLogView
                      userProfile={userProfile}
                      lastWorkout={workoutHistory[0]}
                      onFinishWorkout={handleFinishWorkout}
                      onNavigateToTab={(t) => handleTabChange(t as Tab)}
                    />
                  </motion.div>
                )}
                {activeTab === "Rank" && (
                  <motion.div key="Rank" className="h-full min-h-0" {...pageTransition}>
                    <LeaderboardView
                      userProfile={userProfile}
                      friendsLeaderboard={friendsLeaderboard}
                      globalLeaderboard={globalLeaderboard}
                      workoutHistory={workoutHistory}
                      leaderboardUnlocked={leaderboardUnlocked}
                      onChangeLeaderboards={(friends, global) => {
                        setFriendsLeaderboard(friends);
                        setGlobalLeaderboard(global);
                      }}
                    />
                  </motion.div>
                )}
                {activeTab === "Goals" && (
                  <motion.div key="Goals" className="h-full min-h-0" {...pageTransition}>
                    <ChallengesView
                      bossChallenge={bossChallenge}
                      activeChallenges={syncedChallenges}
                      playerType={userProfile.playerType}
                    />
                  </motion.div>
                )}
                {activeTab === "Profile" && (
                  <motion.div key="Profile" className="h-full min-h-0" {...pageTransition}>
                    <ProfileView
                      userProfile={userProfile}
                      workoutHistory={workoutHistory}
                      badges={badges}
                      analyticsUnlocked={analyticsUnlocked}
                      analyticsEventCount={analytics.length}
                      onChangeUserProfile={(updates) => setUserProfile((prev) => ({ ...prev, ...updates }))}
                      onNavigateToTab={(t) => handleTabChange(t as Tab)}
                      onOpenDrivesQuiz={() => setShowDrivesQuiz(true)}
                      onResetApp={resetAllLocalState}
                      onToggleFollow={handleToggleFollow}
                      friendsLeaderboard={friendsLeaderboard}
                      onStartTeacherTour={handleStartTeacherTour}
                      onLoadTeacherDemo={handleLoadTeacherDemo}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
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
                const locked = id === "Rank" && !leaderboardUnlocked;

                if (isLog) {
                  return (
                    <motion.button
                      key={id}
                      data-tour="nav-log"
                      onClick={() => handleTabChange(id)}
                      aria-label={label}
                      aria-current={isActive ? "page" : undefined}
                      whileTap={tapScale}
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
                    </motion.button>
                  );
                }

                const tourId =
                  id === "Home"
                    ? "nav-home"
                    : id === "Rank"
                      ? "nav-rank"
                      : id === "Goals"
                        ? "nav-goals"
                        : "nav-profile";

                return (
                  <motion.button
                    key={id}
                    data-tour={tourId}
                    onClick={() => !locked && handleTabChange(id)}
                    aria-label={label}
                    aria-current={isActive ? "page" : undefined}
                    disabled={locked}
                    whileTap={locked ? undefined : tapScale}
                    className={`flex flex-col items-center gap-[3px] flex-1 touch-target transition-colors ${
                      isActive ? "text-fq-accent" : locked ? "text-white/15" : "text-white/35"
                    }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.25 : 1.75} />
                    <span className="text-[10px] font-medium">{label}</span>
                  </motion.button>
                );
              })}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
