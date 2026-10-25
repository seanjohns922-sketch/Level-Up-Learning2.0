"use client";

import { useState } from "react";
import GrowthView, { type GrowthBreakdown } from "@/components/school/analytics/GrowthView";
import type { SchoolAnalyticsSnapshot } from "@/lib/school-platform-server";

/** Review-only: the leader Growth tab (pre-test sets the base; post-tests and
 * diagnostics show growth) with a pretend school, by year, class and student. */

type Test = { strand: string; measured: number; testedAt: string; source: string };

// Deterministic pretend numbers, so the page looks the same every load.
let seed = 7;
const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

const FIRST = ["Ava", "Noah", "Mia", "Leo", "Isla", "Jack", "Zara", "Oliver", "Ella", "Hunter", "Amani", "Toma", "Jade", "Cooper", "Darcy", "Waldo", "Brody", "Millie", "Ruby", "Max", "Grace", "Archie", "Chloe", "Henry"];
const LAST = ["Ambrose", "Bamford", "Boston", "Cairns", "Chatfield", "Coates", "Duhring", "Goldsmith", "Mccance", "Macartney", "Sweeney", "Quinn", "Patel", "Nguyen", "Smith", "Wilson"];
const STRANDS = ["number", "measurement", "space", "statistics", "algebra", "probability"];

const CLASSES = [
  { id: "c34j", name: "3/4J", years: [3, 4] },
  { id: "c34m", name: "3/4M", years: [3, 4] },
  { id: "c56b", name: "5/6B", years: [5, 6] },
  { id: "c56k", name: "5/6K", years: [5, 6] },
];

// Each student: a Feb pre-test (or a June pre-test if they joined mid-year), a June post-test, an October post-test or diagnostic.
function historyFor(year: number, kind: "steady" | "fast" | "slow" | "backwards" | "waiting" | "joinedMid"): Test[] {
  const tests: Test[] = [];
  for (const strand of STRANDS.slice(0, 3 + Math.floor(rand() * 4))) {
    const base = year - 0.9 + (rand() - 0.5) * 1.2;
    const gain = { steady: 0.75, fast: 1.25, slow: 0.35, backwards: -0.4, waiting: 0, joinedMid: 0.3 }[kind] + (rand() - 0.5) * 0.15;
    if (kind === "joinedMid") {
      tests.push({ strand, measured: base + 0.4, testedAt: "2026-06-09T00:00:00Z", source: "pretest" });
      tests.push({ strand, measured: base + 0.4 + gain, testedAt: "2026-10-08T00:00:00Z", source: "posttest" });
      continue;
    }
    tests.push({ strand, measured: base, testedAt: "2026-02-12T00:00:00Z", source: "pretest" });
    if (kind === "waiting") continue;
    tests.push({ strand, measured: base + gain * 0.5, testedAt: "2026-06-18T00:00:00Z", source: "posttest" });
    tests.push({ strand, measured: base + gain, testedAt: "2026-10-09T00:00:00Z", source: rand() > 0.5 ? "diagnostic" : "posttest" });
  }
  return tests.sort((a, b) => a.testedAt.localeCompare(b.testedAt));
}

function pretendSnapshot(): SchoolAnalyticsSnapshot {
  const kinds = ["steady", "steady", "fast", "slow", "steady", "backwards", "waiting", "joinedMid", "fast", "slow"] as const;
  const students: Array<{ id: string; name: string; yearLevel: string; classId: string; className: string; testHistory: Test[] }> = [];
  let n = 0;
  for (const cls of CLASSES) {
    for (let i = 0; i < 12; i += 1) {
      const year = cls.years[i % 2];
      const kind = kinds[Math.floor(rand() * kinds.length)];
      students.push({
        id: `s${n}`,
        name: `${FIRST[(n * 7) % FIRST.length]} ${LAST[(n * 5) % LAST.length]}`,
        yearLevel: `Year ${year}`,
        classId: cls.id,
        className: cls.name,
        testHistory: historyFor(year, kind),
      });
      n += 1;
    }
  }
  return {
    generatedAt: "2026-10-22T00:00:00Z",
    windowEnd: "2026-10-22T00:00:00Z",
    academicYear: { startsOn: "2026-01-01", endsOn: "2026-12-31" },
    classes: CLASSES.map((cls) => ({ id: cls.id, name: cls.name })),
    analysisStudents: students.map((student) => ({ yearLevel: student.yearLevel, classId: student.classId, testHistory: student.testHistory, tests: student.testHistory, realms: [] })),
    students: students.map((student) => ({ id: student.id, name: student.name, yearLevel: student.yearLevel, classId: student.classId, className: student.className, testHistory: student.testHistory, tests: student.testHistory, realms: [] })),
  } as unknown as SchoolAnalyticsSnapshot;
}

const SNAPSHOT = pretendSnapshot();

const VIEWS: Array<{ id: GrowthBreakdown; label: string; title: string; filter?: (s: SchoolAnalyticsSnapshot) => SchoolAnalyticsSnapshot }> = [
  { id: "years", label: "Whole school (by year)", title: "Growth across the school" },
  {
    id: "classes", label: "Year 3 (by class)", title: "Year 3 growth by class",
    filter: (s) => ({ ...s, analysisStudents: s.analysisStudents.filter((x) => x.yearLevel === "Year 3"), students: s.students.filter((x) => x.yearLevel === "Year 3") }),
  },
  {
    id: "students", label: "3/4J (by student)", title: "3/4J growth by student",
    filter: (s) => ({ ...s, analysisStudents: s.analysisStudents.filter((x) => x.classId === "c34j"), students: s.students.filter((x) => x.classId === "c34j") }),
  },
];

export default function SchoolGrowthReview() {
  const [view, setView] = useState(0);
  const active = VIEWS[view];
  const snapshot = active.filter ? active.filter(SNAPSHOT) : SNAPSHOT;
  return (
    <main className="reliq-adult min-h-screen bg-[#F4F4F0] px-6 py-8">
      <div className="mx-auto grid max-w-7xl gap-4">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-[#121314]">Growth — pre-test base, then every test</h1>
          <p className="text-sm text-[#5A5E63]">The real leader Growth tab with a pretend school (4 classes, 48 students). A pre-test sets each student&apos;s base; post-tests and diagnostics after it show growth. Some students are only at their pre-test, and some joined mid-year.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {VIEWS.map((item, index) => (
            <button key={item.id} type="button" onClick={() => setView(index)} className={`rounded-full border-2 border-[#121314] px-4 py-1.5 text-sm font-bold ${view === index ? "bg-[#121314] text-white" : "bg-white text-[#121314]"}`}>{item.label}</button>
          ))}
        </div>
        <GrowthView key={active.id} snapshot={snapshot} audience="leadership" breakdown={active.id} title={active.title} />
      </div>
    </main>
  );
}
