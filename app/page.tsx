import { redirect } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { OverviewView } from "@/components/overview-view";
import { getScreener } from "@/lib/cmc/service";
import { firstParam, parseAssetTypeParam, screenerHref } from "@/lib/search-params";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  if (
    firstParam(params.q) ||
    firstParam(params.type) ||
    firstParam(params.sort) ||
    firstParam(params.dir) ||
    firstParam(params.start)
  ) {
    redirect(
      screenerHref(
        {},
        {
          q: firstParam(params.q),
          type: parseAssetTypeParam(firstParam(params.type)),
          sort: firstParam(params.sort),
          dir: firstParam(params.dir),
          start: firstParam(params.start),
        },
      ),
    );
  }

  const [ranked, byVolume, byMcap] = await Promise.all([
    getScreener({ sort: "rwa_rank", sortDir: "asc", limit: 50 }),
    getScreener({ sort: "tokenized_volume_24h", sortDir: "desc", limit: 10 }),
    getScreener({ sort: "tokenized_market_cap", sortDir: "desc", limit: 10 }),
  ]);

  return (
    <AppFrame
      evidence={[...ranked.evidence, ...byVolume.evidence, ...byMcap.evidence]}
      source={ranked.source}
      warning={ranked.warning ?? byVolume.warning ?? byMcap.warning}
    >
      <OverviewView ranked={ranked} byVolume={byVolume} byMcap={byMcap} />
    </AppFrame>
  );
}
