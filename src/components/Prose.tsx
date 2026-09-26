/** Styled container for rendered Markdown (blog posts and situation pages). */
export function Prose({ html }: { html: string }) {
  return (
    <div
      className="prose prose-slate max-w-none sm:prose-lg prose-headings:tracking-tight prose-headings:text-slate-900 prose-h2:mt-12 prose-h2:text-2xl sm:prose-h2:text-3xl prose-a:font-medium prose-a:text-brand-600 prose-a:underline-offset-2 hover:prose-a:text-brand-800 prose-li:my-1 prose-table:text-sm prose-th:bg-slate-50 prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-blockquote:border-accent-400 prose-blockquote:font-normal prose-blockquote:not-italic"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
