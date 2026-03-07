import { redirect } from "next/navigation";
import { deleteDeck } from "@/app/actions/deck";

type DeleteDeckButtonProps = {
  deckId: string;
  deckName: string;
};

export function DeleteDeckButton({ deckId, deckName }: DeleteDeckButtonProps) {
  return (
    <form
      action={async () => {
        "use server";
        await deleteDeck(deckId);
        redirect("/dashboard");
      }}
    >
      <button
        aria-label={`Delete deck: ${deckName}`}
        className="rounded-xl bg-warning/20 px-4 py-2 text-sm text-warning-foreground hover:brightness-95"
        type="submit"
      >
        Delete
      </button>
    </form>
  );
}
