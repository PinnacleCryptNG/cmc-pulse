import { AppFrame } from "@/components/app-frame";
import { AssetDeskView } from "@/components/asset-desk-view";
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
    <AppFrame evidence={desk.evidence} source={desk.source} warning={desk.warning}>
      <AssetDeskView desk={desk} rwaId={id} />
    </AppFrame>
  );
}
