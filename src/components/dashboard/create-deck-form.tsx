import { redirect } from "next/navigation";
import { createDeck } from "@/app/actions/deck";

export function CreateDeckForm() {
  return (
    <form
      className="space-y-3 rounded-2xl border border-border bg-card p-5"
      action={async (formData) => {
        "use server";

        const deck = await createDeck({
          name: String(formData.get("name") || ""),
          description: String(formData.get("description") || ""),
          language: String(formData.get("language") || "Spanish"),
        });

        redirect(`/deck/${deck.id}`);
      }}
    >
      <p className="text-lg font-medium">Create deck</p>
      <div className="space-y-2">
        <label className="block text-sm text-muted-foreground" htmlFor="deck-name">
          Name
        </label>
        <input className="w-full rounded-xl border border-border bg-background px-3 py-2" id="deck-name" name="name" placeholder="Spanish Core Verbs" required />
      </div>
      <div className="space-y-2">
        <label className="block text-sm text-muted-foreground" htmlFor="deck-description">
          Description
        </label>
        <textarea className="w-full rounded-xl border border-border bg-background px-3 py-2" id="deck-description" name="description" placeholder="High-frequency vocabulary" rows={3} />
      </div>
      <button className="rounded-xl bg-primary px-4 py-2 text-primary-foreground hover:brightness-95" type="submit">
        Create Deck
      </button>
    </form>
  );
}
