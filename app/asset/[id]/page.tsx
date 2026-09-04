import { AssetDeskView } from "@/components/asset-desk-view";
import { SiteHeader } from "@/components/site-header";
import { StatusBanner } from "@/components/status-banner";
import { getAssetDesk } from "@/lib/cmc/service";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const desk = await getAssetDesk(id);

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader evidence={desk.evidence} source={desk.source} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-6">
        <StatusBanner source={desk.source} warning={desk.warning} />
        <AssetDeskView desk={desk} rwaId={id} />
      </main>
    </div>
  );
}
