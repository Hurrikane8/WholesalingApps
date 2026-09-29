export type NavLink = { href: string; label: string };

/** Where every "Get my offer" button points. */
export const OFFER_PATH = "/get-cash-offer";

/* ─── v2 navigation (spec 5.2), used by src/components/chrome ───────────── */

/** Header, from 1024px up, and the top of the mobile menu. */
export const primaryNav: NavLink[] = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/what-we-buy", label: "What I buy" },
  { href: "/cash-offer-vs-realtor", label: "Cash vs. listing" },
  { href: "/about", label: "About" },
];

/** The mobile menu's second group. */
export const secondaryNav: NavLink[] = [
  { href: "/situations", label: "Situations" },
  { href: "/we-buy-houses", label: "Areas I buy in" },
  { href: "/blog", label: "Guides" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

/** Kept out of the seller's path: the bottom of the mobile menu and the footer. */
export const investorsNav: NavLink = { href: "/investors", label: "Investors: join the buyers list" };

/** Footer link groups. */
export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Selling",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/what-we-buy", label: "What I buy" },
      { href: "/cash-offer-vs-realtor", label: "Cash vs. listing" },
      { href: "/situations", label: "Situations" },
      { href: "/we-buy-houses", label: "Areas I buy in" },
      { href: "/blog", label: "Guides" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "About Kane" },
      { href: "/contact", label: "Contact" },
      { href: "/hello", label: "Got a letter from me?" },
      { href: "/investors", label: "Investors" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export const focusFooterNav: NavLink[] = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];
