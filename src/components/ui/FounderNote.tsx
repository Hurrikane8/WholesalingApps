import Image from "next/image";
import type { ReactNode } from "react";
import { site } from "@/config/site";
import { Mark } from "@/components/brand/Mark";
import { TextLink } from "@/components/ui/TextLink";

/**
 * "Hi, I'm Kane." (spec 3.7): the photo if there is one, a short note and an
 * optional signature. Without a photo it sits beside the mark, and still
 * looks finished.
 */
export function FounderNote({
  children,
  link,
  headingLevel = 2,
  compact = false,
  className = "",
}: {
  children: ReactNode;
  link?: { href: string; label: string };
  headingLevel?: 2 | 3;
  compact?: boolean;
  className?: string;
}) {
  const { founder } = site;
  const Heading = `h${headingLevel}` as "h2" | "h3";
  return (
    <div className={`grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-8 ${className}`}>
      {founder.photo ? (
        <Image
          src={founder.photo}
          alt={founder.photoAlt || `${founder.firstName}, ${founder.role}`}
          width={compact ? 120 : 240}
          height={compact ? 150 : 300}
          sizes={compact ? "120px" : "(min-width: 640px) 240px, 100vw"}
          className={`rounded-photo object-cover ${compact ? "w-[120px]" : "w-full max-w-[240px]"}`}
        />
      ) : (
        <Mark className={compact ? "size-12 sm:size-14" : "size-12 sm:size-20"} />
      )}
      <div className="min-w-0">
        <Heading className={compact ? "type-h3 text-ink" : "type-h2 text-ink"}>Hi, I&apos;m {founder.firstName}.</Heading>
        <div className="measure mt-3 space-y-3 text-ink-2">{children}</div>
        {founder.signature && (
          // eslint-disable-next-line @next/next/no-img-element -- a small SVG signature; next/image adds nothing here.
          <img src={founder.signature} alt={`${founder.firstName}'s signature`} className="mt-4 h-10 w-auto" />
        )}
        {link && (
          <p className="type-small mt-3">
            <TextLink href={link.href} className="inline-flex min-h-11 items-center">
              {link.label}
            </TextLink>
          </p>
        )}
      </div>
    </div>
  );
}
