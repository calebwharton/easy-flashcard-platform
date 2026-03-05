import Link from "next/link";
import { getOwnedDeck } from "@/app/actions/deck";
import { StudySessionClient } from "@/components/study/study-session-client";

type StudyPageProps = {
  params: Promise<{ deckId: string }>;
};

export default async function StudyPage({ params }: StudyPageProps) {
  const { deckId } = await params;
  const deck = await getOwnedDeck(deckId);

  return (
    <div className="mx-auto flex w-full max-w-175 flex-col gap-6">
      <header className="text-center">
        <h1 className="font-serif text-4xl">Study session</h1>
        <p className="mt-2 text-muted-foreground">{deck.name}</p>
      </header>
      <StudySessionClient deckId={deck.id} />
      <div className="text-center">
        <Link className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-card" href={`/deck/${deck.id}`}>
          Back to deck
        </Link>
      </div>
    </div>
  );
}
