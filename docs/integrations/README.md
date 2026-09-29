# Integrations: where leads go, and how Kane hears about them

The rule: **a lead is never lost, Kane hears about it within seconds, and the seller hears back right away.**
Everything below turns on with environment variables (host dashboard → Environment Variables, then redeploy).
Nothing is sent anywhere that isn't configured.

## 1. Where records are stored (sinks)

When someone sends the seller form, joins the buyers list or opts out, the record goes to **every** configured
sink at once. One success is enough. If none is configured, or every one fails, the form tells the person to call
or text instead, and the server logs the full record as `[lead:undelivered]` (or `[buyer:undelivered]`,
`[opt-out:undelivered]`) so it can be recovered from the host's logs. A production build for the real domain
refuses to deploy without at least one sink and one owner alert (the launch guard in `next.config.ts`).

| Sink | Variables | Gets |
|---|---|---|
| Airtable ("Wholesaling CRM") | `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID` | Seller Leads and Buyers tables. Opt-outs too, if `AIRTABLE_OPTOUT_TABLE` names a table. |
| Webhooks | `LEAD_WEBHOOK_URL` (comma-separated), optional `LEAD_WEBHOOK_SECRET` | Every record as JSON: `{ type, source, ...record }`, where `type` is `seller_lead`, `buyer_signup` or `opt_out`. |
| Owner email (Resend) | `RESEND_API_KEY`, `LEAD_EMAIL_TO`, `LEAD_EMAIL_FROM` | An email per record. It counts as a sink because it's a written record in your inbox. |

Airtable field names live in `src/config/airtable.ts`. If Airtable rejects a field (renamed field, missing select
option), the record is saved anyway with that value moved into Notes, and a warning is logged.

### Opt-outs table in Airtable (optional)

Create a table (for example "Opt-outs") with these fields, then set `AIRTABLE_OPTOUT_TABLE` to its name:
Address (primary), Name, Phone, Email, Channel, Notes, Date. The names are **TO CONFIRM**; change them in
`src/config/airtable.ts` if you name them differently.

## 2. Free backup: Google Sheets

A second copy of everything in a Google Sheet, at no cost.

1. Create a Google Sheet (for example "Aurora website backup").
2. **Extensions → Apps Script.** Delete the sample code and paste in `docs/integrations/google-sheets-backup.gs`.
3. Change `SECRET` near the top to a long random string (a password generator is fine). Save.
4. **Deploy → New deployment → Web app.** Execute as: **Me**. Who has access: **Anyone**. Deploy, and allow access.
5. Copy the web app URL (it ends in `/exec`) and add `?secret=` plus your secret:
   `https://script.google.com/macros/s/…/exec?secret=YOUR_SECRET`
6. Add that URL to `LEAD_WEBHOOK_URL` (comma-separate it from any other webhook) and redeploy the site.
7. Send a test lead. Rows appear in the tabs "Seller leads", "Buyers" and "Opt-outs", which the script creates
   on first use. Delete the test row.

Apps Script answers a POST with a redirect; the site follows it. If the secret is wrong, the script answers
`{"ok":false}` and the site treats that webhook as failed.

## 3. Alerts to Kane

| Alert | Variables | Notes |
|---|---|---|
| Email | `RESEND_API_KEY`, `LEAD_EMAIL_TO`, `LEAD_EMAIL_FROM` | Big "Call" and (with consent) "Text" links at the top, then every detail. |
| Text through Quo | `QUO_API_KEY`, `QUO_FROM_NUMBER`, `QUO_NOTIFY_TO` (your cell), optional `QUO_API_BASE` | Dormant until all three are set. 320 characters or fewer. |
| Push through ntfy | `NTFY_TOPIC_URL`, optional `NTFY_TOKEN` | Free. Install the ntfy app, subscribe to a long random topic (e.g. `https://ntfy.sh/aurora-7f3k…`). The push says only the property type and timeline, never names, numbers or addresses. "As soon as possible" leads arrive as high priority. |

Texts, pushes and seller confirmations are sent after the form has already answered, so they never slow it down.
A failure logs the lead ID only.

**Quo API.** `POST {QUO_API_BASE}/v1/messages` with the raw API key in the `Authorization` header (no "Bearer"),
body `{ content, from, to: ["+1780…"] }`; success is HTTP 202. `QUO_API_BASE` defaults to `https://api.quo.com`
(checked against Quo's API reference in September 2026). `QUO_FROM_NUMBER` is your Quo number in any format, or
its `PN…` ID.

## 4. Confirmations to the seller

- **Email:** when the seller gave an email address, unless `SELLER_ACK_EMAIL=false`. Sent from `LEAD_EMAIL_FROM`,
  with replies going to the first address in `LEAD_EMAIL_TO`.
- **Text:** only when Quo is set up, `SELLER_ACK_SMS=true`, the seller ticked the text-consent box, and it's between
  8:00 and 21:00 Edmonton time. Otherwise it's skipped (the email still goes).

Both say who they're from, how to reach you, and how to opt out (CASL). Every promise in them comes from
`src/lib/claims.ts`, so they only say what you've confirmed.

## 5. Adding a CRM later

When you move off Airtable, only `src/lib/sinks/` changes:

1. Add `src/lib/sinks/<crm>.ts` exporting a function that returns a `Sink` (see `types.ts`): a `name`, the
   `kinds` it accepts, and `send(kind, record)`, which resolves when the record is stored and throws otherwise.
   Use `airtable.ts` as the example.
2. Register it in `getSinks()` in `src/lib/sinks/index.ts`, behind its own environment variables, so it's dormant
   until they're set.
3. Add tests next to `tests/sinks.test.ts`: it's picked up when configured, it maps the fields, and a failure
   doesn't lose the lead when another sink succeeds.
4. Add the variables to `.env.example` and this page.

You can run the old and new CRM side by side (both configured) until you trust the new one.

## 6. Campaign links and QR codes

`src/config/campaigns.ts` lists short links for letters and door hangers: `{site}/go/{code}` redirects to the page
with UTM parameters, so each lead shows which run it came from. After adding a campaign and deploying:

```bash
NEXT_PUBLIC_SITE_URL=https://www.yourdomain.ca npm run qr
```

writes `public/qr/{code}.svg` for printing. It refuses to run until the site URL is the real domain.
