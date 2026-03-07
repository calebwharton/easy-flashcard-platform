import Link from "next/link";
import { signOut } from "@/lib/auth";

export function MainNav() {
  return (
    <header className="border-b border-border bg-card/70">
      <div className="relative flex w-full items-center justify-end px-4 py-4 md:px-6">
        <Link className="absolute left-1/2 -translate-x-1/2 text-center" href="/dashboard">
          <p className="font-serif text-xl">Caleb&apos;s Flashcards</p>
          <p className="text-sm text-muted-foreground">Calm spaced repetition</p>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            aria-label="Create New Deck"
            className="rounded-xl border border-border px-3 py-1.5 text-muted-foreground hover:bg-background hover:text-foreground"
            href="/deck/new"
            title="Create New Deck"
          >
            + Create New Deck
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="rounded-xl border border-border px-3 py-1.5 text-muted-foreground hover:bg-background" type="submit">
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
