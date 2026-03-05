import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="font-serif text-3xl">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to manage decks and continue your study sessions.</p>
      </header>

      <div className="space-y-3">
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button className="w-full rounded-xl border border-border px-4 py-2 hover:bg-background" type="submit">
            Continue with Google
          </button>
        </form>

        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/dashboard" });
          }}
        >
          <button className="w-full rounded-xl border border-border px-4 py-2 hover:bg-background" type="submit">
            Continue with GitHub
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground">Configure OAuth keys in env vars to enable provider login.</p>
    </div>
  );
}
