import { promiseItems, type VerifiedFlag } from "@/lib/claims";
import { TextLink } from "@/components/ui/TextLink";
import { Unconfirmed } from "@/components/preview";

/**
 * Kane's commitments (spec 5.10): the verified promise items, each a short
 * statement with a one-line explanation. Not numbered (they aren't a
 * sequence) and no icons. Renders nothing if none are confirmed.
 */
export function Commitments({
  links = {},
  headingLevel = 3,
  className = "",
}: {
  /** Optional "read more" link per item, e.g. { explainsOfferMath: { href, label } }. */
  links?: Partial<Record<VerifiedFlag, { href: string; label: string }>>;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}) {
  const items = promiseItems();
  if (items.length === 0) return null;
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <ul className={`divide-y divide-mist border-y border-mist ${className}`}>
      {items.map((item) => {
        const link = links[item.flag];
        return (
          <li key={item.flag} className="py-4 sm:py-5">
            <Heading className="type-h3 text-ink">
              {item.title}
              <Unconfirmed show={item.unconfirmed} />
            </Heading>
            <p className="measure mt-2 text-ink-2">
              {item.sentence}
              {link && (
                <>
                  {" "}
                  <TextLink href={link.href} className="font-semibold">
                    {link.label}
                  </TextLink>
                </>
              )}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
