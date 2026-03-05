import Link from "next/link";
import { getOwnedDeck } from "@/app/actions/deck";

type DeckEditPageProps = {
  params: Promise<{ deckId: string }>;
};

export default async function DeckEditPage({ params }: DeckEditPageProps) {
  const { deckId } = await params;
  const deck = await getOwnedDeck(deckId);

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <h1 className="text-3xl font-semibold">Deck settings</h1>
      <p className="text-muted-foreground">This MVP version keeps editing lightweight. You can review metadata and return to management.</p>
      <div className="rounded-xl border border-border bg-background p-4 text-sm">
        <p>Name: {deck.name}</p>
        <p>Description: {deck.description || "None"}</p>
        <p>Language: {deck.language || "Spanish"}</p>
      </div>
      <Link className="inline-block rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-background" href={`/deck/${deck.id}`}>
        Back to deck
      </Link>
    </div>
  );
}
