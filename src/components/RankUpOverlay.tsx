import type { RankUpResult } from "../types";
import { Award } from "lucide-react";

interface Props {
  rankUp: RankUpResult;
  onClose: () => void;
}

export default function RankUpOverlay({ rankUp, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-fq-bg/95 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-6 text-center fq-top safe-bottom safe-x">
      <div className="w-20 h-20 rounded-full bg-fq-amber/15 border-2 border-fq-amber flex items-center justify-center text-fq-amber mb-5 animate-pulse">
        <Award className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-medium text-white">Rank up!</h2>
      <p className="text-white/50 text-sm mt-2">
        {rankUp.previousRank} → <span className="text-fq-accent font-medium">{rankUp.newRank}</span>
      </p>
      <p className="text-xs text-white/40 mt-1">Level {rankUp.newLevel} · Friends have been notified</p>
      <button onClick={onClose} className="fq-btn-primary max-w-xs mt-8">
        Continue
      </button>
    </div>
  );
}
