"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, LockKeyhole, Orbit } from "lucide-react";
import { getActiveStudentIdentity, getActiveStudentProfile } from "@/lib/studentIdentity";
import { loadStarpathPlacement } from "@/lib/starpath-placement-adapter";
import {
  deriveStarpathShellState,
  type StarpathPlacement,
  type StarpathShellState,
} from "@/lib/starpath-placement";
import {
  getStarpathLevel,
  tryNormalizeStarpathLevel,
  type StarpathLevelId,
} from "@/lib/starpath-levels";
import {
  buildStarpathTowerReturnHref,
  buildStarpathWorldHref,
  STARPATH_REALM_ID,
} from "@/lib/starpath-routes";

type ShellCopy = {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
};

const SHELL_COPY: Record<StarpathShellState, ShellCopy> = {
  unplaced: {
    eyebrow: "Placement unavailable",
    title: "Your Starpath placement is not ready yet",
    description: "No Starpath level has been assigned. Your selected level has been kept, but it has not been used as a placement.",
    action: "Placement Coming Soon",
  },
  "teacher-assigned": {
    eyebrow: "Teacher assigned",
    title: "Your Starpath level is assigned",
    description: "Your teacher assignment is ready. Starpath program access will open after the curriculum registry is approved.",
    action: "Program Coming Soon",
  },
  "pre-test-required": {
    eyebrow: "Pre-test required",
    title: "Begin with Starpath placement",
    description: "Your assigned level requires the Starpath pre-test. The assessment flow is not available yet.",
    action: "Pre-Test Coming Soon",
  },
  "program-ready": {
    eyebrow: "Program ready",
    title: "Your Starpath pathway is prepared",
    description: "Your level and pathway are valid. The Starpath program map is the next implementation phase.",
    action: "Program Coming Soon",
  },
  "ground-level": {
    eyebrow: "Ground Level",
    title: "Ground Level starts without a pre-test",
    description: "Your Ground Level placement is recognised separately. Its program is not available yet.",
    action: "Ground Program Coming Soon",
  },
  "level-complete": {
    eyebrow: "Level complete",
    title: "Your next Starpath level is being prepared",
    description: "This level is complete. Next-level progression will be connected when the Starpath program registry is available.",
    action: "Next Level Coming Soon",
  },
};

function StarpathWorldShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedLevel = tryNormalizeStarpathLevel(searchParams.get("level"));
  const placementLevelParam = searchParams.get("placement_level");
  const placementLevel = placementLevelParam ? tryNormalizeStarpathLevel(placementLevelParam) : null;
  const invalidRoute = !selectedLevel || searchParams.get("realm_id") !== STARPATH_REALM_ID ||
    (placementLevelParam !== null && !placementLevel);
  const [placement, setPlacement] = useState<StarpathPlacement | null>(null);
  const [persistenceReason, setPersistenceReason] = useState<string | null>(null);

  useEffect(() => {
    if (invalidRoute || !selectedLevel) return;
    const canonicalHref = buildStarpathWorldHref({ selectedLevel, placementLevel });
    if (`${window.location.pathname}${window.location.search}` !== canonicalHref) {
      router.replace(canonicalHref);
    }
  }, [invalidRoute, placementLevel, router, selectedLevel]);

  useEffect(() => {
    if (invalidRoute) return;
    const identity = getActiveStudentIdentity();
    const profile = getActiveStudentProfile();
    if (!identity.studentId) {
      setPlacement(null);
      setPersistenceReason("Sign in as a student to resolve Starpath placement.");
      return;
    }

    let cancelled = false;
    void loadStarpathPlacement({
      studentId: identity.studentId,
      classId: profile?.classId ?? identity.classId,
      schoolYear: profile?.yearLevel ?? null,
    }).then((result) => {
      if (cancelled || getActiveStudentIdentity().studentId !== identity.studentId) return;
      setPlacement(result.placement);
      setPersistenceReason(result.reason);
    });
    return () => { cancelled = true; };
  }, [invalidRoute]);

  const shellState = placement ? deriveStarpathShellState(placement) : "unplaced";
  const copy = SHELL_COPY[shellState];
  const selectedDefinition = selectedLevel ? getStarpathLevel(selectedLevel) : null;
  const placedDefinition = placement?.workingLevel ? getStarpathLevel(placement.workingLevel) : null;
  const statusDetails = useMemo(() => [
    { label: "Selected", value: selectedDefinition?.displayLabel ?? "Invalid" },
    { label: "Placement", value: placedDefinition?.displayLabel ?? "Not assigned" },
    { label: "Pathway", value: placement?.pathway ?? "unplaced" },
    { label: "Current", value: placement?.currentWeek ? `Week ${placement.currentWeek} · Lesson ${placement.currentLesson ?? 1}` : "Not started" },
  ], [placedDefinition?.displayLabel, placement, selectedDefinition?.displayLabel]);

  if (invalidRoute) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#060817] px-5 text-white">
        <section className="max-w-xl text-center">
          <Orbit className="mx-auto mb-5 h-12 w-12 text-indigo-200" />
          <h1 className="text-4xl font-black tracking-normal">Invalid Starpath route</h1>
          <p className="mt-4 text-lg leading-8 text-white/70">
            Starpath requires `realm_id=space` and a valid level from Ground Level through Level 6.
          </p>
          <button type="button" onClick={() => router.push("/realms")} className="mt-7 inline-flex h-11 items-center gap-2 rounded-md border border-white/25 bg-white/10 px-4 font-bold hover:bg-white/15">
            <ArrowLeft className="h-4 w-4" /> Tower of Knowledge
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060817] text-white">
      <video aria-hidden="true" autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" src="/videos/realms/starpath-realm.mp4" />
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,6,20,0.25),rgba(4,6,20,0.88))]" />

      <div className="relative z-10 flex min-h-screen flex-col px-5 py-5 sm:px-8">
        <button type="button" onClick={() => router.push(buildStarpathTowerReturnHref(selectedLevel))} className="inline-flex h-11 w-fit items-center gap-2 rounded-md border border-white/25 bg-black/35 px-4 text-sm font-bold backdrop-blur-md transition hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">
          <ArrowLeft className="h-4 w-4" /> Tower of Knowledge
        </button>

        <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center py-12">
          <div className="text-center">
            <Orbit className="mx-auto mb-4 h-11 w-11 text-indigo-200" strokeWidth={1.6} />
            <p className="text-sm font-black uppercase tracking-[0.22em] text-indigo-200">{selectedDefinition?.displayLabel}</p>
            <h1 className="mt-3 text-5xl font-black tracking-normal sm:text-7xl">Starpath Realm</h1>
          </div>

          <div className="mt-10 border-y border-white/15 bg-black/25 py-7 backdrop-blur-md">
            <div className="grid gap-8 px-5 md:grid-cols-[1.2fr_1fr] md:px-8">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-200">{copy.eyebrow}</p>
                <h2 className="mt-2 text-2xl font-black tracking-normal">{copy.title}</h2>
                <p className="mt-3 max-w-xl text-base font-semibold leading-7 text-white/70">{copy.description}</p>
                {persistenceReason ? <p className="mt-4 text-sm text-white/50">{persistenceReason}</p> : null}
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                {statusDetails.map((detail) => (
                  <div key={detail.label}>
                    <dt className="text-xs font-black uppercase tracking-[0.12em] text-white/45">{detail.label}</dt>
                    <dd className="mt-1 text-sm font-bold text-white/90">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <button type="button" disabled className="mx-auto mt-8 inline-flex h-12 items-center gap-2 rounded-md border border-indigo-200/25 bg-indigo-300/10 px-6 text-sm font-black uppercase tracking-[0.12em] text-indigo-100 opacity-75">
            <LockKeyhole className="h-4 w-4" /> {copy.action}
          </button>
        </section>
      </div>
    </main>
  );
}

export default function StarpathPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#060817]" />}>
      <StarpathWorldShell />
    </Suspense>
  );
}
