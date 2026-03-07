import { redirect } from "next/navigation";
import { createStarterDeck, getUserDecks } from "@/app/actions/deck";
import { CreateDeckForm } from "@/components/dashboard/create-deck-form";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DeckGrid } from "@/components/dashboard/deck-grid";

export default async function DashboardPage() {
  const decks = await getUserDecks();
  const totalCards = decks.reduce((sum, deck) => sum + deck._count.cards, 0);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Manage your decks and launch focused study sessions.</p>
      </header>

      <DashboardStats deckCount={decks.length} totalCards={totalCards} />

      {decks.length === 0 ? (
        <section className="space-y-4">
          <form
            action={async () => {
              "use server";
              const starterDeck = await createStarterDeck();
              redirect(`/deck/${starterDeck.id}`);
            }}
          >
            <button
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:bg-background"
              type="submit"
            >
              Create starter deck
            </button>
          </form>

          <CreateDeckForm />
        </section>
      ) : null}

      <DeckGrid decks={decks} />
    </div>
  );
}
