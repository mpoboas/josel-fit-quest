import { useState } from "react";
import { UserProfile } from "../types";
import { Trophy, Shuffle, Users, Zap, Shield, Sparkles } from "lucide-react";

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
      title: "What motivates you most?",
      description: "We'll tailor challenges and rewards to match your style.",
      options: [
        {
          value: "Achiever",
          lbl: "Breaking records and leveling up",
          desc: "Progress, PRs, and personal milestones",
          icon: Trophy
        },
        {
          value: "Explorer",
          lbl: "Trying new workouts and exercises",
          desc: "Variety, creativity, and discovery",
          icon: Shuffle
        },
        {
          value: "Socialiser",
          lbl: "Group challenges and community",
          desc: "Friends, leaderboards, and shared goals",
          icon: Users
        },
        {
          value: "Killer",
          lbl: "Competing on the leaderboard",
          desc: "Rankings, rivalry, and winning",
          icon: Zap
        }
      ]
    },
    {
      id: "q_priority",
      title: "What's your main fitness goal?",
      description: "This shapes your default challenges and tracking focus.",
      options: [
        { value: "strength", lbl: "Strength & muscle building", desc: "Heavy lifts, hypertrophy, PRs", icon: Trophy },
        { value: "cardio", lbl: "Cardio & endurance", desc: "HIIT, running, conditioning", icon: Zap },
        { value: "balance", lbl: "Balanced fitness", desc: "Mix of strength and cardio", icon: Shuffle }
      ]
    },
    {
      id: "q_streak",
      title: "How do you feel about streaks?",
      description: "We can adjust how much streak pressure you feel.",
      options: [
        { value: "shield", lbl: "I want streak protection", desc: "Earn shields to safeguard your streak", icon: Shield },
        { value: "relaxed", lbl: "Keep it flexible", desc: "Progress at my own pace", icon: Sparkles }
      ]
    }
  ];

  const handleSelectOption = (questionId: string, value: string) => {
    const updatedAnswers = { ...answers, [questionId]: value };
    setAnswers(updatedAnswers);

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
      const finalPlayerType = (updatedAnswers["q_interest"] as UserProfile["playerType"]) || "Explorer";
      const fitnessGoal = updatedAnswers["q_priority"] as UserProfile["fitnessGoal"];
      onComplete({
        playerType: finalPlayerType,
        fitnessGoal,
        octalysisScores: newScores
      });
    }
  };

  const currentQuestion = questions[step];

  return (
    <div className="fixed inset-0 bg-fq-bg z-50 flex flex-col fq-top safe-bottom safe-x">
      <div className="relative z-10 flex flex-col h-full px-4 pt-2 pb-6">
        <div className="mb-6">
          <div className="flex justify-between text-xs text-fq-accent mb-3">
            <span className="font-medium">FitQuest</span>
            <span>
              Step {step + 1} of {questions.length}
            </span>
          </div>
          <div className="fq-xp-bar-bg h-1.5">
            <div
              className="fq-xp-bar-fill"
              style={{ width: `${((step + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-2xl font-medium text-white mb-2 leading-tight">{currentQuestion.title}</h1>
          <p className="text-sm text-white/45 mb-6">{currentQuestion.description}</p>

          <div className="space-y-3">
            {currentQuestion.options.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelectOption(currentQuestion.id, opt.value)}
                  className="w-full flex items-center gap-4 text-left p-4 rounded-2xl fq-card active:bg-fq-card-hover active:scale-[0.98] transition-all"
                >
                  <div className="p-3 rounded-xl shrink-0 text-fq-accent bg-fq-accent/10 border border-fq-accent/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white">{opt.lbl}</div>
                    <div className="text-xs text-white/45 mt-0.5">{opt.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
