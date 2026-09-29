import { site } from "@/config/site";

/**
 * Kane's optional 60–90 second intro (spec 3.8): self-hosted MP4 with a
 * poster and captions, never preloaded and never autoplayed. Renders nothing
 * until site.founder.video.src is set.
 */
export function FounderVideo({ className = "" }: { className?: string }) {
  const { src, poster, captions } = site.founder.video;
  if (!src) return null;
  return (
    <video controls preload="none" playsInline poster={poster || undefined} className={`w-full max-w-2xl rounded-photo bg-night ${className}`}>
      <source src={src} type="video/mp4" />
      {captions && <track kind="captions" src={captions} srcLang="en" label="English" default />}
    </video>
  );
}
