import { ASSET_TYPES, type AssetType } from "./types";

const BACKPACK_ID = "6a2d54b697c45356b1a634f4";
const PAXOS_ID = "a11ce0000000000000000001";
const ONDO_ID = "a11ce0000000000000000002";
const XSTOCK_ID = "a11ce0000000000000000003";

type RawAsset = {
  rwa_id: number;
  name: string;
  symbol: string;
  slug: string;
  asset_type: AssetType;
  rwa_rank: number;
  has_tokens: boolean;
  average_tokenized_price: number | null;
  tokenized_market_cap: number | null;
  tokenized_volume_24h: number | null;
  percent_change_24h: number | null;
  description: string;
  website: string;
  logo: string | null;
  primary_exchange: string | null;
  industry: string | null;
  employees: number | null;
  founded: string | null;
  cik: string | null;
  tradfi_markets: Array<{
    name: string;
    exchange: string;
    symbol: string;
    price: number;
    currency: string;
  }>;
  tokens: Array<{
    crypto_id: number;
    name: string;
    symbol: string;
    rwa_id: number;
    issuer_id: string;
    issuer_name: string;
    price: number;
    market_cap: number;
    volume_24h: number;
  }>;
  market_pairs: Array<{
    exchange: { name: string };
    market_pair: string;
    category: string;
    quote: { USD: { price: number; volume_24h: number } };
  }>;
};

const ASSETS: RawAsset[] = [
  {
    rwa_id: 1,
    name: "Gold",
    symbol: "GOLD",
    slug: "gold",
    asset_type: "commodity",
    rwa_rank: 1,
    has_tokens: true,
    average_tokenized_price: 4436.59,
    tokenized_market_cap: 2.994e13,
    tokenized_volume_24h: 4.7071e8,
    percent_change_24h: 0.11,
    description:
      "Gold is the benchmark commodity behind several on-chain wrappers, including PAX Gold.",
    website: "https://www.gold.org",
    logo: null,
    primary_exchange: null,
    industry: "Commodity",
    employees: null,
    founded: null,
    cik: null,
    tradfi_markets: [
      { name: "LBMA Gold Price", exchange: "LBMA", symbol: "XAU", price: 4433.53, currency: "USD" },
    ],
    tokens: [
      {
        crypto_id: 4705,
        name: "PAX Gold",
        symbol: "PAXG",
        rwa_id: 1,
        issuer_id: PAXOS_ID,
        issuer_name: "Paxos",
        price: 4436.12,
        market_cap: 2.01e9,
        volume_24h: 2.68e8,
      },
    ],
    market_pairs: [
      {
        exchange: { name: "Binance" },
        market_pair: "PAXG/USDT",
        category: "Spot",
        quote: { USD: { price: 4436.12, volume_24h: 1.12e8 } },
      },
    ],
  },
  {
    rwa_id: 2,
    name: "NVIDIA",
    symbol: "NVDA",
    slug: "nvidia",
    asset_type: "stock",
    rwa_rank: 4,
    has_tokens: true,
    average_tokenized_price: 178.42,
    tokenized_market_cap: 4.36e12,
    tokenized_volume_24h: 8.4e7,
    percent_change_24h: 1.62,
    description:
      "NVIDIA designs GPUs and accelerators. Multiple issuers mint tokenized NVDA that trades while the Nasdaq is closed.",
    website: "https://www.nvidia.com",
    logo: null,
    primary_exchange: "NASDAQ",
    industry: "Semiconductors",
    employees: 36000,
    founded: "1993-04-05T00:00:00.000Z",
    cik: "0001045810",
    tradfi_markets: [
      { name: "NASDAQ", exchange: "NASDAQ", symbol: "NVDA", price: 178.2, currency: "USD" },
    ],
    tokens: [
      {
        crypto_id: 50101,
        name: "NVIDIA tokenized stock (Ondo)",
        symbol: "NVDAon",
        rwa_id: 2,
        issuer_id: ONDO_ID,
        issuer_name: "Ondo",
        price: 178.51,
        market_cap: 4.2e7,
        volume_24h: 6.1e6,
      },
      {
        crypto_id: 50102,
        name: "NVIDIA tokenized stock (xStock)",
        symbol: "NVDAX",
        rwa_id: 2,
        issuer_id: XSTOCK_ID,
        issuer_name: "xStock",
        price: 178.33,
        market_cap: 2.8e7,
        volume_24h: 9.4e6,
      },
    ],
    market_pairs: [
      {
        exchange: { name: "Bybit" },
        market_pair: "NVDAX/USDT",
        category: "Spot",
        quote: { USD: { price: 178.33, volume_24h: 5.2e6 } },
      },
    ],
  },
  {
    rwa_id: 9,
    name: "SpaceX",
    symbol: "SPCX",
    slug: "spacex",
    asset_type: "stock",
    rwa_rank: 7,
    has_tokens: true,
    average_tokenized_price: 225.37,
    tokenized_market_cap: 5.44e11,
    tokenized_volume_24h: 1.0955e8,
    percent_change_24h: -0.84,
    description:
      "SpaceX is tracked as an RWA. The SPCX ticker collides with the Nasdaq listing and the Backpack token — resolve rwa_id, not the ticker.",
    website: "https://www.spacex.com",
    logo: null,
    primary_exchange: "NASDAQ",
    industry: "Aerospace",
    employees: 13000,
    founded: "2002-03-14T00:00:00.000Z",
    cik: "0001326801",
    tradfi_markets: [
      { name: "NASDAQ", exchange: "NASDAQ", symbol: "SPCX", price: 224.9, currency: "USD" },
    ],
    tokens: [
      {
        crypto_id: 40238,
        name: "SpaceX tokenized stock (Backpack)",
        symbol: "SPCX",
        rwa_id: 9,
        issuer_id: BACKPACK_ID,
        issuer_name: "Backpack",
        price: 225.37,
        market_cap: 8.4e7,
        volume_24h: 1.2e7,
      },
    ],
    market_pairs: [
      {
        exchange: { name: "Backpack" },
        market_pair: "SPCX/USDC",
        category: "Spot",
        quote: { USD: { price: 225.37, volume_24h: 1.2e7 } },
      },
    ],
  },
  {
    rwa_id: 15,
    name: "iShares 20+ Year Treasury Bond ETF",
    symbol: "TLT",
    slug: "ishares-20-year-treasury-bond-etf",
    asset_type: "etf",
    rwa_rank: 18,
    has_tokens: true,
    average_tokenized_price: 85.93,
    tokenized_market_cap: 4.8e10,
    tokenized_volume_24h: 2.1e6,
    percent_change_24h: 0.22,
    description:
      "Long-duration US Treasuries, tokenized so they can be held in a wallet instead of a brokerage account.",
    website: "https://www.ishares.com",
    logo: null,
    primary_exchange: "NASDAQ",
    industry: "Fixed Income ETF",
    employees: null,
    founded: "2002-07-22T00:00:00.000Z",
    cik: "0001100663",
    tradfi_markets: [
      { name: "NASDAQ", exchange: "NASDAQ", symbol: "TLT", price: 85.88, currency: "USD" },
    ],
    tokens: [
      {
        crypto_id: 32201,
        name: "iShares 20+ Year Treasury Bond Tokenized ETF (Ondo)",
        symbol: "TLTon",
        rwa_id: 15,
        issuer_id: ONDO_ID,
        issuer_name: "Ondo",
        price: 85.93,
        market_cap: 1.1e7,
        volume_24h: 5.03e5,
      },
    ],
    market_pairs: [
      {
        exchange: { name: "Uniswap v3" },
        market_pair: "TLTon/USDC",
        category: "DEX",
        quote: { USD: { price: 85.93, volume_24h: 5.03e5 } },
      },
    ],
  },
  {
    rwa_id: 21,
    name: "United States 3 Month Treasury",
    symbol: "TBILL",
    slug: "us-3-month-treasury",
    asset_type: "government_security",
    rwa_rank: 12,
    has_tokens: true,
    average_tokenized_price: 1.0002,
    tokenized_market_cap: 1.8e9,
    tokenized_volume_24h: 4.4e6,
    percent_change_24h: 0.01,
    description:
      "Short-duration US government securities wrapped by on-chain treasury products.",
    website: "https://www.treasurydirect.gov",
    logo: null,
    primary_exchange: null,
    industry: "Government securities",
    employees: null,
    founded: null,
    cik: null,
    tradfi_markets: [
      { name: "US Treasury", exchange: "Treasury", symbol: "TBILL", price: 1.0, currency: "USD" },
    ],
    tokens: [
      {
        crypto_id: 33001,
        name: "Ondo Short-Term US Government Treasuries",
        symbol: "USDY",
        rwa_id: 21,
        issuer_id: ONDO_ID,
        issuer_name: "Ondo",
        price: 1.0002,
        market_cap: 1.2e9,
        volume_24h: 3.1e6,
      },
    ],
    market_pairs: [
      {
        exchange: { name: "Bybit" },
        market_pair: "USDY/USDT",
        category: "Spot",
        quote: { USD: { price: 1.0002, volume_24h: 3.1e6 } },
      },
    ],
  },
  {
    rwa_id: 40,
    name: "Example Tower",
    symbol: "TOWER",
    slug: "example-tower",
    asset_type: "real_estate",
    rwa_rank: 220,
    has_tokens: false,
    average_tokenized_price: null,
    tokenized_market_cap: null,
    tokenized_volume_24h: null,
    percent_change_24h: null,
    description:
      "Tracked as real estate with no linked tokens yet. The desk still shows metadata.",
    website: "https://coinmarketcap.com",
    logo: null,
    primary_exchange: null,
    industry: "Real estate",
    employees: null,
    founded: null,
    cik: null,
    tradfi_markets: [],
    tokens: [],
    market_pairs: [],
  },
];

const ISSUERS = [
  {
    issuer_id: BACKPACK_ID,
    name: "Backpack",
    website: "https://backpack.exchange",
    logo: null,
    num_tokens: 1,
    active: true,
    tokens: [
      { crypto_id: 40238, name: "SpaceX tokenized stock (Backpack)", symbol: "SPCX", rwa_id: 9 },
    ],
  },
  {
    issuer_id: PAXOS_ID,
    name: "Paxos",
    website: "https://paxos.com",
    logo: null,
    num_tokens: 1,
    active: true,
    tokens: [{ crypto_id: 4705, name: "PAX Gold", symbol: "PAXG", rwa_id: 1 }],
  },
  {
    issuer_id: ONDO_ID,
    name: "Ondo",
    website: "https://ondo.finance",
    logo: null,
    num_tokens: 3,
    active: true,
    tokens: [
      { crypto_id: 50101, name: "NVIDIA tokenized stock (Ondo)", symbol: "NVDAon", rwa_id: 2 },
      {
        crypto_id: 32201,
        name: "iShares 20+ Year Treasury Bond Tokenized ETF (Ondo)",
        symbol: "TLTon",
        rwa_id: 15,
      },
      {
        crypto_id: 33001,
        name: "Ondo Short-Term US Government Treasuries",
        symbol: "USDY",
        rwa_id: 21,
      },
    ],
  },
  {
    issuer_id: XSTOCK_ID,
    name: "xStock",
    website: null,
    logo: null,
    num_tokens: 1,
    active: true,
    tokens: [
      { crypto_id: 50102, name: "NVIDIA tokenized stock (xStock)", symbol: "NVDAX", rwa_id: 2 },
    ],
  },
];

function envelope(data: unknown, creditCount = 1) {
  return {
    data,
    status: {
      timestamp: "2026-09-04T08:00:00.000Z",
      error_code: "0",
      error_message: null,
      elapsed: 12,
      credit_count: creditCount,
    },
  };
}

function matchIdList(raw: string | undefined, id: number, slug: string, symbol: string) {
  if (!raw) return true;
  const parts = raw.split(",").map((part) => part.trim().toLowerCase());
  return (
    parts.includes(String(id)) ||
    parts.includes(slug.toLowerCase()) ||
    parts.includes(symbol.toLowerCase())
  );
}

function paginate<T>(items: T[], start = 1, limit = 100) {
  const from = Math.max(start - 1, 0);
  const slice = items.slice(from, from + limit);
  return {
    items: slice,
    total_size: items.length,
    has_more: from + slice.length < items.length,
  };
}

export function fixtureMap(query: Record<string, string>) {
  let rows = ASSETS.map((asset) => ({
    rwa_id: asset.rwa_id,
    name: asset.name,
    symbol: asset.symbol,
    slug: asset.slug,
    asset_type: asset.asset_type,
    rwa_rank: asset.rwa_rank,
    has_tokens: asset.has_tokens,
  }));
  if (query.asset_type) {
    rows = rows.filter((row) => row.asset_type === query.asset_type);
  }
  if (query.symbol) {
    const wanted = query.symbol.split(",").map((item) => item.trim().toUpperCase());
    rows = rows.filter((row) => wanted.includes(row.symbol.toUpperCase()));
  }
  const page = paginate(rows, Number(query.start || 1), Number(query.limit || 100));
  return envelope(
    { rwa_assets: page.items, total_size: page.total_size, has_more: page.has_more },
    0,
  );
}

export function fixtureInfo(query: Record<string, string>) {
  const id = query.rwa_id;
  const slug = query.rwa_slug;
  const symbol = query.symbol;
  const rows = ASSETS.filter((asset) => {
    if (id) return matchIdList(id, asset.rwa_id, asset.slug, asset.symbol);
    if (slug) return matchIdList(slug, asset.rwa_id, asset.slug, asset.symbol);
    if (symbol) return matchIdList(symbol, asset.rwa_id, asset.slug, asset.symbol);
    return false;
  }).map((asset) => ({
    rwa_id: asset.rwa_id,
    name: asset.name,
    symbol: asset.symbol,
    slug: asset.slug,
    asset_type: asset.asset_type,
    rwa_rank: asset.rwa_rank,
    has_tokens: asset.has_tokens,
    description: asset.description,
    website: asset.website,
    logo: asset.logo,
    about: {
      description: asset.description,
      website: asset.website,
      logo: asset.logo,
    },
    company: {
      primary_exchange: asset.primary_exchange,
      industry: asset.industry,
      employees: asset.employees,
      founded: asset.founded,
      cik: asset.cik,
    },
  }));
  return envelope({ rwa_assets: rows });
}

export function fixtureAssetList(query: Record<string, string>) {
  let rows = [...ASSETS];
  if (query.asset_type) rows = rows.filter((row) => row.asset_type === query.asset_type);
  if (query.rwa_id) {
    rows = rows.filter((row) => matchIdList(query.rwa_id, row.rwa_id, row.slug, row.symbol));
  } else if (query.rwa_slug) {
    rows = rows.filter((row) => matchIdList(query.rwa_slug, row.rwa_id, row.slug, row.symbol));
  } else if (query.symbol) {
    rows = rows.filter((row) => matchIdList(query.symbol, row.rwa_id, row.slug, row.symbol));
  }
  const sort = query.sort || "rwa_rank";
  const dir = query.sort_dir === "desc" ? -1 : 1;
  rows.sort((a, b) => {
    const av =
      sort === "tokenized_market_cap"
        ? a.tokenized_market_cap ?? -1
        : sort === "tokenized_volume_24h"
          ? a.tokenized_volume_24h ?? -1
          : sort === "average_tokenized_price"
            ? a.average_tokenized_price ?? -1
            : sort === "symbol"
              ? a.symbol
              : a.rwa_rank;
    const bv =
      sort === "tokenized_market_cap"
        ? b.tokenized_market_cap ?? -1
        : sort === "tokenized_volume_24h"
          ? b.tokenized_volume_24h ?? -1
          : sort === "average_tokenized_price"
            ? b.average_tokenized_price ?? -1
            : sort === "symbol"
              ? b.symbol
              : b.rwa_rank;
    if (typeof av === "string" && typeof bv === "string") {
      return av.localeCompare(bv) * dir;
    }
    return ((av as number) - (bv as number)) * dir;
  });
  const page = paginate(rows, Number(query.start || 1), Number(query.limit || 100));
  return envelope({
    rwa_assets: page.items.map((asset) => ({
      rwa_id: asset.rwa_id,
      name: asset.name,
      symbol: asset.symbol,
      slug: asset.slug,
      asset_type: asset.asset_type,
      rwa_rank: asset.rwa_rank,
      has_tokens: asset.has_tokens,
      average_tokenized_price: asset.average_tokenized_price,
      tokenized_market_cap: asset.tokenized_market_cap,
      tokenized_volume_24h: asset.tokenized_volume_24h,
      percent_change_24h: asset.percent_change_24h,
      quote: {
        USD: {
          average_tokenized_price: asset.average_tokenized_price,
          tokenized_market_cap: asset.tokenized_market_cap,
          tokenized_volume_24h: asset.tokenized_volume_24h,
          percent_change_24h: asset.percent_change_24h,
        },
      },
    })),
    total_size: page.total_size,
    has_more: page.has_more,
  });
}

export function fixtureQuotes(query: Record<string, string>) {
  const rows = ASSETS.filter((asset) => {
    if (query.rwa_id) return matchIdList(query.rwa_id, asset.rwa_id, asset.slug, asset.symbol);
    if (query.rwa_slug) return matchIdList(query.rwa_slug, asset.rwa_id, asset.slug, asset.symbol);
    if (query.symbol) return matchIdList(query.symbol, asset.rwa_id, asset.slug, asset.symbol);
    return false;
  }).map((asset) => ({
    rwa_id: asset.rwa_id,
    name: asset.name,
    symbol: asset.symbol,
    slug: asset.slug,
    asset_type: asset.asset_type,
    rwa_rank: asset.rwa_rank,
    has_tokens: asset.has_tokens,
    average_tokenized_price: asset.average_tokenized_price,
    tokenized_market_cap: asset.tokenized_market_cap,
    tokenized_volume_24h: asset.tokenized_volume_24h,
    quote: {
      USD: {
        average_tokenized_price: asset.average_tokenized_price,
        tokenized_market_cap: asset.tokenized_market_cap,
        tokenized_volume_24h: asset.tokenized_volume_24h,
        percent_change_24h: asset.percent_change_24h,
      },
    },
    tokens: asset.tokens.map((token) => ({
      crypto_id: token.crypto_id,
      name: token.name,
      symbol: token.symbol,
      rwa_id: token.rwa_id,
      issuer_id: token.issuer_id,
      issuer_name: token.issuer_name,
      quote: {
        USD: {
          price: token.price,
          market_cap: token.market_cap,
          volume_24h: token.volume_24h,
        },
      },
    })),
    tradfi_markets: asset.tradfi_markets,
  }));
  return envelope({ rwa_assets: rows });
}

export function fixtureMarketPairs(query: Record<string, string>) {
  const asset = ASSETS.find((row) => {
    if (query.rwa_id) return String(row.rwa_id) === query.rwa_id;
    if (query.rwa_slug) return row.slug === query.rwa_slug;
    if (query.symbol) return row.symbol.toUpperCase() === query.symbol.toUpperCase();
    return false;
  });
  if (!asset) {
    return {
      data: null,
      status: {
        timestamp: "2026-09-04T08:00:00.000Z",
        error_code: 400,
        error_message: "Invalid RWA asset identifier",
        elapsed: 4,
        credit_count: 0,
      },
    };
  }
  const page = paginate(asset.market_pairs, Number(query.start || 1), Number(query.limit || 100));
  return envelope({
    rwa_id: asset.rwa_id,
    name: asset.name,
    symbol: asset.symbol,
    num_market_pairs: asset.market_pairs.length,
    market_pairs: page.items,
    total_size: page.total_size,
    has_more: page.has_more,
  });
}

export function fixtureIssuersList(query: Record<string, string>) {
  let rows = ISSUERS.map((issuer) => ({
    issuer_id: issuer.issuer_id,
    name: issuer.name,
    website: issuer.website,
    logo: issuer.logo,
    num_tokens: issuer.num_tokens,
    active: issuer.active,
  }));
  if (query.issuer_id) {
    const wanted = query.issuer_id.split(",");
    rows = rows.filter((row) => wanted.includes(row.issuer_id));
  }
  if (query.active === "true") rows = rows.filter((row) => row.active);
  const page = paginate(rows, Number(query.start || 1), Number(query.limit || 100));
  return envelope({
    issuers: page.items,
    total_size: page.total_size,
    has_more: page.has_more,
  });
}

export function fixtureIssuer(query: Record<string, string>) {
  const issuer = ISSUERS.find((row) => row.issuer_id === query.issuer_id);
  if (!issuer) {
    return {
      data: null,
      status: {
        timestamp: "2026-09-04T08:00:00.000Z",
        error_code: 400,
        error_message: "Issuer not found",
        elapsed: 3,
        credit_count: 0,
      },
    };
  }
  const page = paginate(issuer.tokens, Number(query.start || 1), Number(query.limit || 100));
  return envelope({
    issuer_id: issuer.issuer_id,
    name: issuer.name,
    website: issuer.website,
    logo: issuer.logo,
    num_tokens: issuer.num_tokens,
    tokens: page.items,
    total_size: page.total_size,
    has_more: page.has_more,
  });
}

export function fixtureCryptoQuotes(query: Record<string, string>) {
  const ids = (query.id || "")
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
  const data: Record<string, unknown> = {};
  for (const asset of ASSETS) {
    for (const token of asset.tokens) {
      if (!ids.includes(token.crypto_id)) continue;
      data[String(token.crypto_id)] = {
        id: token.crypto_id,
        name: token.name,
        symbol: token.symbol,
        quote: {
          USD: {
            price: token.price,
            market_cap: token.market_cap,
            volume_24h: token.volume_24h,
            percent_change_24h: 0.4,
          },
        },
      };
    }
  }
  return envelope(data);
}

export function fixtureForPath(path: string, query: Record<string, string>) {
  if (path.includes("/real-world-assets/map")) return fixtureMap(query);
  if (path.includes("/real-world-assets/info")) return fixtureInfo(query);
  if (path.includes("/real-world-assets/assets/list")) return fixtureAssetList(query);
  if (path.includes("/real-world-assets/quotes/latest")) return fixtureQuotes(query);
  if (path.includes("/real-world-assets/market-pairs/list")) return fixtureMarketPairs(query);
  if (path.includes("/real-world-assets/issuers/list")) return fixtureIssuersList(query);
  if (path.includes("/real-world-assets/issuers")) return fixtureIssuer(query);
  if (path.includes("/cryptocurrency/quotes/latest")) return fixtureCryptoQuotes(query);
  return {
    data: null,
    status: {
      timestamp: new Date().toISOString(),
      error_code: 404,
      error_message: `No fixture for ${path}`,
      elapsed: 0,
      credit_count: 0,
    },
  };
}

export function fixtureTypeTotals() {
  const totals: Record<string, number> = { all: ASSETS.length };
  for (const type of ASSET_TYPES) {
    totals[type] = ASSETS.filter((asset) => asset.asset_type === type).length;
  }
  return totals;
}
