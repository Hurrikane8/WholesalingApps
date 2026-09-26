import {
  Armchair,
  DoorOpen,
  Flame,
  Gavel,
  Hammer,
  HeartHandshake,
  House,
  KeyRound,
  Landmark,
  Receipt,
  Truck,
  type LucideIcon,
} from "lucide-react";

/** Icons available to situation pages via the `icon` frontmatter field. */
export const SITUATION_ICONS: Record<string, LucideIcon> = {
  Armchair,
  DoorOpen,
  Flame,
  Gavel,
  Hammer,
  HeartHandshake,
  House,
  KeyRound,
  Landmark,
  Receipt,
  Truck,
};

export function situationIcon(name: string): LucideIcon {
  return SITUATION_ICONS[name] ?? House;
}

/** The brand mark: a simple house with a check. Mirrors src/app/icon.svg. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="8" fill="#15365a" />
      <path d="M16 6.5 5.5 15.2V26h21V15.2L16 6.5Z" fill="#fbbf24" />
      <path d="m11.5 18.2 3.2 3.2 6-6.4" fill="none" stroke="#15365a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
