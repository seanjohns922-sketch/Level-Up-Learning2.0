import DemoGate from "@/components/lesson/level8/DemoGate";
import { notFound, redirect } from "next/navigation";
import { getServerStarpathAccess } from "@/lib/demo-session-server";
import { isLevel8Realm, LEVEL8_WEEK_COUNTS } from "@/lib/level8-config";
import { level8DemoHref } from "@/lib/level8-routes";
import LessonPage from "@/app/lesson/page";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ realm: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  if (!(await getServerStarpathAccess()).allowed) redirect("/login");
  const { realm } = await params,
    q = await searchParams,
    week = Number(q.week);
  if (
    !isLevel8Realm(realm) ||
    !Number.isInteger(week) ||
    week < 1 ||
    week > LEVEL8_WEEK_COUNTS[realm]
  )
    notFound();
  const match = q.lessonId?.match(
    new RegExp(`^y8-${realm}-w${week}-l([1-3])$`),
  );
  if (!match) notFound();
  if (q.year !== "Year 8" || q.realm_id !== realm || q.teacher_preview !== "1")
    redirect(level8DemoHref(realm, week, Number(match[1])));
  return (
    <DemoGate>
      <LessonPage />
    </DemoGate>
  );
}
