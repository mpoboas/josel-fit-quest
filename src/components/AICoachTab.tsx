import { useState, useEffect } from "react";
import { UserProfile, Workout, Challenge } from "../types";
import { Sparkles, Dumbbell, Shield, HelpCircle, Bot, Loader2, ArrowRight, BookOpen, AlertCircle } from "lucide-react";

interface Props {
  userProfile: UserProfile;
  workoutHistory: Workout[];
  onAddChallenge: (challenge: Challenge) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function AICoachTab({ userProfile, workoutHistory, onAddChallenge, onNavigateToTab }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coachData, setCoachData] = useState<{
    insight: string;
    recommendations: string[];
    customChallenge: {
      title: string;
      description: string;
      rewardXp: number;
      target: string;
    };
  } | null>(null);

  const [addedChallenge, setAddedChallenge] = useState(false);

  // Load recommendation insights from the server-side proxy
  const fetchAdvice = async () => {
    setLoading(true);
    setError(null);
    setAddedChallenge(false);

    try {
      const response = await fetch("/api/coach/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerType: userProfile.playerType,
          userDrives: userProfile.octalysisScores,
          goals: ["PR shattering", "balanced Splits", "streak preservation"],
          workoutHistory: workoutHistory.slice(-3).map((w) => ({
            title: w.title,
            duration: w.duration,
            exerciseCount: w.exercises.length,
            xpEarned: w.xpEarned
          })),
          level: userProfile.level,
          rank: userProfile.rank
        })
      });

      if (!response.ok) {
        throw new Error("HTTP connection to AI Coach failed.");
      }

      const data = await response.json();
      setCoachData(data);
    } catch (err: any) {
      console.warn("AI Coach API fell back to built-in insights:", err);
      // Fallback data if Gemini API key placeholder didn't resolve or error occurred
      setCoachData({
        insight: `Welcome, ${userProfile.name.split(" ")[0]}! As a dominant '${userProfile.playerType}' player type, you thrive on Development & Accomplishment indices. Let's engineer customized compound targets!`,
        recommendations: [
          "Bypass compound strength plateaus by prioritizing Bench Press at a 4-cycle progressive volume.",
          "Balance heavy compound splits with a mandatory high-VO2 cardio treadmill sprint once a week.",
          "Maintain your 14-day streak to trigger Silver rank-up metrics!"
        ],
        customChallenge: {
          title: "Aura PR Shatterer",
          description: `Hit any brand new compound weight PR over the next 3 days on a Chest or Shoulders split.`,
          rewardXp: 500,
          target: "1 new PR in compound list"
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, [userProfile.playerType]);

  const handleAddCustomToQuests = () => {
    if (!coachData) return;

    const newChallenge: Challenge = {
      id: `ai_${Date.now()}`,
      title: coachData.customChallenge.title,
      description: coachData.customChallenge.description,
      type: "Daily",
      progress: 0,
      goalText: coachData.customChallenge.target,
      xpReward: coachData.customChallenge.rewardXp,
      completed: false
    };

    onAddChallenge(newChallenge);
    setAddedChallenge(true);
  };

  return (
    <div id="ai-coach-tab" className="h-full bg-[#050505] text-slate-100 flex flex-col overflow-y-auto font-sans">
      
      {/* Dynamic Header Block */}
      <div className="bg-gradient-to-b from-cyan-950/20 to-[#050505] p-6 text-center rounded-b-[2.5rem] relative overflow-hidden shrink-0 border-b border-white/10">
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 mx-auto shadow-xl relative animate-pulse">
          <Bot className="w-7 h-7" />
        </div>

        <h2 className="text-lg font-bold tracking-tight mt-3 text-white font-serif italic">Smart AI Personal Coach</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto font-sans">
          Tailoring custom routines, behavioral motivation support, and Octalysis drives analysis.
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
          <h4 className="text-sm font-bold text-white">Generating custom fitness loops...</h4>
          <p className="text-xs text-slate-500 mt-1.5 max-w-xs leading-relaxed">
            Consulting fitness strategy indices, analyzing your {userProfile.playerType} Bartle scores, and modeling splits.
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-4 flex-1 pb-12 shrink-0">
          
          {/* Key Coach Insight Box */}
          {coachData && (
            <div id="ai-insight-box" className="bg-zinc-900/50 border border-cyan-500/20 rounded-2xl p-4 relative">
              <div className="absolute top-3 right-3 text-cyan-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono mb-2">Coach Insight</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
                {coachData.insight}
              </p>
            </div>
          )}

          {/* Actionable Recommendations List */}
          {coachData && (
            <div id="ai-recommendations" className="space-y-2.5">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1">Tailored Recommendations</h3>
              
              {coachData.recommendations.map((rec, index) => (
                <div key={index} className="bg-zinc-900/50 border border-white/5 rounded-xl p-3.5 flex gap-3 items-start hover:border-cyan-500/10 transition-colors">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-555/20 flex items-center justify-center text-[10px] font-mono font-bold text-cyan-300 shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-xs text-slate-300 leading-normal">{rec}</p>
                </div>
              ))}
            </div>
          )}

          {/* AI Custom Challenge generator */}
          {coachData && coachData.customChallenge && (
            <div id="ai-custom-challenge-box" className="bg-zinc-900 border border-white/10 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-cyan-300">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-widest">
                  MODEL GENERATED QUEST
                </span>
              </div>

              <h4 className="text-xs font-bold text-white mb-1 font-serif italic">
                {coachData.customChallenge.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4 font-sans">
                {coachData.customChallenge.description}
              </p>

              <div className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-3">
                <div className="text-xs font-mono text-cyan-400 font-bold">
                  +{coachData.customChallenge.rewardXp} XP Reward
                </div>

                {addedChallenge ? (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                    Added to Active Quests
                  </span>
                ) : (
                  <button
                    onClick={handleAddCustomToQuests}
                    className="px-3.5 py-1.5 rounded-lg bg-white text-black font-bold text-[10px] font-mono uppercase tracking-widest hover:bg-cyan-400 transition-colors"
                  >
                    Accept Quest
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Regenerate advice toggle option */}
          <button
            onClick={fetchAdvice}
            className="w-full text-center border border-dashed border-white/10 hover:border-cyan-400/20 rounded-xl p-2.5 text-xs font-mono font-bold tracking-widest text-slate-400 hover:text-white transition uppercase"
          >
            RECALCULATE FITNESS ANALYSIS
          </button>

        </div>
      )}
    </div>
  );
}
