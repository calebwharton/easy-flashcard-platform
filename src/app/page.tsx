import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";

const faqs = [
  {
    question: "What is this app for?",
    answer:
      "This is a Spanish flashcard app that helps you build decks, review cards with spaced repetition, and track study progress over time.",
  },
  {
    question: "Do I need to create cards manually?",
    answer:
      "You can create cards one by one, or import existing card content into a deck and start studying right away.",
  },
  {
    question: "How does review scheduling work?",
    answer:
      "Cards are scheduled with a spaced-repetition approach, so harder cards come back sooner while easier cards are shown less often.",
  },
  {
    question: "Can I use this on mobile?",
    answer:
      "Yes. The interface is responsive and designed for both desktop and mobile study sessions.",
  },
];

export default async function Home() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(142,151,117,0.2),rgba(248,247,244,0))]" />

      <main className="relative mx-auto flex w-full max-w-5xl flex-col gap-14 px-5 py-12 md:px-8 md:py-16">
        <header className="rounded-3xl border border-border bg-card/90 p-7 shadow-[0_24px_48px_-28px_rgba(60,60,60,0.35)] md:p-10">
          <div className="max-w-3xl space-y-5">
            <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Spanish Flashcards
            </p>

            <h1 className="font-serif text-4xl leading-tight md:text-5xl">
              Study smarter with calm, focused spaced repetition.
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Build custom Spanish decks, review the right cards at the right time, and stay consistent with a workflow
              made for daily practice.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/login"
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Log In to Start Studying
              </Link>
              <a
                href="#faq"
                className="rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold transition hover:bg-card"
              >
                View FAQs
              </a>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3" aria-label="Highlights">
          <article className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-serif text-2xl">Deck-Based Learning</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Organize vocabulary, grammar patterns, and example sentences into focused decks.
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-serif text-2xl">Spaced Review</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Spend time on cards you are likely to forget and reinforce what you already know.
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-serif text-2xl">Progress Rhythm</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Keep daily momentum with study sessions built for short, consistent practice.
            </p>
          </article>
        </section>

        <section id="faq" className="space-y-5 rounded-3xl border border-border bg-card p-7 md:p-9">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">FAQs</p>
            <h2 className="mt-2 font-serif text-3xl">Questions Before You Begin?</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-xl border border-border bg-background px-4 py-3">
                <summary className="cursor-pointer list-none pr-7 text-sm font-semibold">
                  {faq.question}
                  <span className="float-right text-muted-foreground transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
