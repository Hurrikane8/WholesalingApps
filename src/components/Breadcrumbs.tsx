import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, type Crumb } from "@/lib/schema";

/** Visible breadcrumbs plus matching BreadcrumbList structured data. Pass the full trail, starting with Home. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema(items)} />
      <nav aria-label="Breadcrumb" className="type-small">
        <ol className="flex flex-wrap items-center gap-x-1.5">
          {items.map((item, i) => {
            const last = i === items.length - 1;
            return (
              <li key={item.path} className="flex min-h-11 items-center gap-1.5">
                {last ? (
                  <span aria-current="page" className="text-ink-2">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.path} className="link inline-flex min-h-11 min-w-11 items-center">
                      {item.name}
                    </Link>
                    <ChevronRight className="size-4 text-ink-2" aria-hidden="true" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
