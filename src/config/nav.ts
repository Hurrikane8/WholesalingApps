export type NavLink = { href: string; label: string };

/** Primary header navigation. */
export const mainNav: NavLink[] = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/situations", label: "Situations" },
  { href: "/we-buy-houses", label: "Areas We Serve" },
  { href: "/cash-offer-vs-realtor", label: "Cash vs. Listing" },
  { href: "/blog", label: "Seller Guides" },
];

/** Extra links shown only in the mobile menu, where there's room. */
export const mobileExtraNav: NavLink[] = [
  { href: "/about", label: "About Us" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export const companyNav: NavLink[] = [
  { href: "/about", label: "About Us" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/cash-offer-vs-realtor", label: "Cash Offer vs. Realtor" },
  { href: "/faq", label: "FAQ" },
  { href: "/blog", label: "Seller Guides" },
  { href: "/contact", label: "Contact" },
];

export const legalNav: NavLink[] = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
];

/** Where every "Get my offer" button points. */
export const OFFER_PATH = "/get-cash-offer";
