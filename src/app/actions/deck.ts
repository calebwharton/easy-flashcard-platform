"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FORMATTED_SEED_CARDS } from "../../../card-data";

const createDeckSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  language: z.string().trim().max(50).optional(),
  color: z.string().trim().max(20).optional(),
  icon: z.string().trim().max(50).optional(),
});

async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}

export async function createDeck(data: {
  name: string;
  description?: string;
  language?: string;
  color?: string;
  icon?: string;
}) {
  const userId = await requireUserId();
  const parsed = createDeckSchema.parse(data);

  const deck = await prisma.deck.create({
    data: {
      userId,
      name: parsed.name,
      description: parsed.description,
      language: parsed.language ?? "Spanish",
      color: parsed.color,
      icon: parsed.icon,
    },
  });

  revalidatePath("/dashboard");
  return deck;
}

export async function deleteDeck(deckId: string) {
  const userId = await requireUserId();

  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId,
    },
  });

  if (!deck) {
    throw new Error("Deck not found");
  }

  await prisma.deck.delete({ where: { id: deckId } });
  revalidatePath("/dashboard");
}

export async function getUserDecks() {
  const userId = await requireUserId();

  return prisma.deck.findMany({
    where: { userId },
    include: {
      _count: {
        select: { cards: true },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getOwnedDeck(deckId: string) {
  const userId = await requireUserId();

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

export async function createStarterDeck() {
  const userId = await requireUserId();
  const starterName = "HP Español Starter";

  const existingDeck = await prisma.deck.findFirst({
    where: {
      userId,
      name: starterName,
    },
  });

  if (existingDeck) {
    return existingDeck;
  }

  const deck = await prisma.deck.create({
    data: {
      userId,
      name: starterName,
      description: "Imported from local HP Chamber of Secrets frequency deck",
      language: "Spanish",
    },
  });

  if (FORMATTED_SEED_CARDS.length > 0) {
    await prisma.card.createMany({
      data: FORMATTED_SEED_CARDS.map((card) => ({
        deckId: deck.id,
        front: card.front,
        back: card.back,
        tags: card.tags,
        extra: card.extra,
      })),
    });
  }

  revalidatePath("/dashboard");
  return deck;
}
