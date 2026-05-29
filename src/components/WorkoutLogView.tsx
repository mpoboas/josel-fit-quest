import { useState, useEffect } from "react";
import { Workout, Exercise, Set, UserProfile } from "../types";
import { PRESET_EXERCISES } from "../data";
import { Plus, Trash2, Trophy, Clock, Check, ChevronDown, Award } from "lucide-react";

interface Props {
  userProfile: UserProfile;
  lastWorkout?: Workout;
  onFinishWorkout: (workout: Workout) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function WorkoutLogView({ userProfile, lastWorkout, onFinishWorkout, onNavigateToTab }: Props) {
  // Current active logging state
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: "ex_1",
      name: "Bench Press",
      category: "Chest",
      sets: [
        { id: "s_1", weight: 80, reps: 8 },
        { id: "s_2", weight: 85, reps: 6 },
        { id: "s_3", weight: 90, reps: 5, isPR: true }
      ]
    },
    {
      id: "ex_2",
      name: "Overhead Press",
      category: "Shoulders",
      sets: [
        { id: "s_4", weight: 60, reps: 8 },
        { id: "s_5", weight: 62, reps: 7 }
      ]
    }
  ]);

  const [duration, setDuration] = useState(42); // starts with 42 mins like the mockup
  const [showAddExModal, setShowAddExModal] = useState(false);
  const [celebration, setCelebration] = useState<{ xp: number; newLevel?: number } | null>(null);

  // Auto-calculate the estimated XP Reward
  // Base formulation: (sum of weights * reps) * 0.1, with multipliers for PR (+50%) and streaks (+10-30%)
  const [estimatedXp, setEstimatedXp] = useState(840);

  useEffect(() => {
    let totalVolume = 0;
    let containsPR = false;

    exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        // Cardio counts differently (no weight, reps = minutes)
        if (ex.category === "Cardio") {
          totalVolume += set.reps * 1500; // Cardio multiplier
        } else {
          totalVolume += (set.weight || 0) * (set.reps || 0);
        }
        if (set.isPR) containsPR = true;
      });
    });

    let calcXp = Math.round(totalVolume * 0.15) || 50;

    // Apply bonuses
    if (containsPR) calcXp = Math.round(calcXp * 1.5);
    const streakMultiplier = 1 + Math.min(0.3, userProfile.streak * 0.02);
    calcXp = Math.round(calcXp * streakMultiplier);

    // Baseline min/max to feel balanced
    setEstimatedXp(Math.max(100, Math.min(2500, calcXp)));
  }, [exercises, userProfile.streak]);

  // Utility actions for sets and exercises
  const addSet = (exerciseId: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === exerciseId) {
          const lastSet = ex.sets[ex.sets.length - 1];
          const newSet: Set = {
            id: `s_${Date.now()}_${Math.random()}`,
            weight: lastSet ? lastSet.weight : 50,
            reps: lastSet ? lastSet.reps : 10,
            isPR: false
          };
          return { ...ex, sets: [...ex.sets, newSet] };
        }
        return ex;
      })
    );
  };

  const updateSet = (exerciseId: string, setId: string, field: "weight" | "reps" | "isPR", value: any) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map((set) => (set.id === setId ? { ...set, [field]: value } : set))
          };
        }
        return ex;
      })
    );
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === exerciseId) {
          return { ...ex, sets: ex.sets.filter((s) => s.id !== setId) };
        }
        return ex;
      })
    );
  };

  const handleAddPresetExercise = (preset: { name: string; category: string }) => {
    const newEx: Exercise = {
      id: `ex_${Date.now()}`,
      name: preset.name,
      category: preset.category,
      sets: [{ id: `s_${Date.now()}`, weight: 40, reps: 10 }]
    };
    setExercises([...exercises, newEx]);
    setShowAddExModal(false);
  };

  const handleComplete = () => {
    const today = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const formattedDate = `${days[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]}`;

    const newWorkout: Workout = {
      id: `w_${Date.now()}`,
      title: exercises.map(e => e.name).slice(0, 2).join(" & ") + (exercises.length > 2 ? " Split" : " Session"),
      date: formattedDate,
      rawDate: today.toISOString(),
      duration,
      exercises,
      xpEarned: estimatedXp
    };

    // Trigger parent finish callback
    onFinishWorkout(newWorkout);

    // Trigger local celebration dialog
    setCelebration({
      xp: estimatedXp,
      newLevel: Math.floor((userProfile.xp + estimatedXp) / userProfile.xpToNextLevel) > 0 ? userProfile.level + 1 : undefined
    });
  };

  return (
    <div id="workout-log-view" className="h-full bg-[#050505] text-slate-100 flex flex-col overflow-y-auto">
      
      {/* Dynamic Celebration Overlay Screen */}
      {celebration && (
        <div id="celebration-overlay" className="fixed inset-0 bg-[#050505]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-cyan-400/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 animate-pulse">
            <Trophy className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-serif italic text-white tracking-tight">Quest Completed!</h2>
          <p className="text-slate-400 max-w-sm text-xs mt-2 font-sans">
            Your lifting session has been synced. Core drives and XP indices have updated successfully.
          </p>

          <div className="my-8 bg-zinc-900/90 border border-white/10 rounded-2xl p-6 min-w-[200px]">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Experience Points</div>
            <div className="text-4xl font-serif italic text-cyan-400 mt-1">+{celebration.xp} XP</div>
            
            {celebration.newLevel && (
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-xs text-cyan-400 font-bold font-mono">
                <Award className="w-3.5 h-3.5" />
                <span>LEVEL UP TO {celebration.newLevel}!</span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setCelebration(null);
              onNavigateToTab("Home");
            }}
            className="px-8 py-3.5 rounded-full bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:bg-cyan-400 transition-colors shadow-lg font-mono"
          >
            Claim Rewards & Return
          </button>
        </div>
      )}

      {/* Styled Upper Timing block */}
      <div className="bg-zinc-900/50 p-4 flex items-center justify-between border-b border-white/5">
        <div>
          <div className="text-[10px] text-slate-500 tracking-widest font-mono">CURRENT WORKOUT STATE</div>
          <div className="text-sm font-bold text-white mt-1">Thursday, 29 May</div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-cyan-400">
          <Clock className="w-4 h-4 shrink-0" />
          <input 
            type="number" 
            value={duration} 
            onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 0))}
            className="w-10 bg-transparent text-center focus:outline-none focus:text-white font-bold"
          />
          <span>mins</span>
        </div>
      </div>

      {/* Estimated XP Badge Row */}
      <div className="p-4">
        <div className="bg-zinc-900/50 border border-cyan-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300">Estimated Workout XP</span>
            <p className="text-[10px] text-slate-500 mt-0.5">Calculated based on volume splits & streaks</p>
          </div>
          <strong className="text-2xl font-serif italic text-cyan-400 tracking-tight">+{estimatedXp} XP</strong>
        </div>
      </div>

      {/* Exercises Lists */}
      <div id="exercise-blocks-list" className="space-y-4 px-4 flex-1 pb-10">
        {exercises.map((ex) => (
          <div key={ex.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 relative">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-sm font-extrabold text-white">{ex.name}</h4>
                <span className="inline-block text-[10px] uppercase tracking-widest font-mono text-cyan-400 mt-1">
                  {ex.category}
                </span>
              </div>
              <button 
                onClick={() => setExercises(exercises.filter(item => item.id !== ex.id))}
                className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/5 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Set Grid Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] font-mono text-slate-500 uppercase tracking-widest text-center">
                    <th className="py-2">Set</th>
                    <th className="py-2">Weight (KG)</th>
                    <th className="py-2">Reps</th>
                    <th className="py-2">PR Indicator</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ex.sets.map((set, idx) => (
                    <tr 
                      key={set.id} 
                      className={`text-center font-mono text-xs transition-colors ${
                        set.isPR ? "text-cyan-400 bg-cyan-500/5" : "text-slate-200"
                      }`}
                    >
                      <td className="py-3 font-semibold text-slate-400">{idx + 1}</td>
                      <td className="py-2">
                        {ex.category === "Cardio" ? (
                          <span className="text-slate-500">—</span>
                        ) : (
                          <input 
                            type="number" 
                            value={set.weight} 
                            onChange={(e) => updateSet(ex.id, set.id, "weight", Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-14 bg-white/5 border border-white/10 rounded-lg p-1.5 text-center focus:outline-none focus:border-cyan-500"
                          />
                        )}
                      </td>
                      <td className="py-2">
                        <input 
                          type="number" 
                          value={set.reps} 
                          onChange={(e) => updateSet(ex.id, set.id, "reps", Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-14 bg-white/5 border border-white/10 rounded-lg p-1.5 text-center focus:outline-none focus:border-cyan-500"
                        />
                      </td>
                      <td className="py-2">
                        <label className="inline-flex justify-center items-center cursor-pointer p-1 rounded-lg">
                          <input 
                            type="checkbox" 
                            checked={set.isPR || false} 
                            onChange={(e) => updateSet(ex.id, set.id, "isPR", e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500 relative shrink-0"></div>
                        </label>
                      </td>
                      <td className="py-2">
                        <button 
                          onClick={() => removeSet(ex.id, set.id)}
                          className="text-slate-500 hover:text-red-400 font-semibold p-1"
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button 
              onClick={() => addSet(ex.id)}
              className="mt-3 w-full border border-dashed border-white/10 hover:border-cyan-500/30 rounded-xl p-2 text-center text-[10px] font-mono tracking-widest font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/5 transition-all"
            >
              + ADD SET
            </button>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button 
            type="button"
            onClick={() => setShowAddExModal(true)}
            className="border border-dashed border-white/10 hover:border-cyan-500/40 rounded-2xl p-4 text-center cursor-pointer hover:bg-cyan-500/5 hover:text-cyan-300 transition-all font-mono text-xs font-semibold flex flex-col items-center justify-center gap-1.5 text-slate-500"
          >
            <Plus className="w-5 h-5 text-cyan-400" />
            <span>ADD EXERCISE</span>
          </button>
          
          <button 
            type="button"
            onClick={handleComplete}
            disabled={exercises.length === 0}
            className="rounded-2xl bg-white hover:bg-cyan-400 text-black font-extrabold font-mono text-xs cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 border border-white/10 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-5 h-5 text-black stroke-[3px]" />
            <span>FINISH & GAIN XP</span>
          </button>
        </div>
      </div>

      {/* Add Exercise Modal Dropdown Overlay */}
      {showAddExModal && (
        <div id="add-exercise-modal" className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 w-full max-w-sm rounded-[2rem] border border-white/10 p-6 shadow-2xl overflow-hidden flex flex-col max-h-[480px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold font-mono tracking-widest text-slate-400">PRESET CORE EXERCISES</h3>
              <button 
                onClick={() => setShowAddExModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold font-mono"
              >
                &times;
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 divide-y divide-white/5 pr-1 font-mono">
              {PRESET_EXERCISES.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleAddPresetExercise(preset)}
                  className="w-full text-left py-3 flex justify-between items-center group hover:bg-white/5 px-2 rounded-xl transition"
                >
                  <span className="text-xs text-white group-hover:text-cyan-400 font-semibold">{preset.name}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">{preset.category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
