import { Prose } from "@/components/Prose";
import { PageIntro } from "@/components/sections";

export function LegalPage({ title, path, updated, html }: { title: string; path: string; updated: unknown; html: string }) {
  const date = updated instanceof Date ? updated : new Date(String(updated));
  const label = Number.isNaN(date.getTime())
    ? undefined
    : date.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: title, path },
        ]}
        title={title}
        lead={label ? `Last updated ${label}` : undefined}
      />
      <div className="page-wrap border-t border-mist pt-12 pb-16 lg:pb-24">
        <Prose html={html} />
      </div>
    </>
  );
}
