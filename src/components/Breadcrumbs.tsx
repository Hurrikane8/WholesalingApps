import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, type Crumb } from "@/lib/schema";

/** Visible breadcrumbs plus matching BreadcrumbList structured data. Pass the full trail, starting with Home. */
export function Breadcrumbs({ items, tone = "light" }: { items: Crumb[]; tone?: "light" | "dark" }) {
  const muted = tone === "dark" ? "text-brand-200 hover:text-white" : "text-slate-500 hover:text-brand-700";
  const current = tone === "dark" ? "text-white" : "text-slate-800";
  return (
    <>
      <JsonLd data={breadcrumbSchema(items)} />
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex flex-wrap items-center gap-1">
          {items.map((item, i) => {
            const last = i === items.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-1">
                {last ? (
                  <span aria-current="page" className={current}>
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.path} className={muted}>
                      {item.name}
                    </Link>
                    <ChevronRight className={`size-3.5 ${tone === "dark" ? "text-brand-300" : "text-slate-400"}`} aria-hidden="true" />
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
