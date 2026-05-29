import { useState } from "react";
import { UserProfile } from "../types";
import { HelpCircle, RefreshCw, Star, Info, ChevronRight, Check } from "lucide-react";

interface Props {
  userProfile: UserProfile;
  onUpdateScores: (scores: UserProfile["octalysisScores"]) => void;
  onClose: () => void;
}

export default function MainQuizOverlay({ userProfile, onUpdateScores, onClose }: Props) {
  const [scores, setScores] = useState({ ...userProfile.octalysisScores });
  const [activeQuestion, setActiveQuestion] = useState(0);

  const drives = [
    {
      key: "meaning" as const,
      name: "Epic Meaning & Calling",
      desc: "Do you want to feel part of a collective fitness movement or help beginners via mentorship badges?",
      icon: "🌟"
    },
    {
      key: "accomplishment" as const,
      name: "Development & Accomplishment",
      desc: "Does hitting a specific weight PR and climbing levels satisfy your drive for progress?",
      icon: "🏆"
    },
    {
      key: "creativity" as const,
      name: "Empowerment of Creativity",
      desc: "Do you enjoy designing your own workout splits or receiving dynamic analytics feedback?",
      icon: "🎨"
    },
    {
      key: "ownership" as const,
      name: "Ownership & Possession",
      desc: "Do you care about badge cabinets, owning streak protectors, and accumulated stats?",
      icon: "🎒"
    },
    {
      key: "influence" as const,
      name: "Social Influence & Relatedness",
      desc: "Does competing directly with friends on leaderboards and sending high-fives govern your motivation?",
      icon: "👥"
    },
    {
      key: "scarcity" as const,
      name: "Scarcity & Impatience",
      desc: "Does a time-limited monthly boss challenge and urgency create drive for consistency?",
      icon: "⏳"
    },
    {
      key: "curiosity" as const,
      name: "Unpredictability & Curiosity",
      desc: "Do unexpected AI coaches, mysterious custom rewards, and surprise milestones keep you excited?",
      icon: "🧩"
    },
    {
      key: "avoidance" as const,
      name: "Loss & Avoidance",
      desc: "Does the anxiety of breaking a 14-day streak or being demoted down leaderboards govern your behavior?",
      icon: "🛡️"
    }
  ];

  const handleSliderChange = (key: keyof UserProfile["octalysisScores"], value: number) => {
    setScores({
      ...scores,
      [key]: value
    });
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
    <div id="octalysis-quiz-overlay" className="fixed inset-0 bg-[#050505]/95 backdrop-blur-md z-40 flex items-center justify-center p-4 font-sans">
      <div className="bg-zinc-900 w-full max-w-sm rounded-[2.5rem] border border-white/10 p-6 shadow-2xl overflow-hidden flex flex-col max-h-[500px]">
        
        {/* Progress header bar */}
        <div className="flex justify-between items-center text-[10px] font-mono text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-3 mb-4 shrink-0">
          <span>Octalysis Drives Self-Quiz</span>
          <span>{activeQuestion + 1} of {drives.length}</span>
        </div>

        {/* Dynamic Question body */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col justify-center font-sans">
          <div className="text-4xl text-center mb-3">
            {currentDrive.icon}
          </div>
          
          <h3 className="text-sm font-bold text-white text-center tracking-tight mb-2 font-serif italic">
            {currentDrive.name}
          </h3>
          <p className="text-xs text-slate-400 text-center leading-normal mb-6 leading-relaxed">
            {currentDrive.desc}
          </p>

          {/* Slider input element */}
          <div className="space-y-3 bg-white/5 border border-white/5 p-4 rounded-2xl">
            <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <span>Low Priority</span>
              <span className="text-cyan-400 font-bold">{scores[currentDrive.key]}%</span>
              <span>Extreme</span>
            </div>
            
            <input 
              type="range"
              min="0"
              max="100"
              value={scores[currentDrive.key]}
              onChange={(e) => handleSliderChange(currentDrive.key, parseInt(e.target.value) || 0)}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        {/* Buttons action bar */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5 mt-4 shrink-0 font-mono">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-xs font-mono tracking-widest py-3 uppercase transition-all"
          >
            QUIT QUIZ
          </button>
          
          <button
            onClick={handleNext}
            className="rounded-xl bg-white text-black hover:bg-cyan-400 text-xs font-mono tracking-widest font-bold py-3 uppercase transition-all flex items-center justify-center gap-1.5"
          >
            <span>{activeQuestion < drives.length - 1 ? "NEXT DRIVE" : "SAVE CHART"}</span>
            {activeQuestion < drives.length - 1 ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <Check className="w-3.5 h-3.5 stroke-[3px]" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
