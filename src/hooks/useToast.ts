"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useToast(durationMs = 2500) {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (nextMessage: string) => {
      setMessage(nextMessage);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setMessage(null);
      }, durationMs);
    },
    [durationMs],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { toastMessage: message, showToast, clearToast: () => setMessage(null) };
}
