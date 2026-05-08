import { useCallback, useEffect, useRef } from "react";
import { Clip } from "../components/Clips";

export default function useDebouncedClipPatch(
  clipId: number | undefined,
  delay = 250,
) {
  const pending = useRef<Partial<Clip>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controller = useRef<AbortController | null>(null);

  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (!clipId || Object.keys(pending.current).length === 0) return;

    const updates = pending.current;
    pending.current = {};
    controller.current?.abort();
    controller.current = new AbortController();

    try {
      console.log(
        `Updates:
        ${JSON.stringify(updates)}`,
      );
      await fetch(`/api/clips/${clipId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
        signal: controller.current.signal,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError") throw err;
    }
  }, [clipId]);

  const queue = useCallback(
    (updates: Partial<Clip>) => {
      pending.current = { ...pending.current, ...updates };
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, delay);
    },
    [flush, delay],
  );

  useEffect(() => {
    return () => {
      flush();
    };
  }, [clipId, flush]);

  return { queue, flush };
}
