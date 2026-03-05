export type Grade = 0 | 1 | 2 | 3;

export type GradeLabel = "Again" | "Hard" | "Good" | "Easy";

export type CardProgressInput = {
  interval: number;
  easeFactor: number;
  repetitions: number;
  dueDate: Date;
  lapses: number;
  lastReview: Date | null;
};

export type ParserError = {
  line: number;
  message: string;
  raw: string;
};

export type ParsedImportRow = {
  front: string;
  back: string;
  tags: string[];
};

export type DueCard = {
  id: string;
  deckId: string;
  front: string;
  back: string;
  tags: string[];
  progress: {
    interval: number;
    easeFactor: number;
    repetitions: number;
    dueDate: Date;
    lapses: number;
    lastReview: Date | null;
  } | null;
};
