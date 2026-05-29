import { UserProfile, Challenge } from "../types";
import { Flame, Shield, Trophy, Activity, Dumbbell, Bell, GraduationCap, Award } from "lucide-react";
import { useState } from "react";

interface Props {
  userProfile: UserProfile;
  activeChallenges: Challenge[];
  onChangeUserProfile: (profile: Partial<UserProfile>) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function HomeView({ userProfile, activeChallenges, onChangeUserProfile, onNavigateToTab }: Props) {
  const [notification, setNotification] = useState<string | null>(null);

  // Buy a streak shield using XP as an interactive loss mitigation mechanic
  const buyShield = () => {
    if (userProfile.xp >= 500) {
      onChangeUserProfile({
        xp: userProfile.xp - 500,
        streakShields: userProfile.streakShields + 1
      });
      showNotification("Streak Shield Purchased for -500 XP! Safe from missed days.");
    } else {
      showNotification("Insufficient XP. A Streak Shield requires 500 XP to build.");
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div id="home-view" className="h-full bg-[#050505] text-slate-100 flex flex-col overflow-y-auto">
      {/* Dynamic Floating Toast */}
      {notification && (
        <div id="home-toast" className="fixed top-4 left-4 right-4 bg-zinc-900 border border-cyan-500/30 text-cyan-100 px-4 py-3 rounded-xl shadow-2xl z-50 text-xs font-mono flex items-center gap-2 animate-bounce">
          <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Styled Top Header Area */}
      <div className="bg-gradient-to-b from-cyan-950/20 to-[#050505] p-6 pb-8 rounded-b-[2.5rem] relative overflow-hidden border-b border-white/10">
        {/* Abstract design elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 bottom-0 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Action Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-[10px] text-slate-500 tracking-widest uppercase font-mono">Good morning,</div>
            <h1 className="text-2xl font-serif italic text-white mt-1">{userProfile.name.split(" ")[0]}</h1>
          </div>
          <button 
            onClick={() => showNotification(`Ready for combat! Level ${userProfile.level} Active.`)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 relative transition-all"
          >
            <Bell className="w-5 h-5 text-cyan-300" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full border border-[#050505]" />
          </button>
        </div>

        {/* Badge & Rank Header */}
        <div className="flex flex-wrap items-center gap-2.5 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white font-medium">
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-serif italic text-cyan-400 font-bold">{userProfile.rank}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-300 font-mono text-[10px] uppercase tracking-wider">
            <span>{userProfile.playerType} Class</span>
          </div>
        </div>

        {/* Experience Linear Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-xs font-serif italic text-slate-300">Level {userProfile.level}</span>
            <span className="text-[11px] font-mono text-cyan-400">
              {userProfile.xp.toLocaleString()} / {userProfile.xpToNextLevel.toLocaleString()} XP
            </span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${(userProfile.xp / userProfile.xpToNextLevel) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Structured Stats Center */}
      <div className="grid grid-cols-3 gap-3 p-4 -mt-4 relative z-10">
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-center backdrop-blur-md">
          <div className="text-3xl font-serif italic text-white">4</div>
          <div className="text-[9px] uppercase tracking-widest text-slate-500 mt-1 font-mono">Sessions/wk</div>
        </div>
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-center backdrop-blur-md group hover:border-cyan-400/30 transition-all cursor-pointer" onClick={() => onNavigateToTab("Profile")}>
          <div className="text-3xl font-serif italic text-cyan-400 flex items-center justify-center gap-1">
            <Flame className="w-5 h-5 fill-cyan-400/10 stroke-cyan-400" />
            <span>{userProfile.streak}</span>
          </div>
          <div className="text-[9px] uppercase tracking-widest text-slate-500 mt-1 font-mono">Day Streak</div>
        </div>
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-center backdrop-blur-md group hover:border-cyan-500/30 transition-all cursor-pointer" onClick={() => onNavigateToTab("Rank")}>
          <div className="text-3xl font-serif italic text-white">#{userProfile.globalRank}</div>
          <div className="text-[9px] uppercase tracking-widest text-slate-500 mt-1 font-mono">Global Rank</div>
        </div>
      </div>

      {/* Habit Streak Protection Loop */}
      <div className="px-4 py-2">
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20">
              <Flame className="w-6 h-6 text-cyan-400 fill-cyan-400/20" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest font-mono text-slate-400">Streak Active</h3>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {userProfile.streakShields > 0 
                  ? `${userProfile.streakShields} active Shield safeguarding habits` 
                  : "Streak is currently unprotected!"}
              </p>
            </div>
          </div>
          <div>
            {userProfile.streakShields > 0 ? (
              <div className="p-2 bg-cyan-500/15 border border-cyan-400/30 rounded-lg text-cyan-200 flex items-center gap-1">
                <Shield className="w-4 h-4 fill-cyan-400/20" />
                <span className="text-xs font-mono font-bold">x{userProfile.streakShields}</span>
              </div>
            ) : (
              <button 
                onClick={buyShield}
                className="px-3 py-1.5 rounded-full bg-white text-black font-bold text-[10px] tracking-widest hover:bg-cyan-400 transition-colors uppercase"
              >
                Secure
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Quests & Challenges Lists */}
      <div className="p-4 flex-1">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono">Active Challenges</h2>
          <button 
            onClick={() => onNavigateToTab("Goals")} 
            className="text-xs text-cyan-400 font-medium hover:underline"
          >
            Manage
          </button>
        </div>

        <div className="space-y-3">
          {activeChallenges.slice(0, 3).map((chall) => (
            <div 
              key={chall.id}
              onClick={() => onNavigateToTab("Goals")}
              className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-cyan-500/20 active:bg-zinc-900/80 cursor-pointer transition-all"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                chall.completed ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
              }`}>
                {chall.type === "Weekly" ? (
                  <Dumbbell className="w-5 h-5" />
                ) : (
                  <Activity className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white truncate">{chall.title}</h4>
                  <span className="text-[10px] font-mono font-semibold text-cyan-400">+{chall.xpReward} XP</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">{chall.description}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 bg-white/5 h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${chall.completed ? "bg-emerald-500" : "bg-cyan-500"}`}
                      style={{ width: `${chall.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">{chall.goalText}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
