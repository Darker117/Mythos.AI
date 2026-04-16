import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

// ── NeumorphicCard ──
interface CardProps {
  children: ReactNode;
  className?: string;
  inset?: boolean;
  glass?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export function NeuCard({ children, className = "", inset, glass, clickable, onClick }: CardProps) {
  const base = glass
    ? "neu-glass rounded-2xl"
    : inset
      ? "bg-[var(--surface)] rounded-2xl neu-inset"
      : "bg-[var(--surface)] rounded-2xl neu-flat";

  const interactive = clickable
    ? "hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all duration-300 ease-out hover:shadow-[6px_6px_20px_rgba(0,0,0,0.5),-4px_-4px_16px_rgba(255,255,255,0.05)] active:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.4),inset_-2px_-2px_6px_rgba(255,255,255,0.03)]"
    : "";

  return (
    <div className={`${base} ${interactive} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

// ── NeumorphicButton ──
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  size?: "sm" | "md" | "lg" | "icon" | "iconSm" | "iconXs";
  children: ReactNode;
}

const sizeMap = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
  icon: "w-10 h-10 flex items-center justify-center",
  iconSm: "w-8 h-8 flex items-center justify-center",
  iconXs: "w-6 h-6 flex items-center justify-center",
};

export function NeuButton({ active, size = "md", children, className = "", ...rest }: BtnProps) {
  return (
    <button
      className={`
        rounded-xl font-medium cursor-pointer select-none
        transition-all duration-200 ease-out
        ${sizeMap[size]}
        ${active
          ? `bg-[var(--accent-muted)] text-[var(--accent)]
             border border-[rgba(var(--accent-rgb),0.2)]
             shadow-[0_0_12px_var(--accent-glow-color),inset_0_1px_0_rgba(255,255,255,0.05)]`
          : `bg-[var(--surface)] text-[var(--text-secondary)]
             border border-[var(--border)]
             shadow-[3px_3px_8px_rgba(0,0,0,0.4),-2px_-2px_6px_rgba(255,255,255,0.03),inset_0_1px_0_rgba(255,255,255,0.04)]
             hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] hover:border-[var(--border-glow)]
             hover:shadow-[4px_4px_12px_rgba(0,0,0,0.45),-3px_-3px_8px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.05)]
             active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.03)]
             active:translate-y-[0.5px]`}
        ${className}
      `}
      {...rest}
    >
      {children}
    </button>
  );
}

// ── NeumorphicInput ──
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function NeuInput({ label, className = "", ...rest }: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium mb-1.5 text-[var(--text-muted)] tracking-wide uppercase">
          {label}
        </label>
      )}
      <input
        className={`
          w-full rounded-xl px-4 py-2.5 text-sm outline-none
          bg-[var(--background)] text-[var(--text-primary)]
          border border-[var(--border)]
          shadow-[inset_2px_2px_6px_rgba(0,0,0,0.35),inset_-2px_-2px_6px_rgba(255,255,255,0.025)]
          focus:border-[rgba(var(--accent-rgb),0.4)]
          focus:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.35),inset_-2px_-2px_6px_rgba(255,255,255,0.025),0_0_0_1px_rgba(var(--accent-rgb),0.15),0_0_12px_rgba(var(--accent-rgb),0.08)]
          transition-all duration-300 placeholder:text-[var(--text-muted)]
          ${className}
        `}
        {...rest}
      />
    </div>
  );
}

// ── NeumorphicTextarea ──
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function NeuTextarea({ label, className = "", ...rest }: TextareaProps) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium mb-1.5 text-[var(--text-muted)] tracking-wide uppercase">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none
          bg-[var(--background)] text-[var(--text-primary)]
          border border-[var(--border)]
          shadow-[inset_2px_2px_6px_rgba(0,0,0,0.35),inset_-2px_-2px_6px_rgba(255,255,255,0.025)]
          focus:border-[rgba(var(--accent-rgb),0.4)]
          focus:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.35),inset_-2px_-2px_6px_rgba(255,255,255,0.025),0_0_0_1px_rgba(var(--accent-rgb),0.15),0_0_12px_rgba(var(--accent-rgb),0.08)]
          transition-all duration-300 placeholder:text-[var(--text-muted)]
          ${className}
        `}
        {...rest}
      />
    </div>
  );
}
