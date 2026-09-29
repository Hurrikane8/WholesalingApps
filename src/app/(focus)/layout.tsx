import { FocusShell } from "@/components/chrome/Shell";

/** Pages with one job (spec 5.2): no navigation to wander off into. */
export default function FocusLayout({ children }: LayoutProps<"/">) {
  return <FocusShell>{children}</FocusShell>;
}
