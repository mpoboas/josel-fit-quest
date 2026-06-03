import { useState, useMemo } from "react";
import { UserProfile, Workout, Badge, LeaderboardEntry } from "../types";
import {
  Flame,
  Trophy,
  Activity,
  Award,
  Settings,
  Dumbbell,
  RotateCcw,
  ChevronRight,
  Hand,
  Lock,
  UserPlus,
  Download
} from "lucide-react";
import { ANALYTICS_UNLOCK_SESSIONS, needsQuarterlyOctalysis } from "../gamification";
import { getStoredTourLang, getTourUi, type TourLang } from "../teacherTour";

interface Props {
  userProfile: UserProfile;
  workoutHistory: Workout[];
  badges: Badge[];
  analyticsUnlocked: boolean;
  analyticsEventCount: number;
  friendsLeaderboard: LeaderboardEntry[];
  onChangeUserProfile: (profile: Partial<UserProfile>) => void;
  onNavigateToTab: (tab: string) => void;
  onOpenDrivesQuiz: () => void;
  onResetApp: () => void;
  onToggleFollow: (name: string) => void;
  onStartTeacherTour?: (lang: TourLang) => void;
  onLoadTeacherDemo?: () => void;
}

function formatDriveLabel(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

export default function ProfileView({
  userProfile,
  workoutHistory,
  badges,
  analyticsUnlocked,
  analyticsEventCount,
  friendsLeaderboard,
  onOpenDrivesQuiz,
  onResetApp,
  onToggleFollow,
  onStartTeacherTour,
  onLoadTeacherDemo
}: Props) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const tourRestartLabel = getTourUi(getStoredTourLang()).settingsRestart;

  const computedStats = useMemo(() => {
    let totalKgsLifted = 0;
    const distribution: Record<string, number> = {};
    const strengthTrend: { label: string; maxWeight: number }[] = [];

    workoutHistory.forEach((wk) => {
      wk.exercises.forEach((ex) => {
        distribution[ex.category] = (distribution[ex.category] || 0) + 1;
        let maxW = 0;
        ex.sets.forEach((set) => {
          totalKgsLifted += (set.weight || 0) * (set.reps || 0);
          if ((set.weight || 0) > maxW) maxW = set.weight || 0;
        });
        if (ex.category !== "Cardio" && maxW > 0) {
          strengthTrend.push({ label: ex.name.slice(0, 8), maxWeight: maxW });
        }
      });
    });

    const topTrend = strengthTrend.slice(-6);
    return { totalKgsLifted, distribution, topTrend };
  }, [workoutHistory]);

  const distMax = Math.max(...(Object.values(computedStats.distribution) as number[]), 1);
  const trendMax = Math.max(...computedStats.topTrend.map((t) => t.maxWeight), 1);

  const friends = friendsLeaderboard.filter((f) => !f.isMe);

  const weeklyVolume = useMemo(() => {
    function getWeekMonday(date: Date): Date {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      d.setHours(0, 0, 0, 0);
      return d;
    }

    const now = new Date();
    const currentMonday = getWeekMonday(now);

    const weeks = Array.from({ length: 7 }, (_, i) => {
      const monday = new Date(currentMonday);
      monday.setDate(monday.getDate() - (6 - i) * 7);
      return {
        label: i === 6 ? "Now" : `W${i + 1}`,
        monday: monday.getTime(),
        volume: 0,
        isCurrent: i === 6
      };
    });

    workoutHistory.forEach((wk) => {
      const wkMonday = getWeekMonday(new Date(wk.rawDate)).getTime();
      const weekIdx = weeks.findIndex((w) => w.monday === wkMonday);
      if (weekIdx >= 0) {
        wk.exercises.forEach((ex) => {
          ex.sets.forEach((set) => {
            weeks[weekIdx].volume += (set.weight || 0) * (set.reps || 0);
          });
        });
      }
    });

    return weeks;
  }, [workoutHistory]);

  const maxVolumeVal = Math.max(...weeklyVolume.map((v) => v.volume)) || 10000;
  const initials = userProfile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const topDrives = Object.entries(userProfile.octalysisScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const badgeIconClass = (badge: Badge, unlocked: boolean) => {
    if (!unlocked) return "bg-white/[0.05] text-white/25";
    if (badge.type === "gold") return "bg-fq-amber/15 text-fq-amber";
    if (badge.type === "green") return "bg-fq-accent/12 text-fq-accent";
    if (badge.type === "blue") return "bg-fq-blue/12 text-fq-blue";
    return "bg-fq-accent/12 text-fq-accent";
  };

  const renderBadgeIcon = (badge: Badge) => {
    switch (badge.icon) {
      case "Flame":
        return <Flame className="w-5 h-5" />;
      case "Barbell":
        return <Dumbbell className="w-5 h-5" />;
      case "Activity":
        return <Activity className="w-5 h-5" />;
      case "Trophy":
        return <Trophy className="w-5 h-5" />;
      case "Users":
        return <span className="text-base">👥</span>;
      case "Hand":
        return <Hand className="w-5 h-5" />;
      default:
        return <span className="text-sm">🔒</span>;
    }
  };

  return (
    <div className="h-full min-h-0 bg-fq-bg text-[#f0f0f0] flex flex-col overflow-y-auto scroll-container">
      <header className="flex items-center justify-between px-4 fq-top pb-3 shrink-0">
        <h1 className="text-[17px] font-medium text-white">Profile</h1>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 -mr-1 rounded-xl active:bg-white/5 text-white/45 touch-target"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      <div className="px-4 pb-8">
        {/* Profile header */}
        <div className="flex flex-col items-center py-4 pb-3.5">
          <div className="relative w-[70px] h-[70px] rounded-full bg-fq-avatar border-[3px] border-fq-accent-dark flex items-center justify-center text-[22px] font-medium text-fq-accent mb-2.5">
            {initials}
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-fq-accent-dark border-2 border-fq-bg" />
          </div>
          <h2 className="text-xl font-medium text-white">{userProfile.name}</h2>
          <p className="text-[13px] text-white/50 mt-1 flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            {userProfile.rank} · Level {userProfile.level}
          </p>
          <span className="mt-2 px-3 py-1 rounded-xl bg-white/[0.07] text-xs text-white/55">
            {userProfile.playerType} player
          </span>
          {userProfile.unlockedCosmetics.length > 0 && (
            <p className="text-[10px] text-fq-accent mt-2">
              Cosmetics: {userProfile.unlockedCosmetics.join(", ").replace(/_/g, " ")}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3.5">
          <div className="fq-card rounded-[14px] py-3 px-2 text-center">
            <p className="text-xl font-medium text-white">{workoutHistory.length}</p>
            <p className="text-[10px] text-white/40 mt-0.5">Workouts</p>
          </div>
          <div className="fq-card rounded-[14px] py-3 px-2 text-center">
            <p className="text-xl font-medium text-fq-amber">🔥 {userProfile.streak}</p>
            <p className="text-[10px] text-white/40 mt-0.5">Day streak</p>
          </div>
          <div className="fq-card rounded-[14px] py-3 px-2 text-center">
            <p className="text-xl font-medium text-fq-blue">{badges.filter((b) => b.unlockedAt).length}</p>
            <p className="text-[10px] text-white/40 mt-0.5">Badges</p>
          </div>
        </div>

        <p className="fq-section-title !mt-0">Following</p>
        <div className="fq-card rounded-2xl p-3.5 mb-3.5 space-y-2">
          {friends.map((f) => {
            const following = userProfile.following.includes(f.name);
            return (
              <div key={f.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="fq-avatar text-[10px]">{f.avatar}</div>
                  <span className="text-sm text-white">{f.name}</span>
                </div>
                <button
                  onClick={() => onToggleFollow(f.name)}
                  className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                    following
                      ? "border-fq-accent/30 text-fq-accent bg-fq-accent/10"
                      : "border-white/10 text-white/45"
                  }`}
                >
                  <UserPlus className="w-3 h-3" />
                  {following ? "Following" : "Follow"}
                </button>
              </div>
            );
          })}
        </div>

        <div data-tour="motivation-card" className="fq-card rounded-2xl p-3.5 mb-3.5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-white">Motivation profile</p>
            <button onClick={onOpenDrivesQuiz} className="text-xs text-fq-accent font-medium active:opacity-80">
              {needsQuarterlyOctalysis(userProfile) ? "Quarterly quiz due" : "Retake quiz"}
            </button>
          </div>
          {topDrives.map(([key, value]) => (
            <div key={key} className="flex items-center gap-2.5 mb-2.5 last:mb-0">
              <span className="text-xs text-white/50 w-[90px] shrink-0">{formatDriveLabel(key)}</span>
              <div className="flex-1 fq-progress-bar-bg">
                <div className="fq-progress-bar-fill" style={{ width: `${value}%` }} />
              </div>
              <span className="text-xs font-medium text-fq-accent w-8 text-right">{value}%</span>
            </div>
          ))}
        </div>

        {/* Badges */}
        <p className="fq-section-title !mt-0">Badges</p>
        <div data-tour="badges-grid" className="grid grid-cols-3 gap-2 mb-3.5">
          {badges.map((badge) => {
            const isUnlocked = !!badge.unlockedAt;
            return (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`fq-card rounded-[14px] p-3 text-center active:scale-[0.97] transition-transform ${
                  !isUnlocked ? "opacity-40" : ""
                } ${badge.animated && isUnlocked ? "ring-1 ring-fq-amber/30" : ""}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-1.5 ${badgeIconClass(badge, isUnlocked)} ${badge.animated && isUnlocked ? "animate-pulse" : ""}`}
                >
                  {renderBadgeIcon(badge)}
                </div>
                <span className="text-[11px] font-medium text-white/70 leading-tight block">{badge.name}</span>
              </button>
            );
          })}
        </div>

        <p className="fq-section-title !mt-0">Analytics dashboard</p>
        <div data-tour="analytics-section">
        {!analyticsUnlocked ? (
          <div className="fq-card rounded-2xl p-4 flex items-start gap-3 mb-3.5">
            <Lock className="w-5 h-5 text-white/35 shrink-0" />
            <p className="text-xs text-white/45 leading-relaxed">
              Log {ANALYTICS_UNLOCK_SESSIONS} sessions to unlock volume curves, strength growth, and
              distribution charts ({workoutHistory.filter((w) => w.exercises.length > 0).length}/
              {ANALYTICS_UNLOCK_SESSIONS}).
            </p>
          </div>
        ) : (
          <>
            <div className="fq-card rounded-2xl p-3.5 mb-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-white/45">Weekly volume (kg)</span>
                <button
                  type="button"
                  onClick={() => alert("Weekly summary exported (demo CSV).")}
                  className="text-[10px] text-fq-accent flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Export
                </button>
              </div>
              <div className="flex items-end gap-2 h-24">
                {weeklyVolume.map((w) => {
                  const heightPct = Math.max(12, Math.min(100, (w.volume / maxVolumeVal) * 100));
                  return (
                    <div key={w.label} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className={`w-full rounded-t-md ${w.isCurrent ? "bg-fq-accent" : "bg-white/[0.07]"}`}
                        style={{ height: `${heightPct}px` }}
                      />
                      <span className="text-[10px] text-white/40">{w.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="fq-card rounded-2xl p-3.5 mb-3">
              <p className="text-xs text-white/45 mb-3">Strength growth (max weight)</p>
              <div className="flex items-end gap-1.5 h-20">
                {computedStats.topTrend.map((t) => (
                  <div key={t.label} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-fq-blue/60 rounded-t-sm"
                      style={{ height: `${Math.max(8, (t.maxWeight / trendMax) * 72)}px` }}
                    />
                    <span className="text-[8px] text-white/35 truncate w-full text-center">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="fq-card rounded-2xl p-3.5 mb-3">
              <p className="text-xs text-white/45 mb-3">Workout distribution</p>
              <div className="space-y-2">
                {Object.entries(computedStats.distribution).map(([cat, count]: [string, number]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-white/55">{cat}</span>
                      <span className="text-white/35">{count}</span>
                    </div>
                    <div className="fq-progress-bar-bg">
                      <div
                        className="fq-progress-bar-fill"
                        style={{ width: `${(count / distMax) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-white/30 text-center mb-4">
              Behavioural events tracked: {analyticsEventCount}
            </p>
          </>
        )}
        </div>
      </div>

      {selectedBadge && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end safe-x safe-bottom">
          <div className="bg-fq-card w-full rounded-t-3xl border-t border-white/[0.07] p-6 text-center">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${badgeIconClass(selectedBadge, !!selectedBadge.unlockedAt)}`}
            >
              {renderBadgeIcon(selectedBadge)}
            </div>
            <h3 className="text-lg font-medium text-white mb-2">{selectedBadge.name}</h3>
            <p className="text-sm text-white/45 leading-relaxed">{selectedBadge.description}</p>
            {!selectedBadge.unlockedAt && (
              <p className="text-xs text-white/35 mt-2">Keep training to unlock this badge.</p>
            )}
            <button
              onClick={() => setSelectedBadge(null)}
              className="fq-btn-primary mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end safe-x safe-bottom">
          <div className="bg-fq-card w-full rounded-t-3xl border-t border-white/[0.07]">
            <div className="flex justify-between items-center px-5 py-4 border-b border-white/[0.06]">
              <h3 className="text-base font-medium text-white">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-sm text-white/45 px-3 py-1 active:bg-white/5 rounded-lg"
              >
                Done
              </button>
            </div>
            <div className="divide-y divide-white/[0.06]">
              <button
                onClick={() => {
                  setShowSettings(false);
                  onOpenDrivesQuiz();
                }}
                className="w-full px-5 py-4 flex items-center justify-between active:bg-white/5"
              >
                <span className="text-sm text-white">Motivation quiz</span>
                <ChevronRight className="w-5 h-5 text-white/35" />
              </button>
              {onLoadTeacherDemo && (
                <button
                  onClick={() => {
                    setShowSettings(false);
                    onLoadTeacherDemo();
                  }}
                  className="w-full px-5 py-4 flex items-center gap-3 active:bg-white/5 text-fq-accent text-left"
                >
                  <Award className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">Load evaluator demo data</span>
                </button>
              )}
              {onStartTeacherTour && (
                <button
                  onClick={() => {
                    setShowSettings(false);
                    onStartTeacherTour(getStoredTourLang());
                  }}
                  className="w-full px-5 py-4 flex items-center gap-3 active:bg-white/5 text-left"
                >
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                  <span className="text-sm text-white">{tourRestartLabel}</span>
                </button>
              )}
              <button
                onClick={() => {
                  setShowSettings(false);
                  onResetApp();
                }}
                className="w-full px-5 py-4 flex items-center gap-3 active:bg-red-500/5 text-red-400"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="text-sm font-medium">Reset all progress</span>
              </button>
            </div>
            <div className="h-4" />
          </div>
        </div>
      )}
    </div>
  );
}
