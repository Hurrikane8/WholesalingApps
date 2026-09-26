import { Prose } from "@/components/Prose";
import { PageHeader } from "@/components/sections";

export function LegalPage({ title, path, updated, html }: { title: string; path: string; updated: unknown; html: string }) {
  const date = updated instanceof Date ? updated : new Date(String(updated));
  const label = Number.isNaN(date.getTime())
    ? undefined
    : date.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: title, path },
        ]}
        title={title}
        subtitle={label ? `Last updated ${label}` : undefined}
      />
      <section className="section">
        <div className="container-page max-w-3xl">
          <Prose html={html} />
        </div>
      </section>
    </>
  );
}
