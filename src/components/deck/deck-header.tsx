import Link from "next/link";
import { DeleteDeckButton } from "@/components/deck/delete-deck-button";

type DeckHeaderProps = {
  deck: {
    id: string;
    name: string;
    description: string | null;
  };
};

export function DeckHeader({ deck }: DeckHeaderProps) {
  return (
    <header className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <div>
        <h1 className="text-3xl font-semibold">{deck.name}</h1>
        <p className="mt-2 text-muted-foreground">{deck.description || "No description yet."}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-background" href={`/deck/${deck.id}/card/new`}>
          + Create New Card
        </Link>
        <Link className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-background" href={`/study/${deck.id}`}>
          Study
        </Link>
        <Link className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-background" href={`/deck/${deck.id}/import`}>
          Import TSV
        </Link>
        <Link className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-background" href={`/deck/${deck.id}/edit`}>
          Edit
        </Link>
        <DeleteDeckButton deckId={deck.id} deckName={deck.name} />
      </div>
    </header>
  );
}
