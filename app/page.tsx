import { AppFrame } from "@/components/app-frame";
import { DeskIntro } from "@/components/desk-intro";
import { MarketDeskView } from "@/components/market-desk-view";
import { getScreener } from "@/lib/cmc/service";
import {
  firstParam,
  parseAssetTypeParam,
  parseSortDir,
  parseSortParam,
} from "@/lib/search-params";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const start = Number(firstParam(params.start) || "1");
  const data = await getScreener({
    q: firstParam(params.q),
    assetType: parseAssetTypeParam(firstParam(params.type)),
    sort: parseSortParam(firstParam(params.sort)),
    sortDir: parseSortDir(firstParam(params.dir)),
    start: Number.isFinite(start) && start > 0 ? start : 1,
    limit: 50,
  });

  return (
    <AppFrame evidence={data.evidence} source={data.source} warning={data.warning}>
      <DeskIntro />
      <MarketDeskView data={data} />
    </AppFrame>
  );
}
