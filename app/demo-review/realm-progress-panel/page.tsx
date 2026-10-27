"use client";

import RealmProgressPanel, { type RealmPanelData } from "@/components/profile/RealmProgressPanel";

// Sample learners for reviewing the progress page's realm panel. Pretend data only.
const week = (n: number, lessonsDone: number, quizBest: number | null, done: boolean) => ({ week: n, lessonsDone, quizBest, done });

const SAMPLES: RealmPanelData[] = [
  {
    id: "measurement", name: "Measurelands", color: "#e8c97e", route: "/measurelands", year: "Year 6", levelLabel: "Level 6",
    weeksCompleted: 3, totalWeeks: 8,
    weeks: [week(1, 3, 90, true), week(2, 3, 85, true), week(3, 3, 100, true), week(4, 2, null, false), ...[5, 6, 7, 8].map((n) => week(n, 0, null, false))],
    pretest: { completedAt: "2026-10-14T01:00:00Z" }, posttest: null, levelPassed: false,
  },
  {
    id: "number", name: "Number Nexus", color: "#2dd4bf", route: "/world/expedition?realm=number", year: "Year 7", levelLabel: "Level 7",
    weeksCompleted: 2, totalWeeks: 12,
    weeks: [week(1, 3, 87, true), week(2, 3, 80, true), week(3, 3, 67, false), ...Array.from({ length: 9 }, (_, i) => week(i + 4, 0, null, false))],
    pretest: { completedAt: "2026-09-02T01:00:00Z" }, posttest: null, levelPassed: false,
  },
  {
    id: "chance", name: "Chance Hollow", color: "#fb7185", route: "/chance-hollow", year: "Year 8", levelLabel: "Level 8",
    weeksCompleted: 6, totalWeeks: 6,
    weeks: Array.from({ length: 6 }, (_, i) => week(i + 1, 3, 90, true)),
    pretest: { completedAt: "2026-07-20T01:00:00Z" }, posttest: { completedAt: "2026-10-22T01:00:00Z", passed: true }, levelPassed: true,
  },
];

export default function Page() {
  return (
    <main className="min-h-screen space-y-8 bg-[#120e1c] px-4 py-8 font-sans text-white sm:px-8">
      <h1 className="font-display text-2xl font-black">Realm progress panel · sample learners</h1>
      {SAMPLES.map((realm) => (
        <div key={realm.id} className="mx-auto grid max-w-[1240px]">
          <RealmProgressPanel realm={realm} gems={[]} onContinue={() => {}} onClose={() => {}} />
        </div>
      ))}
    </main>
  );
}
