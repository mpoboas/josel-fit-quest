import { useState, useEffect, type FC } from "react";
import { Workout, Exercise, Set, UserProfile } from "../types";
import { PRESET_EXERCISES } from "../data";
import { Plus, Trash2, Trophy, Clock, Check, Award, X } from "lucide-react";

interface Props {
  userProfile: UserProfile;
  lastWorkout?: Workout;
  onFinishWorkout: (workout: Workout) => void;
  onNavigateToTab: (tab: string) => void;
}

function formatToday() {
  const today = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]}`;
}

type ExerciseSetRowProps = {
  index: number;
  isCardio: boolean;
  weight: number;
  reps: number;
  isPR?: boolean;
  onWeightChange: (v: number) => void;
  onRepsChange: (v: number) => void;
  onTogglePR: () => void;
  onRemove: () => void;
};

const ExerciseSetRow: FC<ExerciseSetRowProps> = ({
  index,
  isCardio,
  weight,
  reps,
  isPR,
  onWeightChange,
  onRepsChange,
  onTogglePR,
  onRemove
}) => {
  const inputClass =
    "w-full min-w-0 bg-white/[0.05] border border-white/[0.09] rounded-[10px] py-2 px-1.5 text-sm font-medium text-white text-center focus:outline-none focus:border-fq-accent/40";

  return (
    <div className="flex items-center gap-1.5 mb-1.5 min-w-0">
      <span className="w-6 shrink-0 text-center text-xs text-white/35">{index + 1}</span>

      {!isCardio && (
        <div className="flex-1 min-w-0 basis-0">
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => onWeightChange(Math.max(0, parseFloat(e.target.value) || 0))}
            className={inputClass}
            aria-label={`Set ${index + 1} weight in kg`}
          />
        </div>
      )}

      <div className={`min-w-0 basis-0 ${isCardio ? "flex-[2]" : "flex-1"}`}>
        <input
          type="number"
          inputMode="numeric"
          value={reps}
          onChange={(e) => onRepsChange(Math.max(0, parseInt(e.target.value) || 0))}
          className={inputClass}
          aria-label={`Set ${index + 1} ${isCardio ? "minutes" : "reps"}`}
        />
      </div>

      <button
        type="button"
        onClick={onTogglePR}
        className={`w-[52px] shrink-0 h-9 rounded-[10px] text-[11px] font-medium border touch-target ${
          isPR
            ? "bg-fq-amber/15 border-fq-amber/30 text-fq-amber"
            : "bg-transparent border-white/10 text-white/35"
        }`}
      >
        PR
      </button>

      <button
        type="button"
        onClick={onRemove}
        className="w-6 shrink-0 flex items-center justify-center text-white/20 active:text-red-400 touch-target"
        aria-label={`Remove set ${index + 1}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

function SetTableHeader({ isCardio }: { isCardio: boolean }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5 px-0.5 min-w-0">
      <span className="w-6 shrink-0" />
      {!isCardio && (
        <span className="flex-1 min-w-0 basis-0 text-center text-[10px] font-medium text-white/35 uppercase tracking-wider">
          KG
        </span>
      )}
      <span
        className={`min-w-0 basis-0 text-center text-[10px] font-medium text-white/35 uppercase tracking-wider ${
          isCardio ? "flex-[2]" : "flex-1"
        }`}
      >
        {isCardio ? "Min" : "Reps"}
      </span>
      <span className="w-[52px] shrink-0 text-center text-[10px] font-medium text-white/35 uppercase tracking-wider">
        PR
      </span>
      <span className="w-6 shrink-0" />
    </div>
  );
}

export default function WorkoutLogView({ userProfile, onFinishWorkout, onNavigateToTab }: Props) {
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

  const [duration, setDuration] = useState(42);
  const [showAddExModal, setShowAddExModal] = useState(false);
  const [celebration, setCelebration] = useState<{ xp: number; newLevel?: number } | null>(null);
  const [estimatedXp, setEstimatedXp] = useState(840);

  useEffect(() => {
    let totalVolume = 0;
    let containsPR = false;

    exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (ex.category === "Cardio") {
          totalVolume += set.reps * 1500;
        } else {
          totalVolume += (set.weight || 0) * (set.reps || 0);
        }
        if (set.isPR) containsPR = true;
      });
    });

    let calcXp = Math.round(totalVolume * 0.15) || 50;
    if (containsPR) calcXp = Math.round(calcXp * 1.5);
    const streakMultiplier = 1 + Math.min(0.3, userProfile.streak * 0.02);
    calcXp = Math.round(calcXp * streakMultiplier);
    setEstimatedXp(Math.max(100, Math.min(2500, calcXp)));
  }, [exercises, userProfile.streak]);

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

  const updateSet = (exerciseId: string, setId: string, field: "weight" | "reps" | "isPR", value: number | boolean) => {
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
      title: exercises.map((e) => e.name).slice(0, 2).join(" & ") + (exercises.length > 2 ? " Split" : " Session"),
      date: formattedDate,
      rawDate: today.toISOString(),
      duration,
      exercises,
      xpEarned: estimatedXp
    };

    onFinishWorkout(newWorkout);
    setCelebration({
      xp: estimatedXp,
      newLevel:
        Math.floor((userProfile.xp + estimatedXp) / userProfile.xpToNextLevel) > 0
          ? userProfile.level + 1
          : undefined
    });
  };

  return (
    <div className="h-full min-h-0 bg-fq-bg text-[#f0f0f0] flex flex-col overflow-hidden">
      {celebration && (
        <div className="fixed inset-0 bg-fq-bg/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center fq-top safe-bottom safe-x">
          <div className="w-20 h-20 rounded-full bg-fq-accent/10 border border-fq-accent/30 flex items-center justify-center text-fq-accent mb-6">
            <Trophy className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-medium text-white">Workout complete!</h2>
          <p className="text-white/45 text-sm mt-2 max-w-xs">
            Great session. Your XP and streak have been updated.
          </p>

          <div className="my-8 fq-card rounded-2xl p-6 min-w-[200px]">
            <p className="text-xs text-white/45 uppercase tracking-wider">Experience</p>
            <p className="text-4xl font-medium text-fq-accent mt-1">+{celebration.xp} XP</p>
            {celebration.newLevel && (
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-fq-accent/10 border border-fq-accent/20 text-xs text-fq-accent font-medium">
                <Award className="w-3.5 h-3.5" />
                Level {celebration.newLevel}!
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setCelebration(null);
              onNavigateToTab("Home");
            }}
            className="fq-btn-primary max-w-xs"
          >
            Back to home
          </button>
        </div>
      )}

      <header className="px-4 fq-top pb-3 shrink-0">
        <p className="text-xs text-white/45">Today&apos;s workout · {formatToday()}</p>
        <div className="flex items-center gap-1.5 mt-2.5 mb-3 text-xs text-white/50">
          <Clock className="w-3.5 h-3.5 text-fq-accent shrink-0" />
          <input
            type="number"
            inputMode="numeric"
            value={duration}
            onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 0))}
            className="w-10 bg-transparent text-center focus:outline-none font-medium text-white"
          />
          <span>min</span>
        </div>

        <div className="bg-fq-accent/[0.08] border border-fq-accent/[0.18] rounded-xl px-3.5 py-2.5 flex items-center justify-between">
          <span className="text-xs text-white/50">Estimated XP</span>
          <strong className="text-lg font-medium text-fq-accent">+{estimatedXp}</strong>
        </div>
      </header>

      <div
        data-tour="workout-exercises"
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scroll-container px-4 pb-4 space-y-3"
      >
        {exercises.map((ex) => {
          const isCardio = ex.category === "Cardio";
          return (
            <div key={ex.id} className="fq-card rounded-2xl p-3.5 min-w-0 overflow-hidden">
              <div className="flex justify-between items-start gap-2 mb-0.5">
                <p className="text-[15px] font-medium text-white truncate">{ex.name}</p>
                <button
                  onClick={() => setExercises(exercises.filter((item) => item.id !== ex.id))}
                  className="p-1 -mr-1 text-white/20 active:text-red-400 touch-target shrink-0"
                  aria-label={`Remove ${ex.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-white/40 mb-3">{ex.category}</p>

              <SetTableHeader isCardio={isCardio} />

              {ex.sets.map((set, idx) => (
                <ExerciseSetRow
                  key={set.id}
                  index={idx}
                  isCardio={isCardio}
                  weight={set.weight}
                  reps={set.reps}
                  isPR={set.isPR}
                  onWeightChange={(v) => updateSet(ex.id, set.id, "weight", v)}
                  onRepsChange={(v) => updateSet(ex.id, set.id, "reps", v)}
                  onTogglePR={() => updateSet(ex.id, set.id, "isPR", !set.isPR)}
                  onRemove={() => removeSet(ex.id, set.id)}
                />
              ))}

              <button
                type="button"
                onClick={() => addSet(ex.id)}
                className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-white/[0.12] rounded-[10px] text-[13px] text-white/40 active:border-fq-accent/30 active:text-fq-accent transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add set
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setShowAddExModal(true)}
          className="w-full border border-dashed border-white/[0.12] rounded-2xl py-3.5 flex items-center justify-center gap-2 text-white/40 active:border-fq-accent/30 active:text-fq-accent transition-colors"
        >
          <Plus className="w-4 h-4 text-fq-accent" />
          <span className="text-sm font-medium">Add exercise</span>
        </button>
      </div>

      <div className="shrink-0 px-4 py-3 border-t border-white/[0.06] bg-fq-bg safe-bottom">
        <button
          type="button"
          data-tour="finish-workout"
          onClick={handleComplete}
          disabled={exercises.length === 0}
          className="fq-btn-primary"
        >
          <Check className="w-[18px] h-[18px] stroke-[2.5px]" />
          Finish workout · +{estimatedXp} XP
        </button>
      </div>

      {showAddExModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex flex-col fq-top safe-bottom safe-x">
          <div className="flex-1 flex flex-col bg-fq-card mt-auto rounded-t-3xl border-t border-white/[0.07] max-h-[85dvh] min-h-0">
            <div className="flex justify-between items-center px-5 py-4 border-b border-white/[0.06] shrink-0">
              <h3 className="text-base font-medium text-white">Add exercise</h3>
              <button
                onClick={() => setShowAddExModal(false)}
                className="p-2 rounded-xl text-white/45 active:bg-white/5 touch-target"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto scroll-container flex-1 divide-y divide-white/[0.06]">
              {PRESET_EXERCISES.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleAddPresetExercise(preset)}
                  className="w-full text-left px-5 py-4 flex justify-between items-center active:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-medium text-white">{preset.name}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.05] text-white/45">
                    {preset.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
