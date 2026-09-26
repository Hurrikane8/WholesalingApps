import Link from "next/link";
import { OFFER_PATH } from "@/config/nav";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container-page max-w-2xl text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">We couldn&apos;t find that page</h1>
        <p className="mt-4 text-lg text-slate-600">The page may have moved. Here are some helpful places to start:</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={OFFER_PATH} className="btn-primary">
            Get a cash offer
          </Link>
          <Link href="/" className="btn-secondary">
            Home
          </Link>
          <Link href="/we-buy-houses" className="btn-secondary">
            Areas we serve
          </Link>
          <Link href="/faq" className="btn-secondary">
            FAQ
          </Link>
        </div>
      </div>
    </section>
  );
}
