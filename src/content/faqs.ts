import { site } from "@/config/site";

export type Faq = { question: string; answer: string };

const { promises, market, name } = site;

/** General FAQs shown on /faq (all of them) and on the home page (the first few). */
export const faqs: Faq[] = [
  {
    question: "How does selling my house for cash work?",
    answer: `Tell us about your property through the form or by phone. We'll ask a few questions, look at the house (in person or by video), and send you a written, no-obligation cash offer, usually within ${promises.offerWithinHours} hours. If you accept, we sign a simple purchase agreement, a local title company or closing attorney handles the paperwork, and you get paid at closing on the date you choose.`,
  },
  {
    question: "How fast can you close?",
    answer: `We can close in as little as ${promises.closeInDays} days when the title is clear. Most sellers pick a date two to four weeks out, and some need longer to move or settle an estate. That works too. You choose the closing date.`,
  },
  {
    question: "Are there any fees or commissions?",
    answer: `No. We're buying your house directly, so there are no agent commissions, listing fees or hidden charges.${promises.paysClosingCosts ? " We also pay the normal seller closing costs." : ""} The number on our written offer is the price we pay. Any mortgage, liens or property taxes you owe are paid off from that amount at closing, just like in any sale.`,
  },
  {
    question: "Do I need to make repairs or clean the house?",
    answer:
      "No. We buy houses as-is: foundation problems, roof leaks, outdated kitchens, fire or water damage, hoarder situations, you name it. You can leave behind anything you don't want to take, and we'll handle the clean-out after closing.",
  },
  {
    question: "How do you calculate your offer?",
    answer:
      "We start with what the house would likely sell for after it's fully repaired, based on recent comparable sales nearby. Then we subtract the cost of repairs, the costs of buying, holding and reselling the property, and a modest profit. We'll walk you through the numbers so you can see exactly how we got there.",
  },
  {
    question: "Will your offer be lower than listing with an agent?",
    answer:
      "Usually our price is lower than what a fully repaired house might sell for on the open market. But when you list, you typically pay commissions, closing costs, repairs, and months of mortgage payments, taxes, insurance and utilities while you wait. Once you add those up, the gap is often smaller than people expect. If listing will put more money in your pocket, we'll tell you.",
  },
  {
    question: "Is there any obligation if I request an offer?",
    answer:
      "None. Our offers are free and carry no obligation. If the offer doesn't work for you, just say no. We won't pressure you.",
  },
  {
    question: "Will you actually buy my house, or assign the contract?",
    answer: `We'll be upfront with you. ${site.disclosure}`,
  },
  {
    question: "Can you buy a house that's in foreclosure?",
    answer:
      "Often, yes. If there's enough time before the sale date, we can close quickly and pay off the loan, which stops the foreclosure. The sooner you reach out, the more options you have. We also recommend speaking with a HUD-approved housing counselor about every option available to you.",
  },
  {
    question: "Can I sell a house I inherited or that's in probate?",
    answer:
      "Yes. We buy inherited properties regularly and can work with the executor or personal representative and your probate attorney. In many cases we can sign a contract while probate is still open and close once the court gives the executor authority to sell.",
  },
  {
    question: "What if I still have tenants in the property?",
    answer:
      "That's fine. We buy rental properties with tenants in place, including tenants who are behind on rent. You don't need to evict anyone or wait for leases to end.",
  },
  {
    question: "Do you buy houses that need major repairs?",
    answer:
      "Yes, and that's where we're most useful. Houses with structural issues, mold, fire damage, code violations or a long list of deferred maintenance are hard to sell to buyers who need a mortgage. We pay cash, so the condition doesn't hold up the sale.",
  },
  {
    question: "What areas do you buy in?",
    answer: `We buy houses throughout ${market.region} and the surrounding communities. See the areas we serve, or just send us your address and we'll let you know.`,
  },
  {
    question: `Who is ${name}?`,
    answer: `We're a local real estate investment company that buys houses directly from homeowners in ${market.region}. We buy in any condition and any situation, and we always explain our offers in plain English.`,
  },
  {
    question: "Is my information kept private?",
    answer:
      "Yes. We use your information only to respond about your property. We never sell it, and your mobile number is never shared with third parties for their marketing. See our Privacy Policy for details.",
  },
];
