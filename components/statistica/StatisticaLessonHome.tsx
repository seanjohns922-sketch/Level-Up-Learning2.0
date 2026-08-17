"use client";

import { useRouter } from "next/navigation";
import { RealmLessonHome } from "@/components/lesson/RealmLessonHome";
import { buildRealmProgramHref } from "@/lib/realms/realm-journey";

type StatisticaLessonHomeProps = {
  level: string;
  levelNumber: number;
  week: number;
  lessonNumber: number;
  lessonTitle: string;
  focus: string;
  successCriteria: readonly string[];
};

export default function StatisticaLessonHome({
  level,
  levelNumber,
  week,
  lessonNumber,
  lessonTitle,
  focus,
  successCriteria,
}: StatisticaLessonHomeProps) {
  const router = useRouter();
  const weekHref = buildRealmProgramHref({ realmId: "statistics", year: level, week, preview: true });

  return (
    <main className="min-h-screen bg-[#06151a] p-3 sm:p-5">
      <RealmLessonHome
        realm="statistics"
        levelNumber={levelNumber}
        levelLabel={`Level ${levelNumber}`}
        year={level}
        week={week}
        lessonNumber={lessonNumber}
        lessonTitle={lessonTitle}
        focus={focus}
        successCriteria={successCriteria}
        startDisabled
        startDisabledLabel="Activity Preview Coming Soon"
        onBack={() => router.push(weekHref)}
        onStart={() => undefined}
      />
    </main>
  );
}
