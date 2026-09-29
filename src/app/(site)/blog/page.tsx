import { site } from "@/config/site";
import { getPosts, type Post } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { CtaBand, PageIntro, PostList } from "@/components/sections";

export const metadata = pageMetadata({
  title: "Guides to selling a house as-is, for cash or with an agent",
  description: `Plain-English guides for ${site.market.region} homeowners: cash offers vs. listing, selling an inherited house, avoiding foreclosure, selling as-is and more.`,
  path: "/blog",
});

/** Posts grouped by category, in the order each category first appears (newest first). */
function byCategory(posts: Post[]): [string, Post[]][] {
  const groups = new Map<string, Post[]>();
  for (const post of posts) groups.set(post.category, [...(groups.get(post.category) ?? []), post]);
  return [...groups.entries()];
}

export default function BlogIndex() {
  const groups = byCategory(getPosts());
  return (
    <>
      <PageIntro
        surface="frost"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Guides", path: "/blog" },
        ]}
        title="Straight answers on selling your home"
        lead="Practical guides on your options, whether you end up selling to me, listing with an agent or staying put."
      />
      <div className="border-t border-mist bg-frost">
        <div className="page-wrap space-y-12 py-12 lg:py-16">
          {groups.map(([category, posts]) => (
            <section key={category} aria-labelledby={`cat-${slugify(category)}`} className="grid gap-y-4 lg:grid-cols-12 lg:gap-x-12">
              <h2 id={`cat-${slugify(category)}`} className="type-h3 lg:col-span-3">
                {category}
              </h2>
              <div className="measure lg:col-span-8">
                <PostList posts={posts} />
              </div>
            </section>
          ))}
        </div>
      </div>
      <CtaBand />
    </>
  );
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
