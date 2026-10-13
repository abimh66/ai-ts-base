import { cn } from "cn";

/**
 * The product name, in one place so it is trivial to change — `init:project`
 * rewrites this string when the template becomes a real project. Keep it as a
 * single literal: splitting it across JSX elements would hide it from that
 * rewrite.
 */
export const APP_NAME = "ai-ts-base";

/**
 * The template's placeholder glyph: stacked rounded bars suggesting a stack of
 * records. Replace it with a real mark when a project gets one. The brand
 * gradient is reserved for the logo.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-7", className)}>
      <title>{APP_NAME}</title>
      <defs>
        <linearGradient
          id="app-brand-gradient"
          x1="4"
          y1="36"
          x2="36"
          y2="4"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F04E0A" />
          <stop offset="0.5" stopColor="#FF7A00" />
          <stop offset="1" stopColor="#FFB020" />
        </linearGradient>
      </defs>
      <g fill="url(#app-brand-gradient)">
        <rect x="5" y="7" width="30" height="8.5" rx="4.25" />
        <rect x="5" y="19" width="21" height="8.5" rx="4.25" opacity="0.75" />
        <rect x="5" y="31" width="12" height="4" rx="2" opacity="0.5" />
      </g>
    </svg>
  );
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("text-[15px] font-semibold tracking-[-0.02em] text-foreground", className)}>
      {APP_NAME}
    </span>
  );
}

export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <BrandMark />
      <BrandWordmark />
    </span>
  );
}
