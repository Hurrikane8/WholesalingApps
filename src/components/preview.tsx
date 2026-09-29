import { isUnconfirmed, type VerifiedFlag } from "@/lib/claims";

/**
 * Preview-only markers (spec 2.5). Both are server components: they read the
 * deploy environment, and production never renders them.
 */

/** A small dashed "Unconfirmed" tag after a claim Kane hasn't confirmed yet. */
export function Unconfirmed({ flag, show }: { flag?: VerifiedFlag; show?: boolean }) {
  const visible = show ?? (flag ? isUnconfirmed(flag) : false);
  if (!visible) return null;
  return (
    <span className="tag-unconfirmed" data-unconfirmed="">
      Unconfirmed
    </span>
  );
}

/** Banner at the top of a draft page or post. Drafts only render outside production. */
export function DraftBanner({ draft }: { draft: boolean }) {
  if (!draft) return null;
  return (
    <div data-draft="" className="border-b border-dashed border-signal bg-[#fff8e6] px-4 py-2 text-center text-sm font-semibold text-signal">
      Draft: not published. It shows only in preview builds and stays out of the sitemap.
    </div>
  );
}
