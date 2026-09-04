import { getScreener } from "@/lib/cmc/service";
import { parseAssetTypeParam } from "@/lib/search-params";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const data = await getScreener({
    q: url.searchParams.get("q") ?? undefined,
    assetType: parseAssetTypeParam(url.searchParams.get("type") ?? undefined),
    sort: url.searchParams.get("sort") ?? "rwa_rank",
    sortDir: url.searchParams.get("dir") === "desc" ? "desc" : "asc",
    start: Number(url.searchParams.get("start") || "1"),
    limit: Number(url.searchParams.get("limit") || "50"),
  });
  return Response.json(data);
}
