import { firstParam } from "@/lib/search-params";
import { AppFrame } from "@/components/app-frame";
import { IssuerDirectory } from "@/components/issuer-directory";
import { getIssuers } from "@/lib/cmc/service";

export const dynamic = "force-dynamic";

export default async function IssuersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const start = Number(firstParam(params.start) || "1");
  const data = await getIssuers({
    start: Number.isFinite(start) && start > 0 ? start : 1,
    limit: 50,
  });

  return (
    <AppFrame evidence={data.evidence} source={data.source} warning={data.warning}>
      <IssuerDirectory data={data} />
    </AppFrame>
  );
}
