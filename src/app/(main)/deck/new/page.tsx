import Link from "next/link";
import { CreateDeckForm } from "@/components/dashboard/create-deck-form";

export default function NewDeckPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">New deck</h1>
        <p className="text-muted-foreground">Create a new deck and jump back to your dashboard.</p>
      </header>

      <CreateDeckForm redirectTo="/dashboard" />

      <Link className="text-sm text-muted-foreground hover:text-foreground" href="/dashboard">
        Back to dashboard
      </Link>
    </div>
  );
}
