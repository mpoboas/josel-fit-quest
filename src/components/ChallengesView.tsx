import { Challenge, BossChallenge } from "../types";
import { Shield, Trophy, Target, Star, Users, Flame, Award, ChevronRight } from "lucide-react";

interface Props {
  bossChallenge: BossChallenge;
  activeChallenges: Challenge[];
  onCompleteChallenge: (id: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function ChallengesView({ bossChallenge, activeChallenges, onCompleteChallenge, onNavigateToTab }: Props) {
  return (
    <div id="challenges-view" className="h-full bg-[#050505] text-slate-100 flex flex-col overflow-y-auto font-sans">
      
      {/* Boss Gauntlet Header Banner */}
      <div className="bg-zinc-900/50 p-4 flex justify-between items-center border-b border-white/5 shrink-0">
        <div>
          <span className="text-[9px] font-mono tracking-widest text-cyan-400 uppercase">Monthly Event</span>
          <h2 className="text-sm font-extrabold text-white mt-0.5 font-serif italic">{bossChallenge.title}</h2>
        </div>
        <div className="text-right">
          <span className="text-xs text-rose-400 font-mono font-bold tracking-tight">3 Days Remaining</span>
          <span className="block text-[8px] text-slate-500 font-mono mt-0.5">End of May</span>
        </div>
      </div>

      {/* Extreme Boss Card View */}
      <div className="p-4 shrink-0">
        <div id="boss-challenge-card" className="bg-zinc-900/50 border border-white/10 rounded-3xl p-5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-widest uppercase">BOSS CHALLENGE</span>
              <h3 className="text-base font-extrabold text-white tracking-tight mt-1 font-serif italic">Slay the Gauntlet</h3>
            </div>
            <span className="text-lg">👹</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            {bossChallenge.description}
          </p>

          {/* Progress gauge index */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Boss HP Demolished:</span>
              <span className="text-cyan-400 font-black font-mono">
                {bossChallenge.workoutsCurrent} / {bossChallenge.workoutsGoal} Workouts ({Math.round((bossChallenge.workoutsCurrent / bossChallenge.workoutsGoal) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(bossChallenge.workoutsCurrent / bossChallenge.workoutsGoal) * 100}%` }}
              />
            </div>
          </div>

          {/* Reward cabinets */}
          <div className="grid grid-cols-3 gap-2.5 mt-5">
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-2.5 text-center flex flex-col items-center justify-center">
              <Star className="w-4 h-4 text-cyan-400 mb-1" />
              <span className="text-[10px] font-mono text-cyan-300 font-bold">+{bossChallenge.xpReward} XP</span>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2.5 text-center flex flex-col items-center justify-center">
              <Shield className="w-4 h-4 text-blue-400 mb-1 fill-blue-400/10" />
              <span className="text-[10px] font-mono text-blue-300 font-bold">+{bossChallenge.shieldReward} Shield</span>
            </div>
            <div className="bg-zinc-800/50 border border-white/5 rounded-xl p-2.5 text-center flex flex-col items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-500 mb-1" />
              <span className="text-[10px] font-mono text-zinc-300 font-bold">Elite Badge</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly & Daily list */}
      <div className="flex-1 px-4 pb-10">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Active Target Quests</h3>
          <span className="text-[9px] font-mono text-slate-500">Log workout to update</span>
        </div>

        <div className="space-y-3">
          {activeChallenges.map((chall) => (
            <div 
              key={chall.id}
              className={`bg-zinc-900/50 border rounded-2xl p-4 flex flex-col transition-all ${
                chall.completed ? "border-emerald-500/25 bg-emerald-500/[0.02]" : "border-white/5"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2 font-serif italic">
                    <span>{chall.title}</span>
                    {chall.completed && (
                      <span className="text-[8.5px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-semibold">
                        COMPLETED
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-sans">
                    {chall.description}
                  </p>
                </div>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                  chall.type === "Group" 
                    ? "bg-cyan-950/40 text-cyan-300 border-cyan-500/20" 
                    : chall.type === "Weekly" 
                      ? "bg-[#111221] text-slate-400 border-white/5" 
                      : "bg-white/5 text-slate-400 border-white/5"
                }`}>
                  {chall.type}
                </span>
              </div>

              {/* Progress Bar indicator */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1.5">
                  <span>Progress</span>
                  <span>{chall.goalText} ({chall.progress}%)</span>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      chall.completed ? "bg-emerald-500" : "bg-cyan-400"
                    }`}
                    style={{ width: `${chall.progress}%` }}
                  />
                </div>
              </div>

              {/* Claims button if complete but not awarded or just standard summary reward */}
              <div className="mt-3.5 pt-3 border-t border-white/5 flex justify-between items-center text-xs text-slate-500">
                <span className="font-mono text-[10px] text-cyan-400">Reward: +{chall.xpReward} XP</span>
                
                {!chall.completed && (
                  <button 
                    onClick={() => onCompleteChallenge(chall.id)}
                    className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 font-mono hover:underline"
                  >
                    <span>Force Complete</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
