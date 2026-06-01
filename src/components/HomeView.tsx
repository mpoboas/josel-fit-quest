import { UserProfile, Challenge, SocialWorkout, Workout, AppNotification, WorkoutRecommendation } from "../types";
import {
  Award,
  Clock,
  Zap,
  Trophy,
  Shield,
  Heart,
  AlertTriangle,
  Hand,
  Sparkles,
  Bell,
  Lock
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { daysUntilSeasonReset, TIER_ORDER } from "../gamification";

interface Props {
  userProfile: UserProfile;
  workoutHistory: Workout[];
  activeChallenges: Challenge[];
  socialFeed: SocialWorkout[];
  recommendations: WorkoutRecommendation[];
  notifications: AppNotification[];
  homeToast?: string | null;
  leaderboardUnlocked: boolean;
  onChangeUserProfile: (profile: Partial<UserProfile>) => void;
  onNavigateToTab: (tab: string) => void;
  onHighFiveFeed: (id: string) => void;
  onLogRestDay: () => void;
  onClearHomeToast?: () => void;
  onActOnRecommendation: (id: string) => void;
  onDismissNotification: (id: string) => void;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function summarizeExercises(entry: SocialWorkout) {
  const names = entry.workout.exercises.map((e) => e.name);
  if (names.length === 0) return "Recovery session";
  if (names.length <= 2) return names.join(" & ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;
}

function hasPR(entry: SocialWorkout) {
  return entry.workout.exercises.some((e) => e.sets.some((s) => s.isPR));
}

export default function HomeView({
  userProfile,
  workoutHistory,
  activeChallenges,
  socialFeed,
  recommendations,
  notifications,
  homeToast,
  leaderboardUnlocked,
  onChangeUserProfile,
  onNavigateToTab,
  onHighFiveFeed,
  onLogRestDay,
  onClearHomeToast,
  onActOnRecommendation,
  onDismissNotification
}: Props) {
  const [notification, setNotification] = useState<string | null>(null);
  const [wellbeingDismissed, setWellbeingDismissed] = useState(false);

  const initials = userProfile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (homeToast) {
      showNotification(homeToast);
      onClearHomeToast?.();
    }
  }, [homeToast]);

  const showWellbeing = useMemo(() => {
    if (userProfile.streak < 7 || wellbeingDismissed) return false;
    const realWorkouts = workoutHistory.filter((w) => w.exercises.length > 0).slice(0, 3);
    if (realWorkouts.length < 3) return false;
    return realWorkouts.every((w) => !w.exercises.some((e) => e.sets.some((s) => s.isPR)));
  }, [userProfile.streak, workoutHistory, wellbeingDismissed]);

  const daysUntilReset = daysUntilSeasonReset(userProfile);
  const showRankAlert = daysUntilReset >= 0 && daysUntilReset <= 14;
  const unreadNotifications = notifications.filter((n) => !n.read).slice(0, 3);
  const dailyChallenge = activeChallenges.find((c) => c.type === "Daily" && !c.completed);
  const currentTierIdx = TIER_ORDER.indexOf(userProfile.rank);
  const demotionTier = currentTierIdx > 0 ? TIER_ORDER[currentTierIdx - 1] : userProfile.rank;

  const buyShield = () => {
    if (userProfile.xp >= 500) {
      onChangeUserProfile({
        xp: userProfile.xp - 500,
        streakShields: userProfile.streakShields + 1
      });
      showNotification("Streak Shield purchased for 500 XP!");
    } else {
      showNotification("You need 500 XP for a Streak Shield.");
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleHighFive = (entry: SocialWorkout) => {
    if (entry.isMe || entry.highFived) return;
    onHighFiveFeed(entry.id);
    showNotification(`High five sent to ${entry.authorName.split(" ")[0]}!`);
  };

  const xpPercent = Math.min(100, (userProfile.xp / userProfile.xpToNextLevel) * 100);

  return (
    <div className="h-full min-h-0 bg-fq-bg text-[#f0f0f0] overflow-y-auto scroll-container">
      {notification && (
        <div className="fixed top-0 left-0 right-0 z-50 fq-top safe-x px-4 pb-1">
          <div className="fq-card px-4 py-3 text-sm flex items-center gap-2 border-fq-accent/25 text-fq-accent">
            <Award className="w-4 h-4 shrink-0" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-4 fq-top pb-0">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-[13px] text-white/50">{getGreeting()},</p>
            <h1 className="text-[22px] font-medium text-white leading-tight">
              {userProfile.name.split(" ")[0]}
            </h1>
          </div>
          <button
            onClick={() => onNavigateToTab("Profile")}
            className="w-[38px] h-[38px] rounded-full bg-fq-avatar border-2 border-fq-accent-dark flex items-center justify-center text-[13px] font-medium text-fq-accent shrink-0 active:scale-95 transition-transform"
            aria-label="Open profile"
          >
            {initials}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.12] text-[#c0c0d8] border border-white/25">
            <Award className="w-3 h-3" />
            {userProfile.rank}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-fq-accent/10 text-fq-accent border border-fq-accent/20">
            {userProfile.playerType}
          </span>
        </div>
      </header>

      <div className="px-4 pb-6 space-y-2.5">
        {/* XP card */}
        <div className="fq-card rounded-[18px] p-3.5 px-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[13px] text-white/50">Level</p>
              <p className="text-xl font-medium text-white">{userProfile.level}</p>
            </div>
            <p className="text-xs text-fq-accent font-medium">
              {userProfile.xp.toLocaleString()} / {userProfile.xpToNextLevel.toLocaleString()} XP
            </p>
          </div>
          <div className="fq-xp-bar-bg">
            <div className="fq-xp-bar-fill" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="fq-card rounded-[14px] py-3 px-2 text-center">
            <p className="text-xl font-medium text-white">{userProfile.workoutsCompleted || 0}</p>
            <p className="text-[10px] text-white/40 mt-0.5">Total workouts</p>
          </div>
          <button
            onClick={() => onNavigateToTab("Profile")}
            className="fq-card rounded-[14px] py-3 px-2 text-center active:scale-[0.97] transition-transform"
          >
            <p className="text-xl font-medium text-fq-amber">🔥 {userProfile.streak}</p>
            <p className="text-[10px] text-white/40 mt-0.5">Day streak</p>
          </button>
          <button
            onClick={() => onNavigateToTab("Rank")}
            className="fq-card rounded-[14px] py-3 px-2 text-center active:scale-[0.97] transition-transform"
          >
            <p className="text-xl font-medium text-fq-accent">#{userProfile.globalRank}</p>
            <p className="text-[10px] text-white/40 mt-0.5">Global rank</p>
          </button>
        </div>

        {!leaderboardUnlocked && (
          <div className="fq-card rounded-2xl p-3.5 flex items-start gap-2.5 border-fq-blue/20">
            <Lock className="w-4 h-4 text-fq-blue shrink-0 mt-0.5" />
            <p className="text-xs text-white/45 leading-relaxed">
              Complete your first workout to unlock the Friends leaderboard and social feed rankings.
            </p>
          </div>
        )}

        {unreadNotifications.length > 0 && (
          <div className="space-y-1.5">
            {unreadNotifications.map((n) => (
              <div
                key={n.id}
                className="fq-card rounded-xl px-3 py-2.5 flex items-start gap-2 border-fq-accent/15"
              >
                <Bell className="w-3.5 h-3.5 text-fq-accent shrink-0 mt-0.5" />
                <p className="text-xs text-white/55 flex-1">{n.message}</p>
                <button
                  onClick={() => onDismissNotification(n.id)}
                  className="text-[10px] text-white/35 shrink-0"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        )}

        {dailyChallenge && (
          <button
            onClick={() => onNavigateToTab("Goals")}
            className="w-full fq-card rounded-2xl p-3.5 text-left active:bg-fq-card-hover"
          >
            <p className="text-[10px] text-fq-accent uppercase tracking-wider mb-1">Daily quest</p>
            <p className="text-sm font-medium text-white">{dailyChallenge.title}</p>
            <p className="text-xs text-white/45 mt-1">{dailyChallenge.goalText} · +100 XP on complete</p>
          </button>
        )}

        {recommendations.filter((r) => !r.actedOn).length > 0 && (
          <>
            <p className="fq-section-title !mt-2">For you</p>
            {recommendations
              .filter((r) => !r.actedOn)
              .map((rec) => (
                <div key={rec.id} className="fq-card rounded-2xl p-3.5 mb-2">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-fq-amber shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{rec.title}</p>
                      <p className="text-xs text-white/45 mt-1">{rec.reason}</p>
                      <button
                        onClick={() => onActOnRecommendation(rec.id)}
                        className="mt-2 text-xs text-fq-accent font-medium"
                      >
                        Log recommended session →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </>
        )}

        {showRankAlert && (
          <div className="fq-card rounded-2xl p-3.5 flex items-start gap-2.5 border-rose-500/20 bg-rose-500/5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-rose-300">
                Season resets in {daysUntilReset} day{daysUntilReset !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-white/45 mt-0.5 leading-relaxed">
                Defend your {userProfile.rank} rank or drop to {demotionTier}. Log a workout to stay ahead.
              </p>
            </div>
          </div>
        )}

        {/* Streak protection */}
        <div className="fq-card rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-fq-accent/10 border border-fq-accent/20 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-fq-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">Streak protection</p>
            <p className="text-xs text-white/45 mt-0.5">
              {userProfile.streakShields > 0
                ? `${userProfile.streakShields} shield${userProfile.streakShields > 1 ? "s" : ""} active`
                : "Protect your streak for 500 XP"}
            </p>
          </div>
          {userProfile.streakShields > 0 ? (
            <div className="px-3 py-1.5 rounded-xl bg-fq-accent/12 border border-fq-accent/20 text-fq-accent text-sm font-medium flex items-center gap-1 shrink-0">
              <Shield className="w-4 h-4" />
              ×{userProfile.streakShields}
            </div>
          ) : (
            <button
              onClick={buyShield}
              className="px-4 py-2 rounded-xl bg-fq-accent text-fq-bg text-xs font-medium shrink-0 active:opacity-90"
            >
              Buy
            </button>
          )}
        </div>

        {showWellbeing && (
          <div className="fq-card rounded-2xl p-3.5 border-fq-amber/20 bg-fq-amber/5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-fq-amber/15 border border-fq-amber/25 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 text-fq-amber" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-fq-amber">Recovery recommended</p>
                <p className="text-xs text-white/45 mt-1 leading-relaxed">
                  {userProfile.streak} days straight with no new PRs. A rest day earns{" "}
                  <span className="text-fq-amber font-medium">+100 XP</span> and keeps your streak.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      onLogRestDay();
                      setWellbeingDismissed(true);
                      showNotification("Rest day logged! +100 XP. Streak protected.");
                    }}
                    className="flex-1 py-2 rounded-xl bg-fq-amber/20 border border-fq-amber/30 text-fq-amber text-xs font-medium active:opacity-80"
                  >
                    Log rest day
                  </button>
                  <button
                    onClick={() => setWellbeingDismissed(true)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-white/45 text-xs font-medium active:bg-white/10"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Friend activity */}
        <div className="flex items-center justify-between">
          <p className="fq-section-title !mt-4 !mb-0">Friend activity</p>
          <button
            onClick={() => leaderboardUnlocked && onNavigateToTab("Rank")}
            disabled={!leaderboardUnlocked}
            className={`text-xs font-medium -mt-1 ${leaderboardUnlocked ? "text-fq-accent" : "text-white/25"}`}
          >
            Leaderboard
          </button>
        </div>

        <div className="space-y-2">
          {(leaderboardUnlocked ? socialFeed : socialFeed.filter((e) => e.isMe)).map((entry) => (
            <article key={entry.id} className="fq-card rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`fq-avatar ${entry.isMe ? "you" : ""}`}>{entry.authorAvatar}</div>
                  <p className="text-[13px] font-medium text-white">
                    {entry.isMe ? "You" : entry.authorName}
                    <span className="text-[10px] font-normal text-white/35 ml-1">
                      · {entry.authorTier}
                    </span>
                  </p>
                </div>
                <span className="text-[11px] text-white/35 shrink-0">{entry.workout.date}</span>
              </div>

              <h3 className="text-sm font-medium text-white mb-1">{entry.workout.title}</h3>
              <p className="text-xs text-white/45 mb-2">{summarizeExercises(entry)}</p>

              <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-white/45">
                {entry.workout.duration > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {entry.workout.duration} min
                  </span>
                )}
                <span className="fq-chip-xp">
                  <Zap className="w-3 h-3" />
                  +{entry.workout.xpEarned} XP
                </span>
                {hasPR(entry) && (
                  <span className="fq-chip-pr">
                    <Trophy className="w-3 h-3" />
                    PR
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-white/[0.06]">
                <span className="text-[11px] text-white/35">
                  {entry.highFiveCount > 0
                    ? `${entry.highFiveCount} high five${entry.highFiveCount !== 1 ? "s" : ""}`
                    : "Be the first to react"}
                </span>
                {!entry.isMe && (
                  <button
                    onClick={() => handleHighFive(entry)}
                    disabled={entry.highFived}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium touch-target active:scale-95 transition-all ${
                      entry.highFived
                        ? "bg-white/5 text-white/35"
                        : "bg-fq-accent/12 text-fq-accent border border-fq-accent/20"
                    }`}
                  >
                    <Hand className="w-3.5 h-3.5" />
                    {entry.highFived ? "Sent" : "High five"}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Active quests preview */}
        {activeChallenges.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="fq-section-title !mt-4 !mb-0">Active quests</p>
              <button
                onClick={() => onNavigateToTab("Goals")}
                className="text-xs text-fq-accent font-medium -mt-1"
              >
                See all
              </button>
            </div>
            <div className="space-y-2">
              {activeChallenges.slice(0, 2).map((chall) => (
                <button
                  key={chall.id}
                  onClick={() => onNavigateToTab("Goals")}
                  className="w-full fq-card rounded-2xl p-3.5 text-left active:bg-fq-card-hover transition-colors"
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <p className="text-sm font-medium text-white">{chall.title}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.07] text-white/45 shrink-0">
                      {chall.type}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-white/40 mb-1.5">
                    <span>{chall.goalText}</span>
                    <span>{chall.progress}%</span>
                  </div>
                  <div className="fq-progress-bar-bg">
                    <div
                      className={`fq-progress-bar-fill ${chall.completed ? "done" : ""}`}
                      style={{ width: `${chall.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-fq-accent font-medium mt-2">+{chall.xpReward} XP</p>
                </button>
              ))}
            </div>
          </>
        )}

        <button
          onClick={() => onNavigateToTab("Log")}
          className="fq-btn-primary mt-2"
        >
          Log a workout
        </button>
      </div>
    </div>
  );
}
