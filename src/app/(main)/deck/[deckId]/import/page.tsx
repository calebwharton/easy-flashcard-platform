import Link from "next/link";
import { getOwnedDeck } from "@/app/actions/deck";
import { ImportFlow } from "@/components/deck/import-flow";

type DeckImportPageProps = {
  params: Promise<{ deckId: string }>;
};

export default async function DeckImportPage({ params }: DeckImportPageProps) {
  const { deckId } = await params;
  const deck = await getOwnedDeck(deckId);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Import cards</h1>
        <p className="text-muted-foreground">Deck: {deck.name}</p>
      </header>
      <ImportFlow deckId={deck.id} />
      <Link className="inline-block rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-card" href={`/deck/${deck.id}`}>
        Back to deck
      </Link>
    </div>
  );
}
