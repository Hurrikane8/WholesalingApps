import { notFound } from "next/navigation";
import { getPost, getPosts, renderMarkdown } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { articleSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { Prose } from "@/components/Prose";
import { CtaBand, PageHeader, PostCards, SidebarOffer } from "@/components/sections";

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
      <PageHeader
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Seller Guides", path: "/blog" },
          { name: post.title, path },
        ]}
        eyebrow={post.category}
        title={post.title}
        subtitle={post.description}
      />
      <section className="section">
        <div className="container-page grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article>
            <p className="text-sm text-slate-500">
              {post.author ? `By ${post.author} · ` : ""}
              {post.updated ? (
                <>
                  Updated <time dateTime={post.updated}>{formatDate(post.updated)}</time>
                </>
              ) : (
                <>
                  Published <time dateTime={post.date}>{formatDate(post.date)}</time>
                </>
              )}{" "}
              · {post.readingMinutes} min read
            </p>
            {headings.length > 2 && (
              <nav aria-label="In this guide" className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="font-semibold text-slate-900">In this guide</p>
                <ul className="mt-3 space-y-1.5 text-slate-700">
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="hover:text-brand-700 hover:underline">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            <div className="mt-8">
              <Prose html={html} />
            </div>
          </article>
          <div className="lg:self-start">
            <SidebarOffer />
          </div>
        </div>
      </section>
      <CtaBand />
      <PostCards posts={related} title="Keep reading" />
    </>
  );
}
