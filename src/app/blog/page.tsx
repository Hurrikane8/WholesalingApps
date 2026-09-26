import { site } from "@/config/site";
import { getPosts } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { CtaBand, PageHeader, PostCard } from "@/components/sections";

export const metadata = pageMetadata({
  title: "Seller Guides: Selling a House Fast, As-Is or for Cash",
  description: `Plain-English guides for ${site.market.region} homeowners: cash offers vs. listing, selling an inherited house, avoiding foreclosure, selling as-is and more.`,
  path: "/blog",
});

export default function BlogIndex() {
  const posts = getPosts();
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Seller Guides", path: "/blog" },
        ]}
        eyebrow="Seller guides"
        title="Straight Answers for Homeowners Thinking About Selling"
        subtitle="Honest, practical guides on your options, whether you end up selling to us, listing with an agent or staying put."
      />
      <section className="section">
        <div className="container-page">
          <h2 className="sr-only">All seller guides</h2>
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <li key={p.slug}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
