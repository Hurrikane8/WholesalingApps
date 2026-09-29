import { notFound } from "next/navigation";
import Image from "next/image";
import { site } from "@/config/site";
import { founderDisplayName, offerMathClause } from "@/lib/claims";
import { getPost, getPosts, renderMarkdown } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { articleSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { Prose } from "@/components/Prose";
import { PageIntro, PostList, Section, SidebarOffer } from "@/components/sections";
import { DraftBanner } from "@/components/preview";
import { ButtonLink } from "@/components/ui/Button";
import { StraightAnswer } from "@/components/ui/StraightAnswer";

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
  // Related guides: the same category first, then the newest.
  const others = getPosts().filter((p) => p.slug !== post.slug);
  const related = [...others.filter((p) => p.category === post.category), ...others.filter((p) => p.category !== post.category)].slice(0, 3);
  // Phones get a call to action after the third section, just before the fourth H2.
  const [before, after] = splitAtHeading(html, 4);

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
          {!post.author && site.founder.photo && (
            <Image src={site.founder.photo} alt="" width={32} height={32} sizes="32px" className="mr-2 inline-block size-8 rounded-full object-cover align-middle" />
          )}
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
            {post.question && post.answer && (
              <StraightAnswer question={post.question} className="mb-10">
                <p>{post.answer}</p>
              </StraightAnswer>
            )}
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
            <Prose html={before} />
            {after && (
              <>
                {/* Desktop has the sticky form beside the article instead. */}
                <aside aria-label="Get an offer" className="measure my-10 border-l-4 border-pine bg-frost px-5 py-5 lg:hidden">
                  <p className="type-h3">Want the numbers for your place?</p>
                  <p className="mt-2 text-ink-2">
                    Tell me about it and I&apos;ll send a written offer{offerMathClause()}. No obligation.
                  </p>
                  <ButtonLink href="#offer" className="mt-4">
                    Get my offer
                  </ButtonLink>
                </aside>
                <Prose html={after} />
              </>
            )}
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

/** Splits rendered HTML just before its nth <h2>, so something can sit between sections. */
function splitAtHeading(html: string, n: number): [string, string] {
  let index = -1;
  for (let i = 0; i < n; i++) {
    index = html.indexOf("<h2", index + 1);
    if (index === -1) return [html, ""];
  }
  return [html.slice(0, index), html.slice(index)];
}
