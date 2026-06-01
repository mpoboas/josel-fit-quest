import { useState, useMemo } from "react";
import { UserProfile, Workout, Badge } from "../types";
import { Flame, Trophy, Activity, Award, Settings, Dumbbell, RotateCcw, ChevronRight } from "lucide-react";

interface Props {
  userProfile: UserProfile;
  workoutHistory: Workout[];
  badges: Badge[];
  onChangeUserProfile: (profile: Partial<UserProfile>) => void;
  onNavigateToTab: (tab: string) => void;
  onOpenDrivesQuiz: () => void;
  onResetApp: () => void;
}

function formatDriveLabel(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

export default function ProfileView({
  userProfile,
  workoutHistory,
  badges,
  onOpenDrivesQuiz,
  onResetApp
}: Props) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const computedStats = useMemo(() => {
    let totalKgsLifted = 0;
    workoutHistory.forEach((wk) => {
      wk.exercises.forEach((ex) => {
        ex.sets.forEach((set) => {
          totalKgsLifted += (set.weight || 0) * (set.reps || 0);
        });
      });
    });
    return { totalKgsLifted };
  }, [workoutHistory]);

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

        {/* Motivation profile */}
        <div className="fq-card rounded-2xl p-3.5 mb-3.5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-white">Motivation profile</p>
            <button onClick={onOpenDrivesQuiz} className="text-xs text-fq-accent font-medium active:opacity-80">
              Retake quiz
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
        <div className="grid grid-cols-3 gap-2 mb-3.5">
          {badges.map((badge) => {
            const isUnlocked = !!badge.unlockedAt;
            return (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`fq-card rounded-[14px] p-3 text-center active:scale-[0.97] transition-transform ${
                  !isUnlocked ? "opacity-40" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-1.5 ${badgeIconClass(badge, isUnlocked)}`}
                >
                  {renderBadgeIcon(badge)}
                </div>
                <span className="text-[11px] font-medium text-white/70 leading-tight block">{badge.name}</span>
              </button>
            );
          })}
        </div>

        {/* Volume progress */}
        <p className="fq-section-title !mt-0">Volume progress</p>
        <div className="fq-card rounded-2xl p-3.5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-white/45">Weekly total (kg)</span>
            <span className="text-sm font-medium text-fq-accent">
              {computedStats.totalKgsLifted.toLocaleString()} kg
            </span>
          </div>
          <div className="flex items-end gap-2 h-24">
            {weeklyVolume.map((w) => {
              const heightPct = Math.max(12, Math.min(100, (w.volume / maxVolumeVal) * 100));
              return (
                <div key={w.label} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      w.isCurrent ? "bg-fq-accent" : "bg-white/[0.07]"
                    }`}
                    style={{ height: `${heightPct}px` }}
                  />
                  <span className="text-[10px] text-white/40">{w.label}</span>
                </div>
              );
            })}
          </div>
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
