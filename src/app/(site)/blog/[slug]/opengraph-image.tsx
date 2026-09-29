import { getPost, getPosts } from "@/lib/content";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "A guide to selling your home";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  return renderOgImage({ title: post?.title ?? "Straight answers on selling your home" });
}
