import { CardProgressInput, Grade } from "@/types";

const DAY_MS = 24 * 60 * 60 * 1000;

const defaultProgress: CardProgressInput = {
  interval: 0,
  easeFactor: 2.5,
  repetitions: 0,
  dueDate: new Date(),
  lapses: 0,
  lastReview: null,
};

export function calculateNextReview(
  progress: Partial<CardProgressInput> | null,
  grade: Grade,
  now = new Date(),
): CardProgressInput {
  const merged = { ...defaultProgress, ...progress };

  let interval = merged.interval;
  let easeFactor = merged.easeFactor;
  let repetitions = merged.repetitions;
  let lapses = merged.lapses;

  if (grade === 0) {
    lapses += 1;
    interval = 1;
    repetitions = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else {
    if (repetitions === 0) {
      interval = grade === 3 ? 4 : 1;
    } else if (repetitions === 1) {
      interval = grade === 3 ? 6 : 3;
    } else {
      const multiplier = grade === 1 ? 1.2 : grade === 2 ? easeFactor : easeFactor * 1.3;
      interval = Math.max(1, Math.round(interval * multiplier));
    }

    const quality = grade + 2;
    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
    );
    repetitions += 1;
  }

  return {
    interval,
    easeFactor,
    repetitions,
    dueDate: new Date(now.getTime() + interval * DAY_MS),
    lapses,
    lastReview: now,
  };
}

export function getNextIntervalPreview(
  progress: Partial<CardProgressInput> | null,
  grade: Grade,
  now = new Date(),
): string {
  const next = calculateNextReview(progress, grade, now);
  const days = next.interval;

  if (days < 1) return "<1d";
  if (days < 30) return `${days}d`;

  const months = Math.round((days / 30) * 10) / 10;
  if (days < 365) return `${months}mo`;

  const years = Math.round((days / 365) * 10) / 10;
  return `${years}y`;
}
