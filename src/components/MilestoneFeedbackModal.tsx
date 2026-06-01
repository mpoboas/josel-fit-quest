interface Props {
  milestoneKey: string;
  onSubmit: (rating: number) => void;
  onDismiss: () => void;
}

export default function MilestoneFeedbackModal({ milestoneKey, onSubmit, onDismiss }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 z-[55] flex items-end safe-x safe-bottom">
      <div className="bg-fq-card w-full rounded-t-3xl border-t border-white/[0.07] p-5">
        <p className="text-xs text-fq-accent uppercase tracking-wider mb-1">Quick pulse</p>
        <h3 className="text-base font-medium text-white mb-1">How did that milestone feel?</h3>
        <p className="text-xs text-white/45 mb-4">Your feedback personalises future challenges.</p>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => onSubmit(n)}
              className="flex-1 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-sm font-medium text-white active:bg-fq-accent/20 active:border-fq-accent/30"
            >
              {n}
            </button>
          ))}
        </div>
        <button onClick={onDismiss} className="w-full py-2.5 text-sm text-white/45">
          Skip
        </button>
        <input type="hidden" value={milestoneKey} readOnly />
      </div>
    </div>
  );
}
