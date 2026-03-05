"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { parseAnkiTsv } from "@/lib/anki-parser";
import { prisma } from "@/lib/prisma";

async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}

export async function importAnkiFile(deckId: string, fileContent: string) {
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

  const parsed = parseAnkiTsv(fileContent);

  if (parsed.validRows.length > 0) {
    await prisma.card.createMany({
      data: parsed.validRows.map((row) => ({
        deckId,
        front: row.front,
        back: row.back,
        tags: row.tags,
      })),
    });
  }

  revalidatePath(`/deck/${deckId}`);
  revalidatePath(`/deck/${deckId}/import`);

  const orderedErrors = parsed.errors
    .sort((left, right) => left.line - right.line)
    .slice(0, 100)
    .map((error) => ({
      line: error.line,
      message: error.message,
    }));

  return {
    successCount: parsed.validRows.length,
    failedCount: parsed.errors.length,
    errors: orderedErrors,
  };
}
