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
      ? "bg-[#212121] rounded-2xl neu-inset"
      : "bg-[#212121] rounded-2xl neu-flat";
  const hover = clickable ? "hover:-translate-y-0.5 hover:shadow-lg cursor-pointer transition-transform" : "";
  return (
    <div className={`${base} ${hover} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

// ── NeumorphicButton ──
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  size?: "sm" | "md" | "lg" | "icon";
  children: ReactNode;
}

const sizeMap = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
  icon: "w-10 h-10 flex items-center justify-center",
};

export function NeuButton({ active, size = "md", children, className = "", ...rest }: BtnProps) {
  return (
    <button
      className={`
        rounded-xl font-medium transition-all cursor-pointer
        ${sizeMap[size]}
        ${active
          ? "bg-white/10 border border-white/10 text-[var(--accent)]"
          : "bg-[#212121] border border-white/5 text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]"}
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
        <label className="block text-xs font-medium mb-1.5 text-[var(--text-muted)]">
          {label}
        </label>
      )}
      <input
        className={`
          w-full rounded-xl px-4 py-2.5 text-sm outline-none
          bg-[#1a1a1a] text-[var(--text-primary)]
          border border-white/5
          shadow-[inset_3px_3px_6px_#111111,inset_-3px_-3px_6px_#2a2a2a]
          focus:border-[var(--accent)] focus:shadow-[inset_3px_3px_6px_#111111,inset_-3px_-3px_6px_#2a2a2a,0_0_0_1px_var(--accent)]
          transition-all placeholder:text-[var(--text-muted)]
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
        <label className="block text-xs font-medium mb-1.5 text-[var(--text-muted)]">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none
          bg-[#1a1a1a] text-[var(--text-primary)]
          border border-white/5
          shadow-[inset_3px_3px_6px_#111111,inset_-3px_-3px_6px_#2a2a2a]
          focus:border-[var(--accent)] focus:shadow-[inset_3px_3px_6px_#111111,inset_-3px_-3px_6px_#2a2a2a,0_0_0_1px_var(--accent)]
          transition-all placeholder:text-[var(--text-muted)]
          ${className}
        `}
        {...rest}
      />
    </div>
  );
}
