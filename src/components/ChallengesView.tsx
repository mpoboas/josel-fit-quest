import { Challenge, BossChallenge, PlayerType } from "../types";
import { Shield, Trophy, Star, Check } from "lucide-react";

interface Props {
  bossChallenge: BossChallenge;
  activeChallenges: Challenge[];
  playerType: PlayerType;
}

export default function ChallengesView({ bossChallenge, activeChallenges, playerType }: Props) {
  const bossProgress = Math.round((bossChallenge.workoutsCurrent / bossChallenge.workoutsGoal) * 100);

  return (
    <div className="h-full min-h-0 bg-fq-bg text-[#f0f0f0] flex flex-col overflow-y-auto scroll-container">
      <header className="flex items-center justify-between px-4 fq-top pb-3 shrink-0">
        <div>
          <p className="text-[11px] font-medium text-fq-accent uppercase tracking-wider">Monthly event</p>
          <h1 className="text-[17px] font-medium text-white mt-0.5">{bossChallenge.title}</h1>
        </div>
        <span className="text-xs font-medium text-fq-amber">3 days left</span>
      </header>

      <div className="px-4 pb-6 flex-1">
        <p className="text-[11px] text-white/40 mb-3">
          Quest order personalised for <span className="text-fq-accent">{playerType}</span> players
        </p>

        <div className="fq-card rounded-[18px] p-4 relative overflow-hidden mb-3.5">
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: "linear-gradient(90deg, #7ee8a2, #3db87a)" }}
          />
          <p className="text-[10px] font-medium text-fq-accent uppercase tracking-widest mb-1">
            Boss challenge
          </p>
          <h2 className="text-lg font-medium text-white mb-1.5">Slay the Gauntlet</h2>
          <p className="text-xs text-white/50 leading-relaxed mb-3">{bossChallenge.description}</p>

          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-white/45">Workouts</span>
            <span className="text-fq-accent font-medium">
              {bossChallenge.workoutsCurrent} / {bossChallenge.workoutsGoal} ({bossProgress}%)
            </span>
          </div>
          <div className="h-[7px] bg-white/[0.08] rounded-md overflow-hidden mb-2">
            <div className="h-full bg-fq-accent rounded-md transition-all" style={{ width: `${bossProgress}%` }} />
          </div>

          <div className="flex justify-between text-xs mb-3">
            <span className="text-white/45">Personal records</span>
            <span className="text-fq-accent font-medium">
              {bossChallenge.prCurrentCount} / {bossChallenge.prGoalCount}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <div className="bg-white/[0.05] border border-white/[0.08] rounded-[10px] py-2 px-1.5 text-center">
              <Star className="w-4 h-4 text-fq-accent mx-auto mb-1" />
              <span className="text-[11px] font-medium text-white/70">+{bossChallenge.xpReward} XP</span>
            </div>
            <div className="bg-white/[0.05] border border-white/[0.08] rounded-[10px] py-2 px-1.5 text-center">
              <Shield className="w-4 h-4 text-fq-accent mx-auto mb-1" />
              <span className="text-[11px] font-medium text-white/70">+{bossChallenge.shieldReward} Shield</span>
            </div>
            <div className="bg-white/[0.05] border border-white/[0.08] rounded-[10px] py-2 px-1.5 text-center">
              <Trophy className="w-4 h-4 text-fq-amber mx-auto mb-1" />
              <span className="text-[11px] font-medium text-white/70">Elite badge</span>
            </div>
          </div>
        </div>

        <p className="fq-section-title">Active quests</p>
        <p className="text-[11px] text-white/35 -mt-2 mb-2">Progress updates automatically from your logs</p>

        <div className="space-y-2">
          {activeChallenges.map((chall) => (
            <div key={chall.id} className="fq-card rounded-2xl p-3.5">
              <div className="flex justify-between items-start gap-2 mb-1">
                <p className="text-sm font-medium text-white">{chall.title}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.07] text-white/45 shrink-0">
                  {chall.type}
                </span>
              </div>
              <p className="text-xs text-white/45 leading-relaxed mb-2.5">{chall.description}</p>

              {chall.type === "Group" && chall.squadGoal && (
                <p className="text-[11px] text-fq-blue mb-2">
                  Squad progress: {chall.squadCurrent ?? 0} / {chall.squadGoal} combined leg sets
                </p>
              )}

              <div className="flex justify-between text-[11px] text-white/40 mb-1.5">
                <span>{chall.goalText}</span>
                <span>{chall.progress}%</span>
              </div>
              <div className="fq-progress-bar-bg mb-2.5">
                <div
                  className={`fq-progress-bar-fill ${chall.completed ? "done" : ""}`}
                  style={{ width: `${chall.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-fq-accent">
                  +{chall.xpReward} XP
                  {chall.type === "Daily" && !chall.completed && " (+100 on complete)"}
                </span>
                {chall.completed ? (
                  <span className="inline-flex items-center gap-1 bg-fq-accent-dark/12 text-fq-accent-dark border border-fq-accent-dark/20 px-2 py-1 rounded-[10px] text-[11px] font-medium">
                    <Check className="w-3 h-3" />
                    Done
                  </span>
                ) : (
                  <span className="text-[10px] text-white/35">Auto-tracked</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
