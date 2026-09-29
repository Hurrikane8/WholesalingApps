import { phoneHref, shownPropertyTypes, site } from "@/config/site";
import { responseLine } from "@/lib/claims";
import { PROPERTY_TYPES, type Reason } from "@/lib/lead-options";
import { LeadFormClient } from "@/components/LeadFormClient";

type Props = {
  /** Heading shown above the form (spec 4.1). */
  title?: string;
  subtitle?: string;
  /** "card" floats as the page's one raised object; "plain" sits inside something that's already framed. */
  variant?: "card" | "plain";
  /** "offer" for the primary form on a page; a second form on the same page uses "offer-bottom". */
  id?: "offer" | "offer-bottom";
  /** Preselects the property type chip (a PROPERTY_TYPES value). */
  propertyType?: string;
  /** Preselects "What's behind the sale?" on situation pages. */
  reason?: Reason;
};

/**
 * The seller lead form. A server component that works out the claims and
 * config the form needs (shown property types, the response line) and hands
 * plain values to the client form.
 */
export function LeadForm({
  title = "What would you get for your place?",
  subtitle = "Two quick steps. No obligation.",
  variant = "card",
  id = "offer",
  propertyType,
  reason,
}: Props) {
  const propertyTypes = shownPropertyTypes().map((t) => ({
    value: t.value,
    label: PROPERTY_TYPES.find((p) => p.value === t.value)?.label ?? t.value,
  }));
  return (
    <LeadFormClient
      formId={id}
      title={title}
      subtitle={subtitle}
      variant={variant}
      propertyTypes={propertyTypes}
      propertyType={propertyTypes.some((t) => t.value === propertyType) ? propertyType : undefined}
      reason={reason}
      responseLine={responseLine()}
      businessName={site.name}
      phone={site.phone}
      phoneHref={phoneHref}
    />
  );
}
