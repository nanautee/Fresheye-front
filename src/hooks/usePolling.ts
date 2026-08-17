"use client";

import { useEffect, useRef, useState } from "react";
import { getResult, type ResultResponse } from "@/lib/api";

const POLL_INTERVAL = 2500;

export function usePolling(id: string | null, active: boolean) {
  const [result, setResult] = useState<ResultResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const idRef = useRef<string | null>(null);

  useEffect(() => {
    idRef.current = id;
  }, [id]);

  useEffect(() => {
    if (!active || !id) return;
    setError(null);

    const poll = async () => {
      try {
        const r = await getResult(id);
        setResult(r);
        if (r.status === "done" || r.status === "error") {
          if (timer.current) window.clearInterval(timer.current);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка сети");
        if (timer.current) window.clearInterval(timer.current);
      }
    };

    poll();
    timer.current = window.setInterval(poll, POLL_INTERVAL);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
      timer.current = null;
    };
  }, [id, active]);

  return { result, error };
}
