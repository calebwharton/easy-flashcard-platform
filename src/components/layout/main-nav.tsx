import Link from "next/link";
import { signOut } from "@/lib/auth";

export function MainNav() {
  return (
    <header className="border-b border-border bg-card/70">
      <div className="mx-auto flex w-full max-w-[72ch] items-center justify-between px-4 py-4 md:px-0">
        <div>
          <p className="font-serif text-xl">Spanish Flashcards</p>
          <p className="text-sm text-muted-foreground">Calm spaced repetition</p>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link className="text-muted-foreground hover:text-foreground" href="/dashboard">
            Dashboard
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
