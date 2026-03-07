"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteDeck } from "@/app/actions/deck";

type DeleteDeckButtonProps = {
  deckId: string;
  deckName: string;
};

export function DeleteDeckButton({ deckId, deckName }: DeleteDeckButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    setErrorMessage(null);

    startTransition(() => {
      void (async () => {
        try {
          await deleteDeck(deckId);
          setIsOpen(false);
          router.push("/dashboard");
          router.refresh();
        } catch {
          setErrorMessage("Could not delete deck. Please try again.");
        }
      })();
    });
  };

  return (
    <>
      <button
        aria-label={`Delete deck: ${deckName}`}
        className="rounded-xl bg-warning/20 px-4 py-2 text-sm text-warning-foreground hover:brightness-95"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Delete
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div aria-modal="true" className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl" role="dialog">
            <h2 className="text-lg font-semibold">Delete deck?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This will permanently delete <span className="font-medium text-foreground">{deckName}</span> and all cards in it.
            </p>

            {errorMessage ? <p className="mt-3 text-sm text-warning-foreground">{errorMessage}</p> : null}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-background"
                disabled={isPending}
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-warning/20 px-4 py-2 text-sm text-warning-foreground hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isPending}
                onClick={handleDelete}
                type="button"
              >
                {isPending ? "Deleting..." : "Delete deck"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
