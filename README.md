# Underlier

Research desk for tokenized real-world assets. One underlier, every issuer that wrapped it, the markets those tokens trade on, and the TradFi instrument behind them.

Built for the **Build with CMC: API Hackathon**, track **Real World Assets**.

## What you need to provide

| Need | Required? |
|---|---|
| `CMC_API_KEY` from [coinmarketcap.com/api](https://coinmarketcap.com/api) | **Yes** for live data |
| Database | No |
| AI model / OpenAI / Anthropic | No |

Without a key the app still runs on checked-in fixture responses so the join can be developed and tested. Put the key in `.env.local`:

```
CMC_API_KEY=your_key_here
```

Never commit the key. `.env*` is gitignored; `.env.example` is not.

## Run locally

```bash
npm install
cp .env.example .env.local   # then paste CMC_API_KEY
npm test
npm run dev
```

Dev server: [http://127.0.0.1:43147](http://127.0.0.1:43147)

## What it does

CMC publishes two views that do not meet: ranked underliers and ranked wrapper tokens. Tickers collide (`NVDA` the Nasdaq stock vs several issuer tokens; `SPCX` the listing vs the Backpack token). Underlier resolves `rwa_id`, then joins metadata, tokenized quotes, issuer tokens, and market pairs.

Try `NVDA`, `GOLD`, or `SPCX` in the screener, open the asset desk, then an issuer.

## CMC endpoints used

1. `GET /v5/real-world-assets/map`
2. `GET /v5/real-world-assets/info`
3. `GET /v5/real-world-assets/assets/list`
4. `GET /v5/real-world-assets/quotes/latest`
5. `GET /v5/real-world-assets/market-pairs/list`
6. `GET /v5/real-world-assets/issuers/list`
7. `GET /v5/real-world-assets/issuers`
8. `GET /v2/cryptocurrency/quotes/latest` — fallback when an RWA token has a `crypto_id` but no price

Each page exposes an evidence drawer with the named endpoint and a truncated response. Sample envelope: [`evidence/sample-cmc-map-spacex.json`](evidence/sample-cmc-map-spacex.json).

BFF routes (same payloads the UI uses):

- `/api/rwa/screener`
- `/api/rwa/asset/[id]`
- `/api/rwa/issuers`
- `/api/rwa/issuer/[id]`

## What the API made possible / where it got in the way

The RWA family is the first time CMC lets you walk **underlier → issuer → on-chain token → market** without scraping HTML. `rwa_id` is a separate namespace from `crypto_id`, which is exactly the collision problem a person hits.

Friction already visible from the docs, before a live key:

- There is **no name-search** parameter. Lookups are ticker, slug, or `rwa_id`.
- `/issuers/list` does not include tokens; you have to fetch each issuer to invert “who wrapped this underlier.”
- Static metadata and market data are split (`/info` vs `/quotes` vs `/assets/list`), so a desk page is several calls.
- Equity-only fields (`cik`, `employees`, `primary_exchange`) are null for commodities rather than omitted — parsers must not treat null as zero.

A fuller note will follow the first live key.

## Stack

Next.js App Router, TypeScript, Tailwind, shadcn/ui. CMC calls stay on the server. No database.
