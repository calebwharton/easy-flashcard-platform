import Link from "next/link";
import { redirect } from "next/navigation";
import { getOwnedDeck } from "@/app/actions/deck";
import { updateDeck } from "@/app/actions/deck";

type DeckEditPageProps = {
  params: Promise<{ deckId: string }>;
};

export default async function DeckEditPage({ params }: DeckEditPageProps) {
  const { deckId } = await params;
  const deck = await getOwnedDeck(deckId);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Edit deck</h1>
        <p className="text-muted-foreground">Update your deck details and return to management.</p>
      </header>

      <form
        className="space-y-3 rounded-2xl border border-border bg-card p-5"
        action={async (formData) => {
          "use server";

          await updateDeck(deckId, {
            name: String(formData.get("name") || ""),
            description: String(formData.get("description") || ""),
            type: String(formData.get("type") || "Spanish"),
          });

          redirect(`/deck/${deckId}`);
        }}
      >
        <p className="text-lg font-medium">Deck settings</p>
        <div className="space-y-2">
          <label className="block text-sm text-muted-foreground" htmlFor="deck-name">
            Name
          </label>
          <input className="w-full rounded-xl border border-border bg-background px-3 py-2" defaultValue={deck.name} id="deck-name" name="name" required />
        </div>
        <div className="space-y-2">
          <label className="block text-sm text-muted-foreground" htmlFor="deck-description">
            Description
          </label>
          <textarea
            className="w-full rounded-xl border border-border bg-background px-3 py-2"
            defaultValue={deck.description ?? ""}
            id="deck-description"
            name="description"
            placeholder="High-frequency vocabulary"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm text-muted-foreground" htmlFor="deck-type">
            Type
          </label>
          <input
            className="w-full rounded-xl border border-border bg-background px-3 py-2"
            defaultValue={deck.language || "Spanish"}
            id="deck-type"
            name="type"
            placeholder="Spanish"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-xl bg-primary px-4 py-2 text-primary-foreground hover:brightness-95" type="submit">
            Save changes
          </button>
          <Link className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-background" href={`/deck/${deck.id}`}>
            Cancel
          </Link>
        </div>
      </form>

      <div>
        <Link className="inline-block rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-background" href={`/deck/${deck.id}`}>
          Back to deck
        </Link>
      </div>
    </div>
  );
}
