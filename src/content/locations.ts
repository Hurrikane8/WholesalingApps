/**
 * Service areas. Each entry becomes a landing page at /we-buy-houses/{slug}
 * targeting searches like "we buy houses {city}" and "sell my house fast {city}".
 *
 * To rank (and to avoid Google treating these as thin "doorway" pages), every
 * city needs its own genuinely local `intro` and `localDetails`. Write about
 * what you actually see in that market: housing stock, the situations sellers
 * there face, deals you have done nearby. Don't clone paragraphs between cities.
 *
 * These match the Target Areas in the Airtable Buyers table. Remove any
 * community you don't want to buy in, and add new ones as you expand.
 */

export type Location = {
  /** URL slug: "{city}-{province}", lowercase, hyphenated. */
  slug: string;
  city: string;
  provinceAbbr: string;
  /** Surrounding municipality or area, e.g. "Strathcona County". Optional. */
  region?: string;
  /** One unique paragraph about selling a house in this community. */
  intro: string;
  /** Local knowledge: property types, common seller situations, areas you cover. */
  localDetails: string[];
  /** Slugs of other locations to cross-link as "nearby areas". */
  nearby: string[];
  /** Approximate centre for schema. Optional. */
  geo?: { latitude: number; longitude: number };
};

export const locations: Location[] = [
  {
    slug: "edmonton-ab",
    city: "Edmonton",
    provinceAbbr: "AB",
    intro:
      "Edmonton has one of the most varied housing markets in Canada, from 1950s bungalows in mature neighbourhoods to the condo townhouse complexes built across Mill Woods, Clareview and Castle Downs in the 1970s and '80s. Many of those homes are now due for big-ticket work, and many condo complexes are facing rising fees and special assessments. We buy Edmonton homes as-is, so you can skip the repairs, the showings and the wait.",
    localDetails: [
      "We buy on both sides of the river, in every quadrant: north, south, east, west and central Edmonton.",
      "Condo townhouses are a specialty. High condo fees, special assessments or a complex with a thin reserve fund don't scare us off.",
      "Older homes with original Poly-B plumbing, knob-and-tube wiring, vermiculite insulation or foundation cracks are a normal purchase for us.",
      "Tenants in place? We can buy with the lease in place so you don't have to manage a move-out.",
    ],
    nearby: ["st-albert-ab", "sherwood-park-ab", "spruce-grove-ab", "leduc-ab", "beaumont-ab", "fort-saskatchewan-ab"],
    geo: { latitude: 53.5461, longitude: -113.4938 },
  },
  {
    slug: "st-albert-ab",
    city: "St. Albert",
    provinceAbbr: "AB",
    region: "Sturgeon County",
    intro:
      "St. Albert's older neighbourhoods were built out in the 1960s through the '80s, and plenty of those split-levels and bungalows are now on their original windows, furnaces and shingles. If your St. Albert home needs more work than you want to take on before listing, we'll make you a cash offer on it exactly as it sits.",
    localDetails: [
      "We buy single-family homes, half duplexes and condo townhouses throughout St. Albert.",
      "Downsizing after decades in the same house? We can close on your timeline and you can leave behind what you don't need.",
      "Inherited homes and estates are welcome. We work alongside your lawyer and the personal representative.",
    ],
    nearby: ["edmonton-ab", "spruce-grove-ab", "fort-saskatchewan-ab"],
    geo: { latitude: 53.6305, longitude: -113.6256 },
  },
  {
    slug: "sherwood-park-ab",
    city: "Sherwood Park",
    provinceAbbr: "AB",
    region: "Strathcona County",
    intro:
      "Sherwood Park sits just east of Edmonton in Strathcona County, and its earliest neighbourhoods date back to the 1950s and '60s. Sellers there often call us about dated family homes, rentals they're tired of managing, or condo townhouses where the fees keep climbing.",
    localDetails: [
      "We buy in Sherwood Park and the surrounding parts of Strathcona County.",
      "Condo townhouses with special assessments or large upcoming repairs are welcome.",
      "Relocating for work? Close before you leave or after you've moved. You pick the date.",
    ],
    nearby: ["edmonton-ab", "fort-saskatchewan-ab", "beaumont-ab"],
    geo: { latitude: 53.5412, longitude: -113.2957 },
  },
  {
    slug: "spruce-grove-ab",
    city: "Spruce Grove",
    provinceAbbr: "AB",
    region: "Parkland County",
    intro:
      "Spruce Grove has grown quickly along Highway 16 west of Edmonton, and that means a mix of newer builds and older homes that are starting to show their age. Whether you're behind on payments, moving for work, or just done with repairs, we can give you a firm cash number within a day or two.",
    localDetails: [
      "We buy throughout Spruce Grove and nearby Parkland County.",
      "Half duplexes, townhouses and single-family homes are all a fit.",
      "Houses that need roofing, flooring, basement or mechanical work are welcome as-is.",
    ],
    nearby: ["stony-plain-ab", "st-albert-ab", "edmonton-ab"],
    geo: { latitude: 53.545, longitude: -113.9008 },
  },
  {
    slug: "stony-plain-ab",
    city: "Stony Plain",
    provinceAbbr: "AB",
    region: "Parkland County",
    intro:
      "Stony Plain is one of the older communities west of Edmonton, with established streets of bungalows and split-levels alongside newer subdivisions. We buy Stony Plain houses in any condition, including rentals, estates and homes that have sat empty.",
    localDetails: [
      "We buy in Stony Plain and the surrounding Parkland County area.",
      "Vacant houses are a common purchase. We can move quickly before winter freeze-ups become a risk.",
      "Estate and inherited properties are welcome, contents and all.",
    ],
    nearby: ["spruce-grove-ab", "edmonton-ab"],
    geo: { latitude: 53.5264, longitude: -114.0068 },
  },
  {
    slug: "leduc-ab",
    city: "Leduc",
    provinceAbbr: "AB",
    region: "Leduc County",
    intro:
      "Leduc sits south of Edmonton near the international airport, and a lot of its housing is tied to the energy and airport jobs nearby. When work changes, homeowners sometimes need to sell quickly. We buy Leduc houses for cash, as-is, on the closing date you choose.",
    localDetails: [
      "We buy in Leduc and the surrounding Leduc County area.",
      "Job change or relocation? We can close fast, or wait until you're ready to move.",
      "Rentals with tenants in place and homes that need updating are both welcome.",
    ],
    nearby: ["beaumont-ab", "edmonton-ab"],
    geo: { latitude: 53.2594, longitude: -113.5492 },
  },
  {
    slug: "beaumont-ab",
    city: "Beaumont",
    provinceAbbr: "AB",
    region: "Leduc County",
    intro:
      "Beaumont is a growing community just southeast of Edmonton, with a mix of established homes near the old town centre and newer neighbourhoods on the edges. If you need to sell a Beaumont home without listing, whether because of a separation, a move or a house that needs work, we can help.",
    localDetails: [
      "We buy throughout Beaumont and nearby areas south of Edmonton.",
      "Going through a separation? A single, clear cash offer can simplify dividing the home.",
      "Single-family homes, half duplexes and townhouses are all welcome.",
    ],
    nearby: ["leduc-ab", "edmonton-ab", "sherwood-park-ab"],
    geo: { latitude: 53.3572, longitude: -113.4147 },
  },
  {
    slug: "fort-saskatchewan-ab",
    city: "Fort Saskatchewan",
    provinceAbbr: "AB",
    intro:
      "Fort Saskatchewan sits on the North Saskatchewan River northeast of Edmonton, close to Alberta's Industrial Heartland. Plenty of its homes are owned by shift workers, landlords and long-time residents, and we're a good fit when any of them need a quick, simple sale.",
    localDetails: [
      "We buy in Fort Saskatchewan and the surrounding area.",
      "Tired of being a landlord? We buy rentals with tenants in place.",
      "Older homes with foundation, roof or basement issues are welcome as-is.",
    ],
    nearby: ["sherwood-park-ab", "st-albert-ab", "edmonton-ab"],
    geo: { latitude: 53.7125, longitude: -113.2131 },
  },
];

export function getLocation(slug: string): Location | undefined {
  return locations.find((l) => l.slug === slug);
}
