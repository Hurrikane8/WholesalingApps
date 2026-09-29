/** Rendered Markdown (situations, guides, legal pages), set at 18px within the 68ch measure. */
export function Prose({ html, className = "" }: { html: string; className?: string }) {
  return <div className={`prose prose-lg measure text-ink ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
