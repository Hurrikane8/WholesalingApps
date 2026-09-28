import {
  Armchair,
  Building2,
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
  Building2,
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
