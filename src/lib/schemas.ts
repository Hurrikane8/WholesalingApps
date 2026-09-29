/** Zod pieces shared by the form endpoints. A leaf module, so leads, buyers and opt-outs can all import it. */
import { z } from "zod";
import { normalizePhone } from "@/lib/lead-options";

export const phoneSchema = z
  .string()
  .trim()
  .transform((v, ctx) => {
    const phone = normalizePhone(v);
    if (!phone) {
      ctx.addIssue({ code: "custom", message: "Enter a 10-digit phone number, like 780 555 0123" });
      return z.NEVER;
    }
    return phone;
  });
