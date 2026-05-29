import { useState, useEffect } from "react";
import { UserProfile, Workout, Challenge, BossChallenge, LeaderboardEntry, Badge } from "./types";
import { 
  DEFAULT_USER_PROFILE, 
  INITIAL_CHALLENGES, 
  INITIAL_BOSS_CHALLENGE, 
  INITIAL_FRIENDS_LEADERBOARD, 
  INITIAL_GLOBAL_LEADERBOARD, 
  INITIAL_BADGES, 
  INITIAL_WORKOUT_HISTORY 
} from "./data";

// Views
import HomeView from "./components/HomeView";
import WorkoutLogView from "./components/WorkoutLogView";
import LeaderboardView from "./components/LeaderboardView";
import ChallengesView from "./components/ChallengesView";
import ProfileView from "./components/ProfileView";
import AICoachTab from "./components/AICoachTab";
import OnboardingSurvey from "./components/OnboardingSurvey";
import MainQuizOverlay from "./components/MainQuizOverlay";

// Icons
import { Home, Plus, Trophy, Target, User, Bot, Sparkles, HelpCircle, Activity } from "lucide-react";

export default function App() {
  // App states initialized cleanly from local storage if available
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

  const [activeTab, setActiveTab] = useState<string>("Home");
  const [showDrivesQuiz, setShowDrivesQuiz] = useState<boolean>(false);

  // Sync state with local storage
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

  // Handle survey completions
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

  // Add customized AI challenge straight to targets roster
  const handleAddChallenge = (newChallenge: Challenge) => {
    setActiveChallenges((prev) => [newChallenge, ...prev]);
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

  // Dynamically calculate and increment XP safely
  const handleIncrementXP = (amount: number) => {
    setUserProfile((prev) => {
      let currentXp = prev.xp + amount;
      let currentLevel = prev.level;
      let newXpGoal = prev.xpToNextLevel;

      while (currentXp >= newXpGoal) {
        currentXp -= newXpGoal;
        currentLevel += 1;
        newXpGoal = Math.round(newXpGoal * 1.15); // scales slowly
      }

      // Automatically award level milestones or badges based on total workouts
      return {
        ...prev,
        level: currentLevel,
        xp: currentXp,
        xpToNextLevel: newXpGoal
      };
    });
  };

  // Handle completed Workout entries
  const handleFinishWorkout = (workout: Workout) => {
    // Add workout to history list
    setWorkoutHistory((prev) => [workout, ...prev]);

    // Handle completed milestones inside profile & boss HP reductions
    setUserProfile((prev) => {
      // Calculate new streak logic
      const activeStreak = prev.streak + 1;
      const totalCount = prev.workoutsCompleted + 1;

      // Update global leaderboard rank dynamically as they earn points
      const nextGlobalPos = Math.max(10, prev.globalRank - (workout.xpEarned > 500 ? 1 : 0));

      return {
        ...prev,
        streak: activeStreak,
        workoutsCompleted: totalCount,
        globalRank: nextGlobalPos
      };
    });

    // Check if new PR flag was raised to auto-unlock the "PR Hunter" Badge in the cabinet!
    const hasPR = workout.exercises.some((e) => e.sets.some((s) => s.isPR));
    if (hasPR) {
      setBadges((prev) =>
        prev.map((b) => (b.id === "pr_hunter" ? { ...b, unlockedAt: new Date().toISOString() } : b))
      );
    }

    // Boost the Boss active count metrics
    setBossChallenge((prev) => {
      const updatedCount = prev.workoutsCurrent + 1;
      const isCompleteNow = updatedCount >= prev.workoutsGoal;

      if (isCompleteNow && !prev.completed) {
        // Unlock boss badge when slain
        setBadges((prevBadges) =>
          prevBadges.map((b) => (b.id === prev.badgeReward ? { ...b, unlockedAt: new Date().toISOString() } : b))
        );
        handleIncrementXP(prev.xpReward);
        return {
          ...prev,
          workoutsCurrent: updatedCount,
          completed: true
        };
      }

      return {
        ...prev,
        workoutsCurrent: Math.min(prev.workoutsGoal, updatedCount)
      };
    });

    // Increment overall XP
    handleIncrementXP(workout.xpEarned);

    // Dynamic friends leader board points scaling so colleagues also progress logically over time!
    setFriendsLeaderboard((prev) =>
      prev
        .map((friend) => {
          if (friend.isMe) {
            return { ...friend, xp: friend.xp + workout.xpEarned };
          }
          // other friends earn 100-200 random points on workouts to keep things competitive
          return { ...friend, xp: friend.xp + Math.round(Math.random() * 80 + 30) };
        })
        .sort((a, b) => b.xp - a.xp)
        .map((entry, idx) => ({ ...entry, rank: idx + 1 }))
    );
  };

  const handleUpdateLeaderboard = (friends: LeaderboardEntry[], global: LeaderboardEntry[]) => {
    setFriendsLeaderboard(friends);
    setGlobalLeaderboard(global);
  };

  const resetAllLocalState = () => {
    if (confirm("Reset FitQuest quest states & wipe logs history?")) {
      localStorage.removeItem("fq_profile_v2");
      localStorage.removeItem("fq_workouts_v2");
      localStorage.removeItem("fq_challenges_v2");
      localStorage.removeItem("fq_boss_v2");
      localStorage.removeItem("fq_friends_v2");
      localStorage.removeItem("fq_global_v2");
      localStorage.removeItem("fq_badges_v2");
      window.location.reload();
    }
  };

  return (
    <div id="application-root" className="min-h-screen bg-[#050505] flex flex-col md:flex-row relative font-sans text-slate-100">
      
      {/* Dynamic onboarding Survey launcher */}
      {!userProfile.onboardingComplete && (
        <OnboardingSurvey onComplete={handleOnboardingComplete} />
      )}

      {/* Main Drives Quiz Overlays */}
      {showDrivesQuiz && (
        <MainQuizOverlay 
          userProfile={userProfile} 
          onUpdateScores={handleUpdateScores} 
          onClose={() => setShowDrivesQuiz(false)} 
        />
      )}

      {/* Left Column Section: Dynamic Desktop Branding + Analytics Summary Panel */}
      <div className="hidden md:flex md:w-1/3 bg-gradient-to-br from-zinc-900 via-zinc-950 to-[#050505] border-r border-white/10 p-8 flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 font-black relative">
              🏆
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white font-serif italic">FitQuest</h1>
              <p className="text-[10px] uppercase font-mono tracking-widest font-bold text-cyan-400">Gamified Strength & Splits Companion</p>
            </div>
          </div>

          <div className="space-y-6 mt-12">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono mb-2">Theoretical Foundations</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans font-medium">
                This environment applies Yu-kai Chou's <strong>Octalysis Framework</strong> to map eight primary intrinsic motivators, including <em>Development & Accomplishment</em> (climbing 5 tiers), <em>Loss & Avoidance</em> (Streak Protection Shield mechanics), and <em>Social Influence</em> (Weekly High-Fives list).
              </p>
            </div>

            {/* Live profile drives summaries */}
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-5 space-y-3.5 shadow-lg">
              <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono">Current Drives Index</h4>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block">Accomplishment:</span>
                  <strong className="text-white text-xs">{userProfile.octalysisScores.accomplishment}%</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Creativity Drive:</span>
                  <strong className="text-white text-xs">{userProfile.octalysisScores.creativity}%</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Social Influence:</span>
                  <strong className="text-white text-xs">{userProfile.octalysisScores.influence}%</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Loss Avoidance:</span>
                  <strong className="text-white text-xs">{userProfile.octalysisScores.avoidance}%</strong>
                </div>
              </div>

              <button
                onClick={() => setShowDrivesQuiz(true)}
                className="mt-4 w-full rounded-xl bg-white text-black hover:bg-cyan-400 py-2.5 text-center text-[10px] font-mono tracking-widest uppercase font-bold transition-all duration-200"
              >
                Assess Octalysis Drives
              </button>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={resetAllLocalState}
            className="text-slate-600 hover:text-yellow-500 text-[10px] font-mono tracking-widest uppercase font-bold hover:underline"
          >
            Reset App States & Clear Memory
          </button>
        </div>
      </div>

      {/* Center Mobile-First View Container */}
      <div id="device-simulator-wrapper" className="flex-1 flex justify-center items-stretch h-screen overflow-hidden w-full font-sans">
        <div id="phone-shell border" className="w-full max-w-md bg-[#050505] md:border-x border-white/10 flex flex-col h-full shadow-2xl relative shadow-cyan-500/5">
          
          {/* Core Body Window Scroll */}
          <div className="flex-1 overflow-hidden relative">
            {activeTab === "Home" && (
              <HomeView 
                userProfile={userProfile} 
                activeChallenges={activeChallenges} 
                onChangeUserProfile={setUserProfile}
                onNavigateToTab={setActiveTab}
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
                onChangeUserProfile={setUserProfile}
                onNavigateToTab={setActiveTab}
              />
            )}
            {activeTab === "Coach" && (
              <AICoachTab 
                userProfile={userProfile} 
                workoutHistory={workoutHistory} 
                onAddChallenge={handleAddChallenge}
                onNavigateToTab={setActiveTab}
              />
            )}
          </div>

          {/* Bottom Footers Navigation Bar */}
          <div className="h-[75px] bg-[#050505] border-t border-white/10 flex items-center justify-around px-2 py-2 shrink-0 relative z-20">
            <button 
              onClick={() => setActiveTab("Home")}
              className={`flex flex-col items-center gap-1 flex-1 transition-colors ${
                activeTab === "Home" ? "text-cyan-400" : "text-slate-400 hover:text-white"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[9px] font-mono tracking-wide">Home</span>
            </button>
            <button 
              onClick={() => setActiveTab("Log")}
              className={`flex flex-col items-center gap-1 flex-1 transition-colors ${
                activeTab === "Log" ? "text-cyan-400" : "text-slate-400 hover:text-white"
              }`}
            >
              <Plus className="w-5 h-5 bg-cyan-500/10 p-1 rounded-lg border border-cyan-400/20 shrink-0 text-cyan-400" />
              <span className="text-[9px] font-mono tracking-wide">Log</span>
            </button>
            <button 
              onClick={() => setActiveTab("Rank")}
              className={`flex flex-col items-center gap-1 flex-1 transition-colors ${
                activeTab === "Rank" ? "text-cyan-400" : "text-slate-400 hover:text-white"
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span className="text-[9px] font-mono tracking-wide">Rank</span>
            </button>
            <button 
              onClick={() => setActiveTab("Goals")}
              className={`flex flex-col items-center gap-1 flex-1 transition-colors ${
                activeTab === "Goals" ? "text-cyan-400" : "text-slate-400 hover:text-white"
              }`}
            >
              <Target className="w-5 h-5" />
              <span className="text-[9px] font-mono tracking-wide">Goals</span>
            </button>
            <button 
              onClick={() => setActiveTab("Coach")}
              className={`flex flex-col items-center gap-1 flex-1 transition-colors ${
                activeTab === "Coach" ? "text-cyan-400 animate-pulse font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Bot className="w-5 h-5" />
              <span className="text-[9px] font-mono tracking-wide">AI Coach</span>
            </button>
            <button 
              onClick={() => setActiveTab("Profile")}
              className={`flex flex-col items-center gap-1 flex-1 transition-colors ${
                activeTab === "Profile" ? "text-cyan-400" : "text-slate-400 hover:text-white"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[9px] font-mono tracking-wide">Profile</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
