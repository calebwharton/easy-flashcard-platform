type CardListProps = {
  cards: {
    id: string;
    front: string;
    back: string;
    tags: string[];
  }[];
};

function CardRow({
  card,
}: {
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
    </li>
  );
}

export function CardList({ cards }: CardListProps) {
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
          <CardRow key={card.id} card={card} />
        ))}
      </ul>
    </section>
  );
}
