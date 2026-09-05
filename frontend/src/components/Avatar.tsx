import { User } from 'lucide-react';
import { cn } from '../lib/utils';

const AVATAR_GRADIENTS = [
  'from-primary to-indigo-400',
  'from-accent to-emerald-400',
  'from-warning to-amber-400',
  'from-info to-sky-400',
  'from-danger to-rose-400',
];

export function gradientFor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

const SIZES = {
  sm: { box: 'h-32 w-32', icon: 'h-16 w-16' },
  md: { box: 'h-[40px] w-[40px]', icon: 'h-[20px] w-[20px]' },
  lg: { box: 'h-[56px] w-[56px]', icon: 'h-[28px] w-[28px]' },
};

const TEXT_SIZES = { sm: 'text-xs', md: 'text-sm', lg: 'text-lg' };

export function Avatar({ seed, size = 'md', initials, className }: { seed: string; size?: keyof typeof SIZES; initials?: string; className?: string }) {
  const { box, icon } = SIZES[size];
  return (
    <div className={cn('flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br shadow-tinted', box, gradientFor(seed), className)}>
      {initials ? (
        <span className={cn('font-semibold text-white', TEXT_SIZES[size])}>{initials}</span>
      ) : (
        <User className={cn(icon, 'text-white')} strokeWidth={2} />
      )}
    </div>
  );
}
