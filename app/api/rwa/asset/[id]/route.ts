import { getAssetDesk } from "@/lib/cmc/service";
import { isRwaIdParam } from "@/lib/search-params";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!isRwaIdParam(id)) {
    return Response.json(
      { error: "Invalid rwa_id" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
  const data = await getAssetDesk(id);
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}
