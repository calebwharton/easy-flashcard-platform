"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateNextReview } from "@/lib/srs";
import { DueCard, Grade } from "@/types";

const addCardSchema = z.object({
  front: z.string().trim().min(1).max(500),
  back: z.string().trim().min(1).max(2000),
  tags: z.array(z.string().trim().min(1).max(50)).default([]),
});

const gradeSchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]);

async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}

async function requireOwnedDeck(deckId: string, userId: string) {
  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId,
    },
  });

  if (!deck) {
    throw new Error("Deck not found");
  }

  return deck;
}

async function requireOwnedCard(cardId: string, userId: string) {
  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
      deck: {
        userId,
      },
    },
    select: {
      id: true,
      deckId: true,
    },
  });

  if (!card) {
    throw new Error("Card not found");
  }

  return card;
}

export async function addCard(
  deckId: string,
  data: {
    front: string;
    back: string;
    tags?: string[];
  },
) {
  const userId = await requireUserId();
  await requireOwnedDeck(deckId, userId);

  const parsed = addCardSchema.parse(data);

  const card = await prisma.card.create({
    data: {
      deckId,
      front: parsed.front,
      back: parsed.back,
      tags: parsed.tags,
    },
  });

  revalidatePath(`/deck/${deckId}`);
  revalidatePath(`/study/${deckId}`);

  return card;
}

export async function getDueCards(deckId: string): Promise<DueCard[]> {
  const userId = await requireUserId();
  await requireOwnedDeck(deckId, userId);

  const now = new Date();

  const cards = await prisma.card.findMany({
    where: {
      deckId,
      OR: [
        {
          progress: {
            none: {
              userId,
            },
          },
        },
        {
          progress: {
            some: {
              userId,
              dueDate: { lte: now },
            },
          },
        },
      ],
    },
    include: {
      progress: {
        where: { userId },
        take: 1,
      },
    },
    orderBy: [{ createdAt: "asc" }],
    take: 50,
  });

  return cards.map((card) => ({
    id: card.id,
    deckId: card.deckId,
    front: card.front,
    back: card.back,
    tags: card.tags,
    progress: card.progress[0]
      ? {
          interval: card.progress[0].interval,
          easeFactor: card.progress[0].easeFactor,
          repetitions: card.progress[0].repetitions,
          dueDate: card.progress[0].dueDate,
          lapses: card.progress[0].lapses,
          lastReview: card.progress[0].lastReview,
        }
      : null,
  }));
}

export async function gradeCard(cardId: string, grade: Grade) {
  const userId = await requireUserId();
  const parsedGrade = gradeSchema.parse(grade);

  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
      deck: {
        userId,
      },
    },
    select: {
      id: true,
      deckId: true,
    },
  });

  if (!card) {
    throw new Error("Card not found");
  }

  const existingProgress = await prisma.cardProgress.findUnique({
    where: {
      cardId_userId: {
        cardId,
        userId,
      },
    },
  });

  const next = calculateNextReview(
    existingProgress
      ? {
          interval: existingProgress.interval,
          easeFactor: existingProgress.easeFactor,
          repetitions: existingProgress.repetitions,
          dueDate: existingProgress.dueDate,
          lapses: existingProgress.lapses,
          lastReview: existingProgress.lastReview,
        }
      : null,
    parsedGrade,
  );

  const progress = await prisma.cardProgress.upsert({
    where: {
      cardId_userId: {
        cardId,
        userId,
      },
    },
    update: {
      interval: next.interval,
      easeFactor: next.easeFactor,
      repetitions: next.repetitions,
      dueDate: next.dueDate,
      lapses: next.lapses,
      lastReview: next.lastReview,
    },
    create: {
      cardId,
      userId,
      interval: next.interval,
      easeFactor: next.easeFactor,
      repetitions: next.repetitions,
      dueDate: next.dueDate,
      lapses: next.lapses,
      lastReview: next.lastReview,
    },
  });

  revalidatePath(`/deck/${card.deckId}`);
  revalidatePath(`/study/${card.deckId}`);

  return progress;
}

export async function getDeckCards(deckId: string) {
  const userId = await requireUserId();
  await requireOwnedDeck(deckId, userId);

  return prisma.card.findMany({
    where: { deckId },
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function getOwnedCard(deckId: string, cardId: string) {
  const userId = await requireUserId();
  await requireOwnedDeck(deckId, userId);

  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
      deckId,
    },
    select: {
      id: true,
      deckId: true,
      front: true,
      back: true,
      tags: true,
    },
  });

  if (!card) {
    throw new Error("Card not found");
  }

  return card;
}

export async function updateCard(
  cardId: string,
  data: {
    front: string;
    back: string;
    tags?: string[];
  },
) {
  const userId = await requireUserId();
  const ownedCard = await requireOwnedCard(cardId, userId);
  const parsed = addCardSchema.parse(data);

  const updated = await prisma.card.update({
    where: { id: cardId },
    data: {
      front: parsed.front,
      back: parsed.back,
      tags: parsed.tags,
    },
  });

  revalidatePath(`/deck/${ownedCard.deckId}`);
  revalidatePath(`/study/${ownedCard.deckId}`);

  return updated;
}

export async function deleteCard(cardId: string) {
  const userId = await requireUserId();
  const ownedCard = await requireOwnedCard(cardId, userId);

  await prisma.card.delete({ where: { id: cardId } });

  revalidatePath(`/deck/${ownedCard.deckId}`);
  revalidatePath(`/study/${ownedCard.deckId}`);
}
