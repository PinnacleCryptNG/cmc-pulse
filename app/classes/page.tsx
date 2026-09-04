import { AppFrame } from "@/components/app-frame";
import { ClassesView } from "@/components/classes-view";
import { getScreener } from "@/lib/cmc/service";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const data = await getScreener({ limit: 1 });
  return (
    <AppFrame evidence={data.evidence} source={data.source} warning={data.warning}>
      <ClassesView counts={data.typeCounts} />
    </AppFrame>
  );
}
