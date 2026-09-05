import { cn } from '../lib/utils';
import { Check } from 'lucide-react';

export function WizardStepper({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="flex items-center gap-8">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        return (
          <div key={label} className="flex items-center gap-8">
            <div className="flex items-center gap-8">
              <div
                className={cn(
                  'flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  isDone && 'bg-success text-white',
                  isActive && 'bg-primary text-white',
                  !isDone && !isActive && 'bg-bg text-text-muted border border-border'
                )}
              >
                {isDone ? <Check className="h-12 w-12" /> : stepNum}
              </div>
              <span className={cn('text-sm font-medium', isActive ? 'text-text' : 'text-text-muted')}>{label}</span>
            </div>
            {i < steps.length - 1 && <div className="h-px w-32 bg-border" />}
          </div>
        );
      })}
    </div>
  );
}
