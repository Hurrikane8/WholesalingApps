import { site } from "@/config/site";

export type Faq = { question: string; answer: string };

const { promises, market, name } = site;

/** General FAQs shown on /faq (all of them) and on the home page (the first few). */
export const faqs: Faq[] = [
  {
    question: "How does selling my house for cash work?",
    answer: `Tell us about your property through the form or by phone. We'll ask a few questions, look at the home (in person or by video), and send you a written, no-obligation cash offer, usually within ${promises.offerWithinHours} hours. If you accept, we sign a simple purchase contract, real estate lawyers handle the paperwork, and you're paid through your lawyer on the closing date you choose.`,
  },
  {
    question: "How fast can you close?",
    answer: `We can close in as little as ${promises.closeInDays} days when the title is clear and the lawyers have what they need. Most sellers pick a date a few weeks out, and some need longer to move or settle an estate. That works too. You choose the date.`,
  },
  {
    question: "Are there any fees or commissions?",
    answer: `No. We're buying your home directly, so there are no agent commissions, listing fees or hidden charges.${promises.coversLegalFees ? " We also cover your standard legal fees." : ""} The number on our written offer is the price we pay. Your mortgage payout (including any prepayment penalty), liens and property tax arrears are paid from that amount at closing, just like in any sale.`,
  },
  {
    question: "Do you buy condos and townhouses?",
    answer:
      "Yes. Condo townhouses are one of the property types we buy most often, including units in complexes with high condo fees, special assessments or big repairs coming up. We also buy apartment-style condos, half duplexes, freehold townhouses and single-family homes.",
  },
  {
    question: "Do I need to make repairs or clean the house?",
    answer:
      "No. We buy as-is: foundation cracks, roof leaks, Poly-B plumbing, outdated kitchens, fire or water damage, hoarding situations, you name it. Take anything you want to keep and leave the rest; we'll handle the clean-out after closing.",
  },
  {
    question: "How do you calculate your offer?",
    answer:
      "We start with what the home would likely sell for after it's fully repaired, based on recent comparable sales nearby. Then we subtract the cost of repairs, the costs of buying, holding and reselling the property, and a modest profit. We'll walk you through the numbers so you can see exactly how we got there.",
  },
  {
    question: "Will your offer be lower than listing with a realtor?",
    answer:
      "Usually our price is lower than what a fully repaired home might sell for on the open market. But when you list, you typically pay commissions plus GST, repairs, and months of mortgage payments, condo fees, taxes and utilities while you wait. Once you add those up, the gap is often smaller than people expect. If listing will put more money in your pocket, we'll tell you.",
  },
  {
    question: "Is there any obligation if I request an offer?",
    answer: "None. Our offers are free and carry no obligation. If the offer doesn't work for you, just say no. We won't pressure you.",
  },
  {
    question: "Will you actually buy my house, or assign the contract?",
    answer: `We'll be upfront with you. ${site.disclosure}`,
  },
  {
    question: "Can you buy a house that's in foreclosure?",
    answer:
      "Often, yes. In Alberta, foreclosure goes through the courts and takes time, and until the court process ends you can usually still sell. A sale pays out your mortgage and the lender's costs at closing. The sooner you reach out, the more options you have. We also recommend talking to a lawyer and a non-profit credit counsellor about every option available to you.",
  },
  {
    question: "Can I sell a house I inherited or that's part of an estate?",
    answer:
      "Yes. We buy estate properties regularly and work with the personal representative (executor) and the estate's lawyer. In many cases we can sign a purchase contract while the grant of probate is being processed and close once the personal representative has authority to sell.",
  },
  {
    question: "What if I still have tenants in the property?",
    answer:
      "That's fine. We buy rental properties with tenants in place, including tenants who are behind on rent. The tenancy carries over to the new owner, so you don't need to end anyone's lease to sell.",
  },
  {
    question: "What areas do you buy in?",
    answer: `We buy throughout ${market.region}: Edmonton plus St. Albert, Sherwood Park, Spruce Grove, Stony Plain, Leduc, Beaumont and Fort Saskatchewan. Send us your address and we'll let you know right away.`,
  },
  {
    question: `Who is ${name}?`,
    answer: `We're a local real estate investment company that buys houses, condos and townhouses directly from homeowners in ${market.region}. We buy in any condition and any situation, and we explain our offers in plain English.`,
  },
  {
    question: "Is my information kept private?",
    answer:
      "Yes. We use your information only to respond about your property. We never sell it, and your mobile number is never shared with third parties for their marketing. See our Privacy Policy for details.",
  },
];
