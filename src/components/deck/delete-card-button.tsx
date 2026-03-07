import { deleteCard } from "@/app/actions/card";

type DeleteCardButtonProps = {
  cardId: string;
  cardFront: string;
};

export function DeleteCardButton({ cardId, cardFront }: DeleteCardButtonProps) {
  return (
    <form
      action={async () => {
        "use server";
        await deleteCard(cardId);
      }}
    >
      <button
        aria-label={`Delete card: ${cardFront}`}
        className="rounded-xl bg-warning/20 px-3 py-1.5 text-sm text-warning-foreground hover:brightness-95"
        type="submit"
      >
        Delete
      </button>
    </form>
  );
}
