import type { WeekPlan, CurriculumCode } from "@/data/programs/year1";
import type { Level8Realm } from "@/lib/level8-config";
import { LEVEL8_CURRICULUM } from "./curriculum";
function program(realm: Level8Realm): WeekPlan[] {
  return LEVEL8_CURRICULUM[realm].map((w) => ({
    id: `y8-${realm}-w${w.week}`,
    week: w.week,
    topic: w.title,
    curriculum: [
      ...new Set(w.lessons.flatMap((l) => l.codes)),
    ] as CurriculumCode[],
    lessons: w.lessons.map((l, i) => ({
      id: `y8-${realm}-w${w.week}-l${i + 1}`,
      week: w.week,
      lesson: i + 1,
      title: l.title,
      focus: l.title.charAt(0).toLowerCase() + l.title.slice(1),
      curriculum: l.codes as CurriculumCode[],
      activityIdeas: [l.title],
      quizSafe: true,
      activities: [
        {
          activityType: "multiple_choice" as const,
          weight: 1,
          config: {
            mode: "level8_authored",
            lessonStructure: "8_minute_rotation",
          },
        },
      ],
    })),
  }));
}
export const LEVEL8_PROGRAMS: Record<Level8Realm, WeekPlan[]> = {
  number: program("number"),
  measurement: program("measurement"),
  space: program("space"),
  pattern: program("pattern"),
  statistics: program("statistics"),
  chance: program("chance"),
};
