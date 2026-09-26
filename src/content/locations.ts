/**
 * Service areas. Each entry becomes a landing page at /we-buy-houses/{slug}
 * targeting searches like "we buy houses {city}" and "sell my house fast {city}".
 *
 * To rank (and to avoid Google treating these as thin "doorway" pages), every
 * city needs its own genuinely local `intro` and `localDetails`. Write about
 * what you actually see in that market: housing stock, the situations sellers
 * there tend to face, deals you have closed nearby. Don't clone paragraphs
 * between cities.
 *
 * REPLACE: the entries below are examples for Metro Atlanta. Swap them for the
 * cities and counties you actually buy in.
 */

export type Location = {
  /** URL slug: "{city}-{state}", lowercase, hyphenated. */
  slug: string;
  city: string;
  stateAbbr: string;
  county: string;
  /** One unique paragraph about selling a house in this city. */
  intro: string;
  /** Local knowledge: property types, common seller situations, areas you cover. */
  localDetails: string[];
  /** Slugs of other locations to cross-link as "nearby areas". */
  nearby: string[];
  /** Approximate city center for schema. Optional. */
  geo?: { latitude: number; longitude: number };
};

export const locations: Location[] = [
  {
    slug: "atlanta-ga",
    city: "Atlanta",
    stateAbbr: "GA",
    county: "Fulton",
    intro:
      "Atlanta's housing stock runs from 1920s bungalows and brick ranches to newer townhomes, and a lot of those older homes carry deferred maintenance that makes a traditional sale slow and expensive. We buy Atlanta houses as-is, so you can skip the repairs, the showings and the months of waiting for a financed buyer.",
    localDetails: [
      "We buy in every part of the city, inside and outside the Perimeter, in both Fulton and DeKalb County.",
      "Older homes with foundation, roof, plumbing or electrical issues are a normal purchase for us. You don't need to fix anything first.",
      "Rental properties with tenants in place are fine. We can buy with the lease in place so you don't have to deal with a move-out.",
    ],
    nearby: ["decatur-ga", "east-point-ga", "sandy-springs-ga", "smyrna-ga"],
    geo: { latitude: 33.749, longitude: -84.388 },
  },
  {
    slug: "marietta-ga",
    city: "Marietta",
    stateAbbr: "GA",
    county: "Cobb",
    intro:
      "As the Cobb County seat, Marietta has a deep inventory of 1960s–1980s split-levels and ranches that are now due for roofs, HVAC systems and kitchens. If your Marietta house needs more work than you want to take on, we'll make a cash offer on it exactly as it sits.",
    localDetails: [
      "We buy throughout Marietta and the surrounding parts of Cobb County.",
      "Inherited homes and houses going through probate in Cobb County are a big part of what we do. We work alongside your probate attorney.",
      "Condos, townhomes and single-family homes are all welcome.",
    ],
    nearby: ["smyrna-ga", "kennesaw-ga", "roswell-ga", "atlanta-ga"],
    geo: { latitude: 33.9526, longitude: -84.5499 },
  },
  {
    slug: "decatur-ga",
    city: "Decatur",
    stateAbbr: "GA",
    county: "DeKalb",
    intro:
      "Decatur is the DeKalb County seat, and demand there is strong. Older homes that need updating can still sit on the market while buyers wait for move-in-ready listings. We give Decatur homeowners a simple alternative: a fair cash price, no repairs and a closing date you pick.",
    localDetails: [
      "We buy in Decatur and across unincorporated DeKalb County.",
      "Dated homes, houses with deferred maintenance, and properties with title or lien issues are all situations we can work through.",
      "We're used to working around long-time owners downsizing after decades in the same house. You set the pace.",
    ],
    nearby: ["atlanta-ga", "stone-mountain-ga", "east-point-ga"],
    geo: { latitude: 33.7748, longitude: -84.2963 },
  },
  {
    slug: "sandy-springs-ga",
    city: "Sandy Springs",
    stateAbbr: "GA",
    county: "Fulton",
    intro:
      "Sandy Springs homeowners often call us when they're relocating for work, settling an estate or facing a house that needs a major renovation before it could sell at full retail price. We buy Sandy Springs houses for cash without listing, staging or open houses.",
    localDetails: [
      "We buy single-family homes, townhomes and condos throughout Sandy Springs.",
      "Relocating? We can close on your timeline, including after you've already moved.",
      "Larger homes that need significant updating are a good fit for us.",
    ],
    nearby: ["roswell-ga", "atlanta-ga", "alpharetta-ga", "marietta-ga"],
    geo: { latitude: 33.9304, longitude: -84.3733 },
  },
  {
    slug: "smyrna-ga",
    city: "Smyrna",
    stateAbbr: "GA",
    county: "Cobb",
    intro:
      "Smyrna sits between Atlanta and Marietta in Cobb County, and many of its older ranch homes are now changing hands. Whether yours is a rental you're done managing or a family home that needs work, we'll give you a no-obligation cash offer.",
    localDetails: [
      "We buy in Smyrna and the nearby parts of Cobb County.",
      "Tired landlords: we buy with tenants in place, including leases that are behind on rent.",
      "Homes with outdated systems, water damage or cosmetic issues are welcome as-is.",
    ],
    nearby: ["marietta-ga", "atlanta-ga", "kennesaw-ga"],
    geo: { latitude: 33.884, longitude: -84.5144 },
  },
  {
    slug: "roswell-ga",
    city: "Roswell",
    stateAbbr: "GA",
    county: "Fulton",
    intro:
      "In Roswell and the rest of North Fulton, we most often help homeowners who are downsizing, dividing an inherited property between siblings, or selling a house that needs more updating than they want to fund. A cash sale lets you move on without spending months on repairs.",
    localDetails: [
      "We buy throughout Roswell and North Fulton County.",
      "Estate sales and inherited homes: we can buy with belongings still inside.",
      "Older homes with dated interiors are a common purchase for us.",
    ],
    nearby: ["alpharetta-ga", "sandy-springs-ga", "marietta-ga"],
    geo: { latitude: 34.0232, longitude: -84.3616 },
  },
  {
    slug: "alpharetta-ga",
    city: "Alpharetta",
    stateAbbr: "GA",
    county: "Fulton",
    intro:
      "Alpharetta's market favors move-in-ready homes, which puts sellers of dated or damaged houses at a disadvantage when they list. We buy Alpharetta properties in any condition and handle the renovation after closing, so you don't have to.",
    localDetails: [
      "We buy in Alpharetta and the surrounding North Fulton communities.",
      "Job relocation or a quick move? Choose a closing date that fits your schedule.",
      "Houses that need roofs, HVAC, flooring or full renovations are welcome.",
    ],
    nearby: ["roswell-ga", "sandy-springs-ga", "lawrenceville-ga"],
    geo: { latitude: 34.0754, longitude: -84.2941 },
  },
  {
    slug: "lawrenceville-ga",
    city: "Lawrenceville",
    stateAbbr: "GA",
    county: "Gwinnett",
    intro:
      "Lawrenceville is the Gwinnett County seat and one of the busiest housing markets on the east side of Metro Atlanta. If you need to sell a Lawrenceville house quickly, whether you're behind on payments, going through a divorce or simply done with repairs, we can make you a cash offer within a day.",
    localDetails: [
      "We buy in Lawrenceville and throughout Gwinnett County.",
      "Behind on mortgage payments? Talking to us early leaves you more options.",
      "Split-level and ranch homes that need updating are a great fit.",
    ],
    nearby: ["alpharetta-ga", "stone-mountain-ga", "decatur-ga"],
    geo: { latitude: 33.9562, longitude: -83.988 },
  },
  {
    slug: "kennesaw-ga",
    city: "Kennesaw",
    stateAbbr: "GA",
    county: "Cobb",
    intro:
      "Kennesaw's neighborhoods are full of 1980s and 1990s homes whose original roofs, windows and systems are reaching the end of their life. If yours is one of them, we'll buy it as-is so you can sell without paying for the updates buyers expect.",
    localDetails: [
      "We buy in Kennesaw and across northwest Cobb County.",
      "Landlords with rentals near the university and throughout the area are welcome.",
      "We can close fast or wait until you're ready to move.",
    ],
    nearby: ["marietta-ga", "smyrna-ga", "roswell-ga"],
    geo: { latitude: 34.0234, longitude: -84.6155 },
  },
  {
    slug: "east-point-ga",
    city: "East Point",
    stateAbbr: "GA",
    county: "Fulton",
    intro:
      "East Point has a large stock of older brick homes and small multifamily properties, many owned by landlords or passed down within families. We buy East Point houses in any condition, including vacant homes, rentals and properties with code issues.",
    localDetails: [
      "We buy in East Point and the surrounding South Fulton communities.",
      "Vacant houses, code violations and back taxes: we can work through them at closing.",
      "Duplexes and small multifamily properties are welcome too.",
    ],
    nearby: ["atlanta-ga", "decatur-ga"],
    geo: { latitude: 33.6796, longitude: -84.4394 },
  },
  {
    slug: "stone-mountain-ga",
    city: "Stone Mountain",
    stateAbbr: "GA",
    county: "DeKalb",
    intro:
      "Around Stone Mountain and east DeKalb County, we often help owners of older homes that need more work than they can afford, and landlords ready to retire from managing rentals. A cash sale means no repairs, no commissions and no uncertainty about financing.",
    localDetails: [
      "We buy in Stone Mountain and throughout east DeKalb County.",
      "Rentals, inherited homes and houses with foundation or roof issues are welcome.",
      "House still full of furniture and belongings? Take what you want and leave the rest. We'll handle the clean-out.",
    ],
    nearby: ["decatur-ga", "lawrenceville-ga", "atlanta-ga"],
    geo: { latitude: 33.8081, longitude: -84.1702 },
  },
];

export function getLocation(slug: string): Location | undefined {
  return locations.find((l) => l.slug === slug);
}
