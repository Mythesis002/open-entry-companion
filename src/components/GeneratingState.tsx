interface GeneratingStateProps {
  step: string;
}

export function GeneratingState({ step }: GeneratingStateProps) {
  return (
    <div className="flex flex-col items-center gap-10 max-w-xs w-full text-center py-32">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-foreground/5 rounded-full" />
        <div className="absolute inset-0 border-4 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-extrabold font-display">Generating.</h2>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-muted-foreground">
          {step}
        </p>
      </div>
    </div>
  );
}
