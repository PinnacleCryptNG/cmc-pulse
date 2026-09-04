import { redirect } from "next/navigation";
import {
  firstParam,
  parseAssetTypeParam,
  screenerHref,
} from "@/lib/search-params";

export const dynamic = "force-dynamic";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
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
