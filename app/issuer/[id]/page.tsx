import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { IssuerBookView } from "@/components/issuer-book-view";
import { getIssuerBook } from "@/lib/cmc/service";

export const dynamic = "force-dynamic";

export default async function IssuerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getIssuerBook(id);
  if (!book.issuer) notFound();

  return (
    <AppFrame evidence={book.evidence} source={book.source} warning={book.warning}>
      <IssuerBookView book={book} />
    </AppFrame>
  );
}
