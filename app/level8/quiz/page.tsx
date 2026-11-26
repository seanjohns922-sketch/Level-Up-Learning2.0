import Level7JourneyLinks from "@/components/lesson/Level7JourneyLinks";
import QuizClient from "@/components/lesson/level8/QuizClient";
import { isLevel8Realm, LEVEL8_WEEK_COUNTS } from "@/lib/level8-config";
import { LEVEL8_LIVE, level8LiveHref } from "@/lib/level8-release";
import { notFound, redirect } from "next/navigation";

// Live Level 8 weekly quizzes for students. The quiz checks the student's lessons and saves
// results to their record; the final week goes to the post-test (the final battle) instead.
export default async function Level8QuizPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (!LEVEL8_LIVE) notFound();
  const q = await searchParams, realm = q.realm_id ?? "", week = Number(q.week);
  if (!isLevel8Realm(realm) || !Number.isInteger(week) || week < 1 || week > LEVEL8_WEEK_COUNTS[realm]) notFound();
  if (week === LEVEL8_WEEK_COUNTS[realm]) redirect(level8LiveHref(realm, week, "posttest"));
  if (q.year !== "Year 8" || q.type !== "quiz" || q.n !== "1") redirect(level8LiveHref(realm, week, "quiz"));
  return <><div className="sticky top-0 z-40 border-b bg-slate-950 p-3"><Level7JourneyLinks level={8} realm={realm} week={week}/></div><QuizClient realm={realm} week={week} /></>;
}
