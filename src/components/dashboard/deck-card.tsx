import Link from "next/link";

type DeckCardProps = {
  deck: {
    id: string;
    name: string;
    description: string | null;
    language: string | null;
    _count: {
      cards: number;
    };
  };
};

export function DeckCard({ deck }: DeckCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out">
      <p className="font-medium">{deck.name}</p>
      <p className="mt-1 line-clamp-2 min-h-10 text-sm text-muted-foreground">{deck.description || "No description yet."}</p>
      <p className="mt-3 text-sm text-muted-foreground">
        {deck.language || "Spanish"} · {deck._count.cards} cards
      </p>
      <div className="mt-4 flex gap-2">
        <Link className="rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-background" href={`/deck/${deck.id}`}>
          Manage
        </Link>
        <Link className="rounded-xl bg-accent px-3 py-2 text-sm text-accent-foreground hover:brightness-95" href={`/study/${deck.id}`}>
          Study
        </Link>
      </div>
    </article>
  );
}
