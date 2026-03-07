import Link from "next/link";
import { DeleteCardButton } from "@/components/deck/delete-card-button";

type CardListProps = {
  deckId: string;
  cards: {
    id: string;
    front: string;
    back: string;
    tags: string[];
  }[];
};

function CardRow({
  deckId,
  card,
}: {
  deckId: string;
  card: {
    id: string;
    front: string;
    back: string;
    tags: string[];
  };
}) {
  return (
    <li className="rounded-xl border border-border bg-background p-4">
      <p className="font-medium">{card.front}</p>
      <p className="mt-1 text-muted-foreground">{card.back}</p>
      {card.tags.length > 0 ? <p className="mt-2 text-sm text-muted-foreground">{card.tags.join(", ")}</p> : null}
      <div className="mt-3 flex items-center gap-2">
        <Link
          className="rounded-xl border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-card"
          href={`/deck/${deckId}/card/${card.id}/edit`}
        >
          Edit
        </Link>
        <DeleteCardButton cardId={card.id} cardFront={card.front} />
      </div>
    </li>
  );
}

export function CardList({ deckId, cards }: CardListProps) {
  if (cards.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-medium">Cards</h2>
        <p className="mt-2 text-muted-foreground">No cards yet. Add your first one using the form.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <h2 className="text-xl font-medium">Cards</h2>
      <ul className="space-y-3">
        {cards.map((card) => (
          <CardRow key={card.id} card={card} deckId={deckId} />
        ))}
      </ul>
    </section>
  );
}
