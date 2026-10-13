import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react";

export type IconProps = Omit<HugeiconsIconProps, "strokeWidth"> & {
  strokeWidth?: number;
};

/**
 * A single app-level icon wrapper. Bakes in HugeIcons (Stroke Rounded) with a
 * consistent stroke weight and inherits `currentColor` so icons track text.
 */
export function Icon({ size = 16, strokeWidth = 1.6, ...props }: IconProps) {
  return <HugeiconsIcon size={size} strokeWidth={strokeWidth} color="currentColor" {...props} />;
}
