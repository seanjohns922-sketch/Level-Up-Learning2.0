"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

// The RELIQ intro film is a self-contained page in public/intro (see film.js for its inputs and messages).
const FILM_PATH = "/intro/film.html";
const FILM_MESSAGE_SOURCE = "reliq-intro";

type FilmMessage = { source: typeof FILM_MESSAGE_SOURCE; type: "ended" | "finish" };

function isFilmMessage(data: unknown): data is FilmMessage {
  if (!data || typeof data !== "object") return false;
  const { source, type } = data as Record<string, unknown>;
  return source === FILM_MESSAGE_SOURCE && (type === "ended" || type === "finish");
}

function filmSrc(details: Record<"name" | "code" | "year", string | null | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(details)) {
    if (value?.trim()) params.set(key, value.trim());
  }
  // A fragment, not a query string: the name and explorer code never reach server logs.
  const fragment = params.toString();
  return fragment ? `${FILM_PATH}#${fragment}` : FILM_PATH;
}

async function fetchExplorerCode(studentId: string) {
  try {
    const { data, error } = await supabase.rpc("get_student_explorer_code_secure", { p_student_id: studentId });
    return !error && typeof data === "string" ? data : null;
  } catch {
    return null;
  }
}

/** The student's explorer code. `loaded` turns true once the lookup finishes, even if it found nothing. */
export function useExplorerCode(studentId: string | null | undefined) {
  const [result, setResult] = useState<{ studentId: string; code: string | null } | null>(null);
  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    void fetchExplorerCode(studentId).then((code) => {
      if (!cancelled) setResult({ studentId, code });
    });
    return () => { cancelled = true; };
  }, [studentId]);
  const loaded = !!studentId && result?.studentId === studentId;
  return { loaded, code: loaded ? result.code : null };
}

type IntroFilmFrameProps = {
  name?: string | null;
  code?: string | null;
  year?: string | null;
  /** The student pressed the film's own "Start my adventure" button. */
  onFinish: () => void;
  /** The film reached its last frame. */
  onEnded?: () => void;
  className?: string;
};

/**
 * The intro film with the student's own name, explorer code and year on the explorer pass.
 * Render it once the code lookup has finished (useExplorerCode), so the film loads only once.
 */
export default function IntroFilmFrame({ name, code, year, onFinish, onEnded, className }: IntroFilmFrameProps) {
  const filmRef = useRef<HTMLIFrameElement>(null);
  const handlers = useRef({ onFinish, onEnded });
  useEffect(() => {
    handlers.current = { onFinish, onEnded };
  }, [onFinish, onEnded]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== filmRef.current?.contentWindow) return;
      if (!isFilmMessage(event.data)) return;
      if (event.data.type === "ended") handlers.current.onEnded?.();
      else handlers.current.onFinish();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <iframe
      ref={filmRef}
      src={filmSrc({ name, code, year })}
      title="Welcome to RELIQ"
      allow="autoplay; fullscreen"
      className={className}
    />
  );
}
