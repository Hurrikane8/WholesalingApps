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
  /**
   * The municipality the community is part of, when it isn't its own (Sherwood Park is in Strathcona County).
   * Leave it out for cities and towns: St. Albert isn't part of Sturgeon County, nor Leduc of Leduc County.
   */
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
      "Edmonton's housing runs from 1950s bungalows in mature neighbourhoods to the condo townhouse complexes built across Mill Woods, Clareview and Castle Downs in the 1970s and '80s. Many of those homes are due for big-ticket work, and many older complexes face rising fees and special assessments. I buy Edmonton homes as-is, so you can skip the repairs, the showings and the wait.",
    localDetails: [
      "I buy on both sides of the river, in every quadrant of the city.",
      "Condo townhouses are my current focus. High condo fees, a special assessment or a complex with a thin reserve fund don't rule out a sale.",
      "Older homes with original Poly-B plumbing, knob-and-tube wiring, vermiculite insulation or foundation cracks can be sold as-is.",
      "Tenants in place? I can buy with the lease in place, so you don't have to manage a move-out.",
    ],
    nearby: ["st-albert-ab", "sherwood-park-ab", "spruce-grove-ab", "leduc-ab", "beaumont-ab", "fort-saskatchewan-ab"],
    geo: { latitude: 53.5461, longitude: -113.4938 },
  },
  {
    slug: "st-albert-ab",
    city: "St. Albert",
    provinceAbbr: "AB",
    intro:
      "Much of St. Albert was built out from the 1960s through the '80s, and many of those split-levels and bungalows still have their original windows, furnaces and shingles. If your St. Albert home needs more work than you want to take on before listing, I'll make you an offer on it as it sits, with the repair estimate laid out.",
    localDetails: [
      "Split-levels, bungalows, half duplexes and condo townhouses across St. Albert all fit.",
      "Downsizing after decades in the same house? You set the closing date, so there's time to sort and move.",
      "Selling an estate? I work alongside the personal representative and the estate's lawyer.",
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
      "Sherwood Park is the urban centre of Strathcona County, just east of Edmonton, and its first neighbourhoods date back to the 1950s and '60s. Sellers there are often dealing with a dated family home, a rental they're tired of managing, or a condo townhouse where the fees keep climbing.",
    localDetails: [
      "I buy in Sherwood Park and the surrounding parts of Strathcona County.",
      "A condo townhouse with a special assessment or big repairs coming can still sell; the assessment goes into the math.",
      "Relocating for work? Close before you leave or after you've moved. You pick the date.",
    ],
    nearby: ["edmonton-ab", "fort-saskatchewan-ab", "beaumont-ab"],
    geo: { latitude: 53.5412, longitude: -113.2957 },
  },
  {
    slug: "spruce-grove-ab",
    city: "Spruce Grove",
    provinceAbbr: "AB",
    intro:
      "Spruce Grove has grown along Highway 16 west of Edmonton, so it has a mix of newer builds and older homes that are starting to show their age. Whether you're behind on payments, moving for work or done with repairs, a direct sale gives you a written number without listing.",
    localDetails: [
      "I buy throughout Spruce Grove and in nearby Parkland County communities.",
      "Half duplexes, townhouses and single-family homes all fit.",
      "Houses that need roofing, flooring, basement or mechanical work can be sold as-is.",
    ],
    nearby: ["stony-plain-ab", "st-albert-ab", "edmonton-ab"],
    geo: { latitude: 53.545, longitude: -113.9008 },
  },
  {
    slug: "stony-plain-ab",
    city: "Stony Plain",
    provinceAbbr: "AB",
    intro:
      "Stony Plain is one of the older towns west of Edmonton, with established streets of bungalows and split-levels alongside newer subdivisions. I buy Stony Plain homes as-is, including rentals, estates and houses that have sat empty.",
    localDetails: [
      "I buy in Stony Plain and on its edges toward Spruce Grove.",
      "A vacant house can be sold as-is, ideally before winter freeze-ups become a risk.",
      "An inherited house can be sold with the furniture still inside; what stays is agreed in the contract.",
    ],
    nearby: ["spruce-grove-ab", "edmonton-ab"],
    geo: { latitude: 53.5264, longitude: -114.0068 },
  },
  {
    slug: "leduc-ab",
    city: "Leduc",
    provinceAbbr: "AB",
    intro:
      "Leduc sits south of Edmonton, next to the international airport and the Nisku business park, and many homeowners there work in energy, trades or at the airport. When work changes, the timing of a sale matters. I buy Leduc houses as-is, on the closing date you choose.",
    localDetails: [
      "I buy in Leduc and the surrounding area south of Edmonton.",
      "Job change or relocation? Pick a closing date that fits the move.",
      "Rentals with tenants in place and homes that need updating both fit.",
    ],
    nearby: ["beaumont-ab", "edmonton-ab"],
    geo: { latitude: 53.2594, longitude: -113.5492 },
  },
  {
    slug: "beaumont-ab",
    city: "Beaumont",
    provinceAbbr: "AB",
    intro:
      "Beaumont is a growing city just southeast of Edmonton, with established homes near its old town centre and newer neighbourhoods on the edges. If you need to sell a Beaumont home without listing, whether because of a separation, a move or a house that needs work, a direct sale is one option to compare.",
    localDetails: [
      "I buy throughout Beaumont.",
      "Going through a separation? One written offer, with the math laid out, gives you both the same number to look at.",
      "Single-family homes, half duplexes and townhouses all fit.",
    ],
    nearby: ["leduc-ab", "edmonton-ab", "sherwood-park-ab"],
    geo: { latitude: 53.3572, longitude: -113.4147 },
  },
  {
    slug: "fort-saskatchewan-ab",
    city: "Fort Saskatchewan",
    provinceAbbr: "AB",
    intro:
      "Fort Saskatchewan sits on the North Saskatchewan River northeast of Edmonton, next to Alberta's Industrial Heartland. Its homes belong to shift workers, landlords and long-time residents alike, and a direct sale can suit any of them who need a simple one.",
    localDetails: [
      "I buy in Fort Saskatchewan and the surrounding area.",
      "Tired of being a landlord? I buy rentals with the tenants in place.",
      "Older homes with foundation, roof or basement issues can be sold as-is.",
    ],
    nearby: ["sherwood-park-ab", "st-albert-ab", "edmonton-ab"],
    geo: { latitude: 53.7125, longitude: -113.2131 },
  },
];

export function getLocation(slug: string): Location | undefined {
  return locations.find((l) => l.slug === slug);
}
