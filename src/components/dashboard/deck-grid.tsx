import { DeckCard } from "@/components/dashboard/deck-card";

type DeckGridProps = {
  decks: {
    id: string;
    name: string;
    description: string | null;
    language: string | null;
    _count: {
      cards: number;
    };
  }[];
};

export function DeckGrid({ decks }: DeckGridProps) {
  if (decks.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-muted-foreground">
        No decks yet. Create your first deck to start studying.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {decks.map((deck) => (
        <DeckCard key={deck.id} deck={deck} />
      ))}
    </div>
  );
}
