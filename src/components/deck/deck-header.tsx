import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteDeck } from "@/app/actions/deck";

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
        <Link className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-background" href={`/study/${deck.id}`}>
          Study
        </Link>
        <Link className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-background" href={`/deck/${deck.id}/import`}>
          Import TSV
        </Link>
        <Link className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-background" href={`/deck/${deck.id}/edit`}>
          Edit
        </Link>
        <form
          action={async () => {
            "use server";
            await deleteDeck(deck.id);
            redirect("/dashboard");
          }}
        >
          <button className="rounded-xl bg-warning/20 px-4 py-2 text-sm text-warning-foreground hover:brightness-95" type="submit">
            Delete
          </button>
        </form>
      </div>
    </header>
  );
}
