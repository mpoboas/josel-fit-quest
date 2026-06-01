import { useState } from "react";
import { UserProfile } from "../types";
import { ChevronRight, Check, X } from "lucide-react";

interface Props {
  userProfile: UserProfile;
  onUpdateScores: (scores: UserProfile["octalysisScores"]) => void;
  onClose: () => void;
  required?: boolean;
}

export default function MainQuizOverlay({ userProfile, onUpdateScores, onClose, required }: Props) {
  const [scores, setScores] = useState({ ...userProfile.octalysisScores });
  const [activeQuestion, setActiveQuestion] = useState(0);

  const drives = [
    {
      key: "meaning" as const,
      name: "Epic Meaning",
      desc: "Being part of something bigger — a fitness community or mentorship.",
      icon: "🌟"
    },
    {
      key: "accomplishment" as const,
      name: "Accomplishment",
      desc: "Hitting PRs, leveling up, and seeing measurable progress.",
      icon: "🏆"
    },
    {
      key: "creativity" as const,
      name: "Creativity",
      desc: "Designing your own splits and exploring new exercises.",
      icon: "🎨"
    },
    {
      key: "ownership" as const,
      name: "Ownership",
      desc: "Collecting badges, stats, and streak protection items.",
      icon: "🎒"
    },
    {
      key: "influence" as const,
      name: "Social Influence",
      desc: "Competing with friends and sending high-fives on the leaderboard.",
      icon: "👥"
    },
    {
      key: "scarcity" as const,
      name: "Scarcity",
      desc: "Time-limited boss challenges and exclusive rewards.",
      icon: "⏳"
    },
    {
      key: "curiosity" as const,
      name: "Curiosity",
      desc: "Surprise milestones and unexpected rewards.",
      icon: "🧩"
    },
    {
      key: "avoidance" as const,
      name: "Loss Avoidance",
      desc: "Protecting your streak and avoiding rank drops.",
      icon: "🛡️"
    }
  ];

  const handleSliderChange = (key: keyof UserProfile["octalysisScores"], value: number) => {
    setScores({ ...scores, [key]: value });
  };

  const handleNext = () => {
    if (activeQuestion < drives.length - 1) {
      setActiveQuestion(activeQuestion + 1);
    } else {
      onUpdateScores(scores);
    }
  };

  const currentDrive = drives[activeQuestion];

  return (
    <div className="fixed inset-0 bg-fq-bg/95 backdrop-blur-md z-40 flex flex-col fq-top safe-bottom safe-x">
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/[0.06] shrink-0">
        <span className="text-sm font-medium text-white">Motivation quiz</span>
        {!required && (
          <button onClick={onClose} className="p-2 rounded-xl active:bg-white/5 touch-target" aria-label="Close">
            <X className="w-5 h-5 text-white/45" />
          </button>
        )}
      </div>

      <div className="px-3.5 py-3 shrink-0">
        <div className="flex justify-between text-xs text-fq-accent mb-2">
          <span>
            {activeQuestion + 1} of {drives.length}
          </span>
          <span>{Math.round(((activeQuestion + 1) / drives.length) * 100)}%</span>
        </div>
        <div className="fq-xp-bar-bg h-1.5">
          <div
            className="fq-xp-bar-fill"
            style={{ width: `${((activeQuestion + 1) / drives.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-container px-3.5 flex flex-col justify-center">
        <div className="text-5xl text-center mb-4">{currentDrive.icon}</div>
        <h3 className="text-lg font-medium text-white text-center mb-2">{currentDrive.name}</h3>
        <p className="text-sm text-white/45 text-center leading-relaxed mb-8 px-2">{currentDrive.desc}</p>

        <div className="fq-card rounded-2xl p-5">
          <div className="flex justify-between text-xs text-white/45 mb-4">
            <span>Not important</span>
            <span className="text-fq-accent font-medium text-base">{scores[currentDrive.key]}%</span>
            <span>Very important</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={scores[currentDrive.key]}
            onChange={(e) => handleSliderChange(currentDrive.key, parseInt(e.target.value) || 0)}
            className="w-full"
          />
        </div>
      </div>

      <div
        className={`gap-3 p-3.5 border-t border-white/[0.06] shrink-0 safe-bottom ${
          required ? "grid grid-cols-1" : "grid grid-cols-2"
        }`}
      >
        {!required && (
          <button
            onClick={onClose}
            className="py-3.5 rounded-2xl border border-white/10 text-white/45 text-sm font-medium active:bg-white/5"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleNext}
          className="py-3.5 rounded-2xl bg-fq-accent text-fq-bg text-sm font-medium active:opacity-90 flex items-center justify-center gap-1.5"
        >
          <span>{activeQuestion < drives.length - 1 ? "Next" : "Save"}</span>
          {activeQuestion < drives.length - 1 ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <Check className="w-4 h-4 stroke-[2.5px]" />
          )}
        </button>
      </div>
    </div>
  );
}
