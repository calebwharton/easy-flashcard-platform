import Link from "next/link";
import { getOwnedDeck } from "@/app/actions/deck";
import { AddCardForm } from "@/components/deck/add-card-form";

type NewCardPageProps = {
  params: Promise<{ deckId: string }>;
};

export default async function NewCardPage({ params }: NewCardPageProps) {
  const { deckId } = await params;
  const deck = await getOwnedDeck(deckId);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">New card</h1>
        <p className="text-muted-foreground">Add a card to {deck.name}.</p>
      </header>

      <AddCardForm deckId={deckId} redirectTo={`/deck/${deckId}`} />

      <Link className="text-sm text-muted-foreground hover:text-foreground" href={`/deck/${deckId}`}>
        Back to deck
      </Link>
    </div>
  );
}
