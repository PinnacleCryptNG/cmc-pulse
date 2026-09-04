import { getIssuerBook } from "@/lib/cmc/service";
import { isIssuerIdParam } from "@/lib/search-params";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!isIssuerIdParam(id)) {
    return Response.json(
      { error: "Invalid issuer_id" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
  const data = await getIssuerBook(id);
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}
