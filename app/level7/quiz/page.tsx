import Level7JourneyLinks from "@/components/lesson/Level7JourneyLinks";
import Cave7QuizClient from "@/components/lesson/cave7/Cave7QuizClient";
import Space7QuizClient from "@/components/starpath/Space7QuizClient";
import SessionPage from "@/app/session/page";
import { cave7Realm, cave7WeekCount } from "@/lib/cave7-config";
import { LEVEL7_LIVE, level7LiveHref } from "@/lib/level7-release";
import { notFound, redirect } from "next/navigation";

// Live Level 7 weekly quizzes for students. The quiz shells check the student's lessons
// and save results to their record; the final week goes to the post-test instead.
export default async function Level7QuizPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (!LEVEL7_LIVE) notFound();
  const q = await searchParams, realm = q.realm_id ?? "", week = Number(q.week);
  if (!cave7Realm(realm) || !Number.isInteger(week) || week < 1 || week > cave7WeekCount(realm)) notFound();
  if (week === cave7WeekCount(realm)) redirect(level7LiveHref(realm, week, "posttest"));
  if (q.year !== "Year 7" || q.type !== "quiz" || q.n !== "1") redirect(level7LiveHref(realm, week, "quiz"));
  const quiz = realm === "pattern" || realm === "statistics" || realm === "chance"
    ? <Cave7QuizClient realm={realm} week={week} />
    : realm === "space" ? <Space7QuizClient week={week} /> : <SessionPage />;
  return <><div className="sticky top-0 z-40 border-b bg-slate-950 p-3"><Level7JourneyLinks realm={realm} week={week}/></div>{quiz}</>;
}
