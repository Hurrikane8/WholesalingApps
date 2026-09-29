import { notFound } from "next/navigation";
import { founderDisplayName } from "@/lib/claims";
import { getPost, getPosts, renderMarkdown } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { articleSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { Prose } from "@/components/Prose";
import { PageIntro, PostList, Section, SidebarOffer } from "@/components/sections";
import { DraftBanner } from "@/components/preview";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.date,
    modifiedTime: post.updated ?? post.date,
    image: { path: `/blog/${post.slug}/opengraph-image`, alt: post.title },
    noindex: post.draft,
  });
}

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export default async function PostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) notFound();

  const path = `/blog/${post.slug}`;
  const { html, headings } = renderMarkdown(post.body);
  const related = getPosts().filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <DraftBanner draft={post.draft} />
      <JsonLd
        data={articleSchema({
          title: post.title,
          description: post.description,
          path,
          datePublished: post.date,
          dateModified: post.updated,
          author: post.author,
          image: `${path}/opengraph-image`,
        })}
      />
      <PageIntro
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Guides", path: "/blog" },
          { name: post.title, path },
        ]}
        title={post.title}
        lead={post.description}
      >
        <p className="type-small mt-5 text-ink-2">
          By {post.author ?? founderDisplayName()}.{" "}
          {post.updated ? (
            <>
              Updated <time dateTime={post.updated}>{formatDate(post.updated)}</time>.
            </>
          ) : (
            <>
              Published <time dateTime={post.date}>{formatDate(post.date)}</time>.
            </>
          )}{" "}
          A {post.readingMinutes}-minute read.
        </p>
      </PageIntro>
      <div className="border-t border-mist bg-snow">
        <div className="page-wrap grid gap-12 py-12 lg:grid-cols-12 lg:py-16">
          <article className="min-w-0 lg:col-span-7">
            {headings.length > 2 && (
              <nav aria-label="In this guide" className="mb-10 border-l-4 border-mist pl-5">
                <h2 className="type-h3">In this guide</h2>
                <ul className="mt-2">
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="link inline-flex min-h-11 items-center">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            <Prose html={html} />
          </article>
          <div className="lg:col-span-4 lg:col-start-9">
            <SidebarOffer />
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <Section labelledBy="related-heading" className="border-t border-mist">
          <h2 id="related-heading" className="type-h2">
            Keep reading
          </h2>
          <div className="measure mt-6">
            <PostList posts={related} />
          </div>
        </Section>
      )}
    </>
  );
}
