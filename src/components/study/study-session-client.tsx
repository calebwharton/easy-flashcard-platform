"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { getNextIntervalPreview } from "@/lib/srs";
import { useSessionStats } from "@/hooks/useSessionStats";
import { gradeCard, getDueCards } from "@/app/actions/card";
import { DueCard, Grade } from "@/types";

type StudySessionClientProps = {
  deckId: string;
};

const gradeOptions: { label: string; value: Grade }[] = [
  { label: "Again", value: 0 },
  { label: "Hard", value: 1 },
  { label: "Good", value: 2 },
  { label: "Easy", value: 3 },
];

export function StudySessionClient({ deckId }: StudySessionClientProps) {
  const [cards, setCards] = useState<DueCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { stats, trackGrade, reset } = useSessionStats();

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      const dueCards = await getDueCards(deckId);
      if (mounted) {
        setCards(dueCards);
        setCurrentIndex(0);
        setFlipped(false);
        reset();
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [deckId, reset]);

  const done = currentIndex >= cards.length;
  const currentCard = cards[currentIndex];
  const progressPercent = useMemo(() => {
    if (!cards.length) return 0;
    return Math.round((currentIndex / cards.length) * 100);
  }, [cards.length, currentIndex]);

  const handleGrade = (grade: Grade) => {
    if (!currentCard) return;

    startTransition(async () => {
      await gradeCard(currentCard.id, grade);
      trackGrade(grade);
      setFlipped(false);
      setCurrentIndex((index) => index + 1);
    });
  };

  if (loading) {
    return <div className="rounded-2xl border border-border bg-card p-8 text-muted-foreground">Loading due cards...</div>;
  }

  if (!cards.length) {
    return <div className="rounded-2xl border border-border bg-card p-8 text-muted-foreground">No cards are due right now. Great progress.</div>;
  }

  if (done) {
    return (
      <div className="space-y-4 rounded-2xl border border-border bg-card p-8 text-center">
        <h2 className="font-serif text-3xl">Session complete</h2>
        <p className="text-muted-foreground">Reviewed {stats.reviewed} cards in this session.</p>
        <div className="mx-auto grid max-w-md grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-border bg-background p-3">Again: {stats.again}</div>
          <div className="rounded-xl border border-border bg-background p-3">Hard: {stats.hard}</div>
          <div className="rounded-xl border border-border bg-background p-3">Good: {stats.good}</div>
          <div className="rounded-xl border border-border bg-background p-3">Easy: {stats.easy}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="h-1 overflow-hidden rounded-full bg-border">
        <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progressPercent}%` }} />
      </div>
      <div className="rounded-2xl border border-border bg-card p-8 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out">
        <p className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {cards.length}
        </p>
        <p className="mt-8 text-center font-serif text-5xl leading-tight tracking-tight md:text-6xl">{currentCard.front}</p>
        {flipped ? (
          <>
            <p className="mx-auto mt-8 max-w-[52ch] text-center text-lg text-muted-foreground">{currentCard.back}</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-4">
              {gradeOptions.map((option) => (
                <button
                  key={option.label}
                  className="rounded-xl border border-border px-6 py-3 text-sm hover:brightness-95 disabled:opacity-50"
                  disabled={isPending}
                  onClick={() => handleGrade(option.value)}
                  type="button"
                >
                  {option.label}
                  <span className="ml-1 text-muted-foreground">
                    {getNextIntervalPreview(currentCard.progress, option.value)}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-8 text-center">
            <button className="rounded-xl border border-border px-6 py-3 text-muted-foreground hover:bg-background" onClick={() => setFlipped(true)} type="button">
              Reveal answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
