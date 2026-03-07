import Link from "next/link";
import { redirect } from "next/navigation";
import { getOwnedCard, updateCard } from "@/app/actions/card";

type EditCardPageProps = {
  params: Promise<{ deckId: string; cardId: string }>;
};

export default async function EditCardPage({ params }: EditCardPageProps) {
  const { deckId, cardId } = await params;
  const card = await getOwnedCard(deckId, cardId);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Edit card</h1>
        <p className="text-muted-foreground">Update this card and return to your deck.</p>
      </header>

      <form
        className="space-y-3 rounded-2xl border border-border bg-card p-5"
        action={async (formData) => {
          "use server";

          const tagsRaw = String(formData.get("tags") || "");
          const tags = tagsRaw
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);

          await updateCard(cardId, {
            front: String(formData.get("front") || ""),
            back: String(formData.get("back") || ""),
            tags,
          });

          redirect(`/deck/${deckId}`);
        }}
      >
        <div className="space-y-2">
          <label className="block text-sm text-muted-foreground" htmlFor="card-front">
            Front
          </label>
          <input
            className="w-full rounded-xl border border-border bg-background px-3 py-2"
            defaultValue={card.front}
            id="card-front"
            name="front"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm text-muted-foreground" htmlFor="card-back">
            Back
          </label>
          <textarea
            className="w-full rounded-xl border border-border bg-background px-3 py-2"
            defaultValue={card.back}
            id="card-back"
            name="back"
            required
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm text-muted-foreground" htmlFor="card-tags">
            Tags
          </label>
          <input
            className="w-full rounded-xl border border-border bg-background px-3 py-2"
            defaultValue={card.tags.join(", ")}
            id="card-tags"
            name="tags"
            placeholder="verb, high-frequency"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-xl bg-primary px-4 py-2 text-primary-foreground hover:brightness-95" type="submit">
            Save changes
          </button>
          <Link className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-background" href={`/deck/${deckId}`}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
