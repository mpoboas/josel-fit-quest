import { useState, useMemo } from "react";
import { UserProfile, Workout, Badge } from "../types";
import { Flame, Trophy, Activity, ShieldAlert, Award, Calendar, Percent, Info, Settings, HelpCircle, Dumbbell } from "lucide-react";

interface Props {
  userProfile: UserProfile;
  workoutHistory: Workout[];
  badges: Badge[];
  onChangeUserProfile: (profile: Partial<UserProfile>) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function ProfileView({ userProfile, workoutHistory, badges, onChangeUserProfile, onNavigateToTab }: Props) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // Derive static dataset values based on logged workouts
  const computedStats = useMemo(() => {
    let totalKgsLifted = 0;
    let prCount = 0;
    const CategoryCount: Record<string, number> = {};

    workoutHistory.forEach((wk) => {
      wk.exercises.forEach((ex) => {
        CategoryCount[ex.category] = (CategoryCount[ex.category] || 0) + 1;
        ex.sets.forEach((set) => {
          totalKgsLifted += (set.weight || 0) * (set.reps || 0);
          if (set.isPR) prCount++;
        });
      });
    });

    return {
      totalKgsLifted,
      prCount,
      distribution: CategoryCount
    };
  }, [workoutHistory]);

  // Weekly Volume metrics
  const weeklyVolume = [
    { label: "W1", volume: 3200, isCurrent: false },
    { label: "W2", volume: 4400, isCurrent: false },
    { label: "W3", volume: 5100, isCurrent: false },
    { label: "W4", volume: 3800, isCurrent: false },
    { label: "W5", volume: 6200, isCurrent: false },
    { label: "W6", volume: 7500, isCurrent: false },
    { label: "Now", volume: Math.max(8200, computedStats.totalKgsLifted), isCurrent: true }
  ];

  const maxVolumeVal = Math.max(...weeklyVolume.map(v => v.volume)) || 10000;

  return (
    <div id="profile-view" className="h-full bg-[#050505] text-slate-100 flex flex-col overflow-y-auto font-sans">
      
      {/* Settings Block Header */}
      <div className="bg-zinc-900/50 px-4 py-3 flex items-center justify-between border-b border-white/5 shrink-0">
        <span className="text-xs font-bold font-mono tracking-widest text-slate-400">ATHLETE PROFILE</span>
        <button 
          onClick={() => setSelectedBadge(badges[0])}
          className="p-1.5 rounded-lg hover:bg-white/5 text-cyan-400"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Styled Large Profile Card Banner area */}
      <div className="bg-gradient-to-b from-cyan-950/15 to-[#050505] p-6 text-center shrink-0 border-b border-white/10">
        <div className="w-16 h-16 rounded-full bg-cyan-400/10 border-2 border-cyan-400/20 flex items-center justify-center font-extrabold font-serif italic text-xl text-cyan-300 mx-auto shadow-2xl relative">
          MP
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#050505]" />
        </div>

        <h2 className="text-lg font-bold mt-3 text-white font-serif italic">{userProfile.name}</h2>
        <div className="flex items-center justify-center gap-1.5 text-xs text-cyan-400 mt-1 font-mono">
          <Award className="w-3.5 h-3.5" />
          <span>{userProfile.rank} · Level {userProfile.level}</span>
        </div>

        {/* Dynamic Multi-counters */}
        <div id="profile-counters" className="grid grid-cols-3 gap-4 mt-6 max-w-sm mx-auto p-4 bg-zinc-900/50 border border-white/10 rounded-2xl">
          <div className="text-center">
            <div className="text-base font-extrabold text-white font-mono">{workoutHistory.length}</div>
            <div className="text-[9px] uppercase tracking-widest text-slate-400 mt-0.5">Workouts</div>
          </div>
          <div className="text-center border-x border-white/5">
            <div className="text-base font-extrabold text-amber-500 font-mono flex items-center justify-center gap-0.5">
              <Flame className="w-4 h-4 fill-orange-500/10 stroke-orange-500" />
              <span>{userProfile.streak}</span>
            </div>
            <div className="text-[9px] uppercase tracking-widest text-slate-400 mt-0.5">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-base font-extrabold text-cyan-400 font-mono">
              {badges.filter((b) => b.unlockedAt).length}
            </div>
            <div className="text-[9px] uppercase tracking-widest text-slate-400 mt-0.5">Badges</div>
          </div>
        </div>
      </div>

      {/* Badge Cabinet Display */}
      <div className="px-4 py-2 shrink-0">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-2">Badge Cabinet</h3>
        
        <div id="badge-cabinet-grid" className="grid grid-cols-3 gap-3">
          {badges.map((badge) => {
            const isUnlocked = !!badge.unlockedAt;
            return (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all ${
                  isUnlocked 
                    ? "bg-zinc-900/50 border-white/10 shadow-sm" 
                    : "bg-zinc-950/40 border-white/5 opacity-55 hover:opacity-80"
                }`}
              >
                {/* Badge Icon Element */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow ${
                  isUnlocked 
                    ? badge.type === "gold" 
                      ? "bg-amber-500/10 border border-amber-500/25 text-amber-400"
                      : badge.type === "green"
                        ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
                        : "bg-cyan-500/10 border border-cyan-500/25 text-cyan-400"
                    : "bg-zinc-950 text-slate-600 border border-white/5"
                }`}>
                  {badge.icon === "Flame" && <Flame className="w-5 h-5 fill-orange-500/10 stroke-orange-500" />}
                  {badge.icon === "Barbell" && <Dumbbell className="w-5 h-5" />}
                  {badge.icon === "Activity" && <Activity className="w-5 h-5" />}
                  {badge.icon === "Lock" && <span className="text-xs">🔒</span>}
                  {badge.icon === "Trophy" && <Trophy className="w-5 h-5" />}
                  {badge.icon === "Users" && <span className="text-xs">👥</span>}
                </div>
                
                <span className="text-[10px] font-bold text-slate-300 mt-2 truncate w-full">{badge.name}</span>
                <span className="text-[8px] text-slate-500 mt-0.5 font-mono uppercase tracking-widest">
                  {isUnlocked ? "Unlocked" : "Locked"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Volume Analytics Chart Block (Custom SVG render) */}
      <div className="px-4 py-3 pb-12 shrink-0 font-sans">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-2">Volume Progression</h3>
        
        <div id="analytics-chart-panel" className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-[10px] font-mono font-semibold text-slate-400">Weekly Total Volume (KG)</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Strength lifting load accumulated over time</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-black text-cyan-400">
                {computedStats.totalKgsLifted.toLocaleString()} KG
              </span>
              <span className="block text-[8px] text-slate-500 font-mono">This Week</span>
            </div>
          </div>

          {/* SVG Bar Layout */}
          <div className="flex items-end gap-3.5 h-[100px] mt-4 relative">
            {weeklyVolume.map((w) => {
              const heightPct = Math.max(15, Math.min(100, (w.volume / maxVolumeVal) * 100));
              return (
                <div key={w.label} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative">
                  {/* Tooltip bubble on hover */}
                  <div className="absolute -top-7 scale-0 group-hover:scale-100 bg-zinc-850 border border-cyan-400/20 text-cyan-300 px-1.5 py-0.5 rounded text-[8.5px] font-mono tracking-tight font-bold shadow-lg transition-transform z-20">
                    {w.volume.toLocaleString()}kg
                  </div>

                  {/* Visual Pillar */}
                  <div 
                    className={`w-full rounded-t-lg transition-all duration-300 relative ${
                      w.isCurrent 
                        ? "bg-gradient-to-t from-cyan-500 to-cyan-400 shadow-[0_4px_12px_rgba(34,211,238,0.25)]" 
                        : "bg-zinc-950/45 group-hover:bg-zinc-900 border border-white/5"
                    }`}
                    style={{ height: `${heightPct}px` }}
                  />

                  {/* Horizontal label */}
                  <span className="text-[9px] font-mono text-slate-500 tracking-wide font-medium">
                    {w.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Badge descriptions info selector */}
      {selectedBadge && (
        <div id="badge-info-modal" className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 w-full max-w-xs rounded-3xl border border-white/10 p-6 shadow-2xl text-center">
            <h4 className="text-xs font-bold font-mono tracking-widest text-cyan-400 uppercase">Cabinet Details</h4>
            
            <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-400/25 flex items-center justify-center text-xl text-cyan-300 mx-auto my-4 shadow">
              {selectedBadge.icon === "Flame" && <Flame className="w-6 h-6 stroke-orange-500" />}
              {selectedBadge.icon === "Barbell" && <Dumbbell className="w-6 h-6 text-cyan-400" />}
              {selectedBadge.icon === "Activity" && <Activity className="w-6 h-6 text-emerald-400" />}
              {selectedBadge.icon === "Lock" && "🔒"}
              {selectedBadge.icon === "Trophy" && <Trophy className="w-6 h-6 text-amber-500" />}
              {selectedBadge.icon === "Users" && "👥"}
            </div>

            <h3 className="text-sm font-bold text-white mb-2 font-serif italic">{selectedBadge.name}</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">{selectedBadge.description}</p>
            
            <button
              onClick={() => setSelectedBadge(null)}
              className="mt-6 px-4 py-2 w-full bg-white text-black hover:bg-cyan-400 rounded-xl text-xs font-mono tracking-widest font-semibold transition-colors"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
