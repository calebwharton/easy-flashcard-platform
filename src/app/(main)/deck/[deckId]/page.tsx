import { getDeckCards } from "@/app/actions/card";
import { getOwnedDeck } from "@/app/actions/deck";
import { CardList } from "@/components/deck/card-list";
import { DeckHeader } from "@/components/deck/deck-header";

type DeckPageProps = {
  params: Promise<{ deckId: string }>;
};

export default async function DeckPage({ params }: DeckPageProps) {
  const { deckId } = await params;
  const [deck, cards] = await Promise.all([getOwnedDeck(deckId), getDeckCards(deckId)]);

  return (
    <div className="space-y-6">
      <DeckHeader deck={deck} />
      <CardList deckId={deckId} cards={cards} />
    </div>
  );
}
