# Shared publication reactions

Deployed for Cloudflare Workers Free and D1 Free. The website stays on GitHub Pages. No billing upgrade was enabled. Endpoint: https://bouhiere-reactions.bouhiere-reactions.workers.dev/v1/reactions. The dedicated D1 database uses the EU jurisdiction.

## Deployment

1. From this directory, run `npm ci`, then `npx wrangler login --scopes account:read user:read workers:write workers_scripts:write d1:write`. Sign in directly to Cloudflare. Never put account credentials in site content or browser code.
2. Create `bouhiere-reactions` with `npx wrangler d1 create bouhiere-reactions --jurisdiction eu`. Put the returned database UUID in `wrangler.jsonc`. Keep the account on Workers Free.
3. Run `npx wrangler d1 migrations apply bouhiere-reactions --remote` for this new, dedicated database.
4. Generate a random 32-byte secret and supply it through stdin to `npx wrangler secret put RATE_SECRET`. Do not put it in the repository or command arguments.
5. Run `npx wrangler deploy`. Verify GET and POST against the returned workers.dev URL. The public endpoint is `/v1/reactions`.
6. Set `reactionsApi` in `content/site.json` to the verified HTTPS endpoint. Build and check the website. This enables the shared UI, its CSP connect-src permission and the corresponding privacy section together. Then publish GitHub Pages.

Do not set `reactionsApi` before deployment works. This installation is now activated in content/site.json.

## Behaviour and limits

- Counts are shared between French and English by publication slug. Newly published articles are checked against the live website, so the author portal does not need Cloudflare credentials.
- A random browser identifier is created only on the first reaction. Its hash is used server-side; no API secret is exposed to the visitor. The identifier is not authentication and does not identify a person.
- A unique database key makes repeated/concurrent requests idempotent. Counts and reactions change atomically through database triggers.
- Browser identity and reactions expire after 365 days. Expired reactions are deleted hourly, including from counts.
- At most 15 writes per minute and 100 per UTC day per network address, using an HMAC fingerprint. These limits are basic abuse resistance, not bot-proof identity. Shared networks may hit the limit together. Raw IP addresses are not stored in D1.
- GET allows up to 100 slugs. POST bodies are limited to 1 KiB. Origins, token format, JSON type, slug syntax and publication existence are checked.
- Requests carry no cookies. Cloudflare application logging is disabled. The privacy text describes technical provider processing and browser storage.
- If unavailable or quota-limited, the site reports an error instead of pretending to save a reaction. It does not switch to a paid plan automatically.

## Local verification

Create an ignored `.dev.vars` containing a random `RATE_SECRET`. Then:

    npx wrangler d1 migrations apply bouhiere-reactions --local
    npm run dev
    node test/http.mjs

The HTTP test changes only the local database. It checks shared counts, concurrent retries, removal, validation and rate limiting. Wait for the next minute before repeating after the rate-limit test. It checks existing article URLs on bouhiere.eu; no votes are sent to a production API.

Cloudflare Free quotas apply to the whole account. See https://developers.cloudflare.com/workers/platform/limits/ and https://developers.cloudflare.com/d1/platform/pricing/.


Deployment note: Wrangler 4.164 uploaded the script successfully but its beta workers/workers lookup failed. The published deployment was verified through the stable scripts API, then the subdomain was enabled with POST /accounts/{account}/workers/scripts/bouhiere-reactions/subdomain and the hourly schedule with PUT .../schedules. Both endpoints use the existing OAuth authorization. Verify deployment state before retrying a failed command; do not recreate the database.
