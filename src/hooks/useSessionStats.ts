"use client";

import { useState } from "react";
import { Grade } from "@/types";

export type SessionStats = {
  reviewed: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
};

const initialState: SessionStats = {
  reviewed: 0,
  again: 0,
  hard: 0,
  good: 0,
  easy: 0,
};

export function useSessionStats() {
  const [stats, setStats] = useState<SessionStats>(initialState);

  const trackGrade = (grade: Grade) => {
    setStats((previous) => ({
      reviewed: previous.reviewed + 1,
      again: previous.again + (grade === 0 ? 1 : 0),
      hard: previous.hard + (grade === 1 ? 1 : 0),
      good: previous.good + (grade === 2 ? 1 : 0),
      easy: previous.easy + (grade === 3 ? 1 : 0),
    }));
  };

  const reset = () => {
    setStats(initialState);
  };

  return { stats, trackGrade, reset };
}
