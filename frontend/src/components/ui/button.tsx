import * as React from 'react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
type Size = 'sm' | 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-white shadow-tinted hover:bg-primary-hover hover:shadow-tinted-lg',
  secondary: 'bg-surface border border-border text-text hover:bg-primary-light hover:border-primary/30',
  ghost: 'bg-transparent text-text hover:bg-primary-light',
  danger: 'bg-danger text-white hover:opacity-90',
  accent: 'bg-accent text-white shadow-tinted hover:opacity-90',
};

// Explicit bracket values, not bare scale numbers — this project's custom Tailwind spacing
// scale (4/8/12/16/24/32/48/64 == literal px) reinterprets any DEFAULT-Tailwind-style size class
// using those exact numbers, so e.g. h-8 here would render as a literal 8px bar, not the
// intended ~32px button. Confirmed live: this exact bug made every size="sm" button in the app
// render as an unusable sliver.
const sizeClasses: Record<Size, string> = {
  sm: 'h-[32px] px-[12px] text-xs',
  md: 'h-[40px] px-[16px] text-sm',
  lg: 'h-[48px] px-[24px] text-base',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';
