import { getIssuerBook } from "@/lib/cmc/service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const data = await getIssuerBook(id);
  return Response.json(data);
}
