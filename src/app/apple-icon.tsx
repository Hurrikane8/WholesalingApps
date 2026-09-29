import { markPng } from "@/lib/brand-image";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the mark on snow. */
export default function AppleIcon() {
  return markPng(180);
}
