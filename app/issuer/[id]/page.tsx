import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { IssuerBookView } from "@/components/issuer-book-view";
import { getIssuerBook } from "@/lib/cmc/service";
import { isIssuerIdParam } from "@/lib/search-params";

export const dynamic = "force-dynamic";

export default async function IssuerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isIssuerIdParam(id)) notFound();
  const book = await getIssuerBook(id);
  if (!book.issuer) notFound();

  return (
    <AppFrame evidence={book.evidence} source={book.source} warning={book.warning}>
      <IssuerBookView book={book} />
    </AppFrame>
  );
}
