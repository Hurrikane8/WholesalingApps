import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * Buttons (spec 3.4): 52px tall (44px compact, for the header), sentence
 * case, never an arrow after the text. Primary is pine with an inset white
 * rule; secondary is outlined in ink; "night" is snow on the night section.
 */
export type ButtonVariant = "primary" | "secondary" | "night";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "button-primary",
  secondary: "button-secondary",
  night: "button-night",
};

export function buttonClass(variant: ButtonVariant = "primary", { compact = false, className = "" } = {}): string {
  return ["button", VARIANTS[variant], compact ? "button-compact" : "", className].filter(Boolean).join(" ");
}

type Common = { variant?: ButtonVariant; compact?: boolean; className?: string; children: ReactNode };

/** A link that looks like a button. Internal paths use next/link; tel:, sms: and other URLs a plain <a>. */
export function ButtonLink({
  href,
  variant,
  compact,
  className,
  children,
  ...rest
}: Common & { href: string } & Omit<ComponentProps<"a">, "href" | "className" | "children">) {
  const cls = buttonClass(variant, { compact, className });
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={cls} {...rest}>
      {children}
    </a>
  );
}

export function Button({ variant, compact, className, children, type = "button", ...rest }: Common & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button type={type} className={buttonClass(variant, { compact, className })} {...rest}>
      {children}
    </button>
  );
}
