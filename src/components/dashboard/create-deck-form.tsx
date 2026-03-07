import { redirect } from "next/navigation";
import { createDeck } from "@/app/actions/deck";

type CreateDeckFormProps = {
  redirectTo?: string;
  heading?: string;
  submitLabel?: string;
};

export function CreateDeckForm({
  redirectTo,
  heading = "Create deck",
  submitLabel = "Create Deck",
}: CreateDeckFormProps = {}) {
  return (
    <form
      className="space-y-3 rounded-2xl border border-border bg-card p-5"
      action={async (formData) => {
        "use server";

        const deck = await createDeck({
          name: String(formData.get("name") || ""),
          description: String(formData.get("description") || ""),
          type: String(formData.get("type") || "Spanish"),
        });

        if (redirectTo) {
          redirect(redirectTo);
        }

        redirect(`/deck/${deck.id}`);
      }}
    >
      <p className="text-lg font-medium">{heading}</p>
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
      <div className="space-y-2">
        <label className="block text-sm text-muted-foreground" htmlFor="deck-type">
          Type
        </label>
        <input className="w-full rounded-xl border border-border bg-background px-3 py-2" id="deck-type" name="type" placeholder="Spanish" />
      </div>
      <button className="rounded-xl bg-primary px-4 py-2 text-primary-foreground hover:brightness-95" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
