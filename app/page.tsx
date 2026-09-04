import { SiteHeader } from "@/components/site-header";
import { StatusBanner } from "@/components/status-banner";
import { ScreenerView } from "@/components/screener-view";
import { getScreener } from "@/lib/cmc/service";
import { firstParam, parseAssetTypeParam } from "@/lib/search-params";

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
    sort: firstParam(params.sort) || "rwa_rank",
    sortDir: firstParam(params.dir) === "desc" ? "desc" : "asc",
    start: Number.isFinite(start) ? start : 1,
    limit: 50,
  });

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader evidence={data.evidence} source={data.source} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-6">
        <StatusBanner source={data.source} warning={data.warning} />
        <ScreenerView data={data} />
      </main>
    </div>
  );
}
