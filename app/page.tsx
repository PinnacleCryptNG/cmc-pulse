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

  const ranked = await getScreener({ sort: "rwa_rank", sortDir: "asc", limit: 50 });

  return (
    <AppFrame evidence={ranked.evidence} source={ranked.source} warning={ranked.warning}>
      <OverviewView ranked={ranked} />
    </AppFrame>
  );
}
