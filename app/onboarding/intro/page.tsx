"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveStudentProfile, markActiveStudentIntroSeen } from "@/lib/studentIdentity";
import { markStudentIntroSeen, restoreStudentStateFromServer } from "@/lib/student-progress-sync";
import { supabase } from "@/lib/supabase";

// The intro film is a self-contained page in public/intro (see film.js for its inputs and messages).
const FILM_PATH = "/intro/film.html";
const FILM_MESSAGE_SOURCE = "reliq-intro";

type FilmMessage = { source: typeof FILM_MESSAGE_SOURCE; type: "ended" | "finish" };

function isFilmMessage(data: unknown): data is FilmMessage {
  if (!data || typeof data !== "object") return false;
  const { source, type } = data as Record<string, unknown>;
  return source === FILM_MESSAGE_SOURCE && (type === "ended" || type === "finish");
}

function filmSrc(details: { name?: string | null; code?: string | null; year?: string | null }) {
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

export default function IntroPage() {
  const router = useRouter();
  const filmRef = useRef<HTMLIFrameElement>(null);
  const [ended, setEnded] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [explorerCode, setExplorerCode] = useState<string | null>(null);
  const [studentProfile] = useState(getActiveStudentProfile);
  const studentId = studentProfile?.studentId;

  useEffect(() => {
    if (!studentId) {
      router.replace("/login?error=session_missing");
      return;
    }
    let cancelled = false;
    void Promise.all([restoreStudentStateFromServer(studentId, "number"), fetchExplorerCode(studentId)])
      .then(([restored, code]) => {
        if (cancelled) return;
        if (restored.introSeen) {
          router.replace("/home");
          return;
        }
        setExplorerCode(code);
        setVerifying(false);
      })
      .catch((restoreError) => {
        console.warn("[Intro] Could not verify canonical onboarding state", restoreError);
        if (!cancelled) {
          setError("We could not load your saved journey. Please try again.");
          setVerifying(false);
        }
      });
    return () => { cancelled = true; };
  }, [router, studentId]);

  const savingRef = useRef(false);
  const finish = useCallback(async () => {
    if (!studentId || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError("");
    try {
      await markStudentIntroSeen(studentId);
      markActiveStudentIntroSeen(studentId);
      router.push("/home");
    } catch (saveError) {
      console.warn("[Intro] Could not save canonical onboarding state", saveError);
      setError("We could not save your progress. Please try again.");
      savingRef.current = false;
      setSaving(false);
    }
  }, [router, studentId]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== filmRef.current?.contentWindow) return;
      if (!isFilmMessage(event.data)) return;
      if (event.data.type === "ended") setEnded(true);
      else void finish();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [finish]);

  if (verifying) {
    return <main className="fixed inset-0 z-50 grid place-items-center bg-black font-bold text-white">Loading your journey...</main>;
  }

  return (
    <main className="fixed inset-0 z-50 bg-black">
      <iframe
        ref={filmRef}
        src={filmSrc({ name: studentProfile?.displayName, code: explorerCode, year: studentProfile?.yearLevel })}
        title="Welcome to RELIQ"
        allow="autoplay; fullscreen"
        className="absolute inset-0 h-full w-full border-0"
      />
      <button
        type="button"
        onClick={() => void finish()}
        disabled={saving}
        className="absolute rounded-full border border-white/30 bg-black/50 px-5 py-2 text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur transition hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C94DF2] disabled:opacity-60"
        style={{ top: "max(1rem, env(safe-area-inset-top))", right: "max(1rem, env(safe-area-inset-right))" }}
      >
        {saving ? "Saving..." : ended ? "Continue" : "Skip intro"}
      </button>
      {error ? (
        <p role="alert" className="absolute inset-x-4 bottom-6 mx-auto w-fit rounded-xl bg-black/80 px-4 py-2 font-bold text-rose-300">
          {error}
        </p>
      ) : null}
    </main>
  );
}
