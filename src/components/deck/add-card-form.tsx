import { redirect } from "next/navigation";
import { addCard } from "@/app/actions/card";

type AddCardFormProps = {
  deckId: string;
  redirectTo?: string;
};

export function AddCardForm({ deckId, redirectTo }: AddCardFormProps) {
  return (
    <form
      className="space-y-3 rounded-2xl border border-border bg-card p-5"
      action={async (formData) => {
        "use server";

        const tagsRaw = String(formData.get("tags") || "");
        const tags = tagsRaw
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);

        await addCard(deckId, {
          front: String(formData.get("front") || ""),
          back: String(formData.get("back") || ""),
          tags,
        });

        if (redirectTo) {
          redirect(redirectTo);
        }
      }}
    >
      <p className="text-lg font-medium">Add card</p>
      <div className="space-y-2">
        <label className="block text-sm text-muted-foreground" htmlFor="card-front">
          Front
        </label>
        <input className="w-full rounded-xl border border-border bg-background px-3 py-2" id="card-front" name="front" placeholder="decir" required />
      </div>
      <div className="space-y-2">
        <label className="block text-sm text-muted-foreground" htmlFor="card-back">
          Back
        </label>
        <textarea className="w-full rounded-xl border border-border bg-background px-3 py-2" id="card-back" name="back" placeholder="to say / to tell" rows={3} required />
      </div>
      <div className="space-y-2">
        <label className="block text-sm text-muted-foreground" htmlFor="card-tags">
          Tags
        </label>
        <input className="w-full rounded-xl border border-border bg-background px-3 py-2" id="card-tags" name="tags" placeholder="verb, high-frequency" />
      </div>
      <button className="rounded-xl bg-primary px-4 py-2 text-primary-foreground hover:brightness-95" type="submit">
        Add Card
      </button>
    </form>
  );
}
