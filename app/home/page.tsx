"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { StudentProgress } from "@/data/progress";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { clearActiveStudentSession, getActiveStudentProfile, getPlacementEntryYear, markActiveStudentIntroSeen } from "@/lib/studentIdentity";
import { markStudentIntroSeen, restoreStudentStateFromServer, StudentRestoreSupersededError } from "@/lib/student-progress-sync";
import { supabase } from "@/lib/supabase";
import { resolveStudentDestination } from "@/lib/student-destination";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import IntroFilmFrame, { useExplorerCode } from "@/components/onboarding/IntroFilmFrame";
import styles from "./student-welcome.module.css";
import { fetchPendingStudentDiagnostic } from "@/lib/whole-maths-diagnostic-client";
import { isDiagnosticHandoffPaused } from "@/lib/diagnostic-handoff";

const ARROW_PATH = "M5 11h11.2l-4.6-4.6L13 5l7 7-7 7-1.4-1.4 4.6-4.6H5z";

function WelcomeShell({ onLogout, children }: { onLogout: () => void; children: React.ReactNode }) {
  return (
    <div className={styles.scene}>
      <Image
        src="/images/student-welcome-bg-lcp.webp"
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className={styles.backdrop}
      />
      <header className={styles.bar}>
        {/* eslint-disable-next-line @next/next/no-img-element -- small static brand mark, already sized */}
        <img className={styles.logo} src="/brand/reliq-logo-on-dark.png" alt="RELIQ" />
        <button type="button" className={styles.ghost} onClick={onLogout}>Log out</button>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

export default function StudentHomePage() {
  const router = useRouter();
  const studentProfile = useMemo(() => getActiveStudentProfile(), []);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [restoreState, setRestoreState] = useState<"loading" | "ready" | "error">("loading");
  const [restoreError, setRestoreError] = useState("");
  const placementYear = progress?.year ?? getPlacementEntryYear();
  const isGroundLevel = placementYear === "Prep";
  const [filmEnded, setFilmEnded] = useState(false);
  const [starting, setStarting] = useState(false);
  const explorer = useExplorerCode(studentProfile?.studentId);
  const firstName = studentProfile?.displayName?.trim().split(/\s+/)[0] || "Explorer";
  const welcomeMessage = isGroundLevel
    ? "Watch the welcome film, then choose a realm to begin your Ground adventure."
    : "Watch how RELIQ works. Then a short skill check places you at the right level and unlocks your learning path.";

  useEffect(() => {
    if (isDemoPreviewMode()) {
      router.replace("/world?teacher_preview=1");
      return;
    }
    const studentId = studentProfile?.studentId;
    if (!studentId) {
      router.replace("/login?error=session_missing");
      return;
    }

    let cancelled = false;
    async function restore() {
      setRestoreState("loading");
      try {
        const pendingDiagnostic = await fetchPendingStudentDiagnostic(studentId!);
        if (cancelled) return;
        if (pendingDiagnostic && !isDiagnosticHandoffPaused(pendingDiagnostic.sitting_id)) {
          router.replace("/diagnostic");
          return;
        }
        const restored = await restoreStudentStateFromServer(studentId!, "number");
        if (cancelled) return;
        if (!restored.progress) {
          setRestoreError("Your learning placement is not ready. Ask your teacher to check your starting level.");
          setRestoreState("error");
          return;
        }
        setProgress(restored.progress);
        setRestoreState("ready");
        if (restored.introSeen) {
          router.replace(resolveStudentDestination({
            progress: restored.progress,
            introSeen: true,
            fallbackYear: restored.progress.year,
          }));
        }
      } catch (error) {
        if (cancelled || error instanceof StudentRestoreSupersededError) return;
        console.warn("[Home] Could not restore canonical progress", error);
        setRestoreError("We could not load your saved progress. Check your connection and try again.");
        setRestoreState("error");
      }
    }
    void restore();
    return () => { cancelled = true; };
  }, [router, studentProfile?.studentId]);

  async function handleLogout() {
    clearActiveStudentSession();
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function beginJourney() {
    const studentId = studentProfile?.studentId;
    if (!studentId || !progress || restoreState !== "ready" || starting) return;
    setStarting(true);
    try {
      await markStudentIntroSeen(studentId);
      markActiveStudentIntroSeen(studentId);
      router.push(resolveStudentDestination({
            progress,
            introSeen: true,
            fallbackYear: progress.year,
          }));
    } catch (error) {
      console.warn("[Home] Could not persist intro state", error);
      setRestoreError("We could not save that you watched the intro. Please try again.");
      setRestoreState("error");
      setStarting(false);
    }
  }

  if (restoreState !== "ready") {
    return (
      <WelcomeShell onLogout={handleLogout}>
        {restoreState === "loading" ? (
          <div className="flex w-full flex-col items-center gap-5" aria-busy="true" aria-label="Loading your journey">
            <div className={`${styles.skeleton} h-4 w-40`} />
            <div className={`${styles.skeleton} h-12 w-full max-w-md`} />
            <div className={`${styles.skeleton} aspect-video w-full max-w-[860px] rounded-[22px]`} />
            <span className="sr-only">Loading your journey</span>
          </div>
        ) : (
          <div className={styles.notice} role="alert">
            <p>{restoreError}</p>
            <button type="button" className={styles.go} onClick={() => window.location.reload()}>Try again</button>
          </div>
        )}
      </WelcomeShell>
    );
  }

  const yearLevel = studentProfile?.yearLevel?.trim();
  return (
    <WelcomeShell onLogout={handleLogout}>
      <section className={styles.hello}>
        {explorer.code || yearLevel ? (
          <div className={styles.eyebrow}>
            {explorer.code ? <>Explorer <b>{explorer.code}</b></> : null}
            {explorer.code && yearLevel ? " · " : null}
            {yearLevel}
          </div>
        ) : null}
        <h1 className={styles.title}>Welcome, <span className={styles.highlight}>{firstName}</span></h1>
        <div className={styles.subRow}>
          <p className={styles.sub}>{welcomeMessage}</p>
          <ReadAloudBtn
            text={`Welcome, ${firstName}. ${welcomeMessage}`}
            speechKey="student-welcome"
            label="Read"
            className={styles.read}
          />
        </div>
      </section>

      <section className={styles.stage} aria-label="Intro film">
        {explorer.loaded ? (
          <IntroFilmFrame
            name={studentProfile?.displayName}
            code={explorer.code}
            year={yearLevel}
            onFinish={() => void beginJourney()}
            onEnded={() => setFilmEnded(true)}
            className={styles.film}
          />
        ) : null}
      </section>

      <div className={styles.tagline} aria-label="Explore, learn, collect">
        <span><i />Explore</span><span><i />Learn</span><span><i />Collect</span>
      </div>

      <div className={styles.foot}>
        <button
          type="button"
          onClick={() => void beginJourney()}
          disabled={starting}
          className={`${styles.go} ${filmEnded ? styles.ready : styles.quiet}`}
        >
          {starting ? "Starting..." : filmEnded ? "Start my adventure" : "Skip and start exploring"}
          {filmEnded && !starting ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ARROW_PATH} /></svg> : null}
        </button>
      </div>
    </WelcomeShell>
  );
}
