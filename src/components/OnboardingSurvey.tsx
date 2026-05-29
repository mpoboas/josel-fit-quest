import { useState } from "react";
import { UserProfile } from "../types";
import { Sparkles, Trophy, Shuffle, Users, Shield, Zap } from "lucide-react";

interface Props {
  onComplete: (profile: Partial<UserProfile>) => void;
}

export default function OnboardingSurvey({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [scores, setScores] = useState({
    meaning: 50,
    accomplishment: 50,
    creativity: 50,
    ownership: 50,
    influence: 50,
    scarcity: 50,
    curiosity: 50,
    avoidance: 50
  });

  const questions = [
    {
      id: "q_interest",
      title: "What is your principal driver in a fitness application?",
      description: "This helps us adjust the gamified reward systems to your natural behavior.",
      options: [
        {
          value: "Achiever",
          lbl: "Shattering personal records and leveling up my character",
          desc: "Taps into Development & Accomplishment",
          icon: Trophy,
          color: "text-amber-500 bg-amber-50"
        },
        {
          value: "Explorer",
          lbl: "Customizing unique workout splits and exploring diverse exercises",
          desc: "Taps into Empowerment of Creativity & Feedback",
          icon: Shuffle,
          color: "text-indigo-500 bg-indigo-50"
        },
        {
          value: "Socialiser",
          lbl: "Engaging in group challenges, active feeds, and team pacts",
          desc: "Taps into Social Influence & Relatedness",
          icon: Users,
          color: "text-emerald-500 bg-emerald-50"
        },
        {
          value: "Killer",
          lbl: "Competing in weekly sprints to dominate the leaderboards",
          desc: "Taps into Competitive Scarcity & Influence",
          icon: Zap,
          color: "text-rose-500 bg-rose-50"
        }
      ]
    },
    {
      id: "q_priority",
      title: "Select your primary fitness objective",
      description: "Our AI Personal Coach will construct recommendation loops based on this.",
      options: [
        { value: "strength", lbl: "Heavy Strength & Hypertrophy Training Splits", desc: "Build pure muscle volume & heavy PRs", icon: Trophy, color: "text-blue-500 bg-blue-50" },
        { value: "cardio", lbl: "Cardiovascular Endurance, HIIT, & Fat Burn", desc: "Optimize VO2 max & cardiac conditioning", icon: Zap, color: "text-orange-500 bg-orange-50" },
        { value: "balance", lbl: "Functional Balance, core conditioning, & longevity", desc: "A general blend of conditioning and splits", icon: Shuffle, color: "text-teal-500 bg-teal-50" }
      ]
    },
    {
      id: "q_streak",
      title: "How do you feel when a busy day risks breaking your streak?",
      description: "Streaks represent habit consistency, but we design them safely.",
      options: [
        { value: "shield", lbl: "Highly anxious! I'd love a 'Streak Shield' item to protect it.", desc: "Focuses on Loss & Avoidance drive", icon: Shield, color: "text-violet-500 bg-violet-50" },
        { value: "relaxed", lbl: "Undeterred. I prefer pacing myself without rigid milestones.", desc: "Autonomy over obsession focus", icon: Sparkles, color: "text-pink-500 bg-pink-50" }
      ]
    }
  ];

  const handleSelectOption = (questionId: string, value: string) => {
    const updatedAnswers = { ...answers, [questionId]: value };
    setAnswers(updatedAnswers);

    // Calculate dynamic changes to Octalysis scores based on choice
    const newScores = { ...scores };
    if (questionId === "q_interest") {
      if (value === "Achiever") {
        newScores.accomplishment += 30;
        newScores.ownership += 10;
      } else if (value === "Explorer") {
        newScores.creativity += 30;
        newScores.curiosity += 20;
      } else if (value === "Socialiser") {
        newScores.influence += 30;
        newScores.meaning += 15;
      } else if (value === "Killer") {
        newScores.scarcity += 30;
        newScores.influence += 15;
      }
    } else if (questionId === "q_priority") {
      newScores.accomplishment += 10;
      newScores.creativity += 10;
    } else if (questionId === "q_streak") {
      if (value === "shield") {
        newScores.avoidance += 25;
      } else {
        newScores.avoidance -= 10;
      }
    }

    setScores(newScores);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Finished!
      const finalPlayerType = (updatedAnswers["q_interest"] as any) || "Explorer";
      onComplete({
        playerType: finalPlayerType,
        onboardingComplete: true,
        octalysisScores: newScores
      });
    }
  };

  const currentQuestion = questions[step];

  return (
    <div id="survey-wizard-container" className="fixed inset-0 bg-[#050505] z-50 flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-[#050505] to-[#050505] pointer-events-none opacity-80" />
      
      <div id="survey-wizard-box" className="w-full max-w-lg bg-zinc-900/95 border border-white/10 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl relative z-10">
        
        {/* Progress Bar Header */}
        <div className="bg-zinc-900 p-6 text-center border-b border-white/5 relative">
          <div className="flex justify-between text-xs text-cyan-400 font-mono tracking-widest mb-2">
            <span>FITQUEST ONBOARDING DESIGN</span>
            <span>STEP {step + 1} OF {questions.length}</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${((step + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Body */}
        <div className="p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2 font-serif italic">
              {currentQuestion.title}
            </h1>
            <p className="text-sm text-slate-400">
              {currentQuestion.description}
            </p>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelectOption(currentQuestion.id, opt.value)}
                  className="w-full flex items-center gap-4 text-left p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-400/20 transition-all duration-200 group relative"
                >
                  <div className="p-3 rounded-xl shrink-0 text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {opt.lbl}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {opt.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-zinc-950 p-4 text-center border-t border-white/5">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
            Guided by Octalysis Framework & Bartle Player Types
          </p>
        </div>
      </div>
    </div>
  );
}
