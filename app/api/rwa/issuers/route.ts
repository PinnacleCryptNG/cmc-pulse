import { getIssuers } from "@/lib/cmc/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const data = await getIssuers({
    start: Number(url.searchParams.get("start") || "1"),
    limit: Number(url.searchParams.get("limit") || "50"),
  });
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}
