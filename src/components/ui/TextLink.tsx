import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/** Links (spec 3.4): ink with a 1px underline offset 3px; pine on hover. No arrows. */
export function TextLink({
  href,
  tone = "ink",
  className = "",
  children,
  ...rest
}: { href: string; tone?: "ink" | "night"; className?: string; children: ReactNode } & Omit<ComponentProps<"a">, "href" | "className" | "children">) {
  const cls = `${tone === "night" ? "link-night" : "link"} ${className}`.trim();
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
