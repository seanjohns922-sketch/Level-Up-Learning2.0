"use client";

import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { SchoolHomeSnapshot } from "@/lib/school-platform-server";
import {
  buildCards,
  buildPeerCards,
  buildTrendRows,
  comparisonLabel,
  type ClassGroupDashboard,
  type TrendTag,
} from "@/lib/class-group-dashboard";
import { curriculumWeekTitle } from "@/lib/curriculum-week-title";
import { parentRealmName } from "@/lib/parent-insights";
import { formatClassYearLevels } from "@/lib/studentLevelLabel";
import MyClassSummary from "./MyClassSummary";

/** Teacher home for one class: four numbers beside the class group (or the
 * school), class-versus-group trends, and the group's classes side by side.
 * Falls back to the analytics-based summary until the dashboard function is
 * available. */

type ClassRow = SchoolHomeSnapshot["classes"][number];

const ROLE_LABELS: Record<string, string> = {
  lead_teacher: "Lead teacher",
  teacher: "Teacher",
  support_staff: "Support staff",
  viewer: "Viewer",
};

const DAY = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", timeZone: "UTC" });
const formatDay = (iso: string) => DAY.format(new Date(`${iso}T00:00:00Z`));

function tagStyle(tag: TrendTag) {
  if (tag === "whole") return "bg-[#121314] text-white";
  if (tag === "class") return "bg-[#FFF1C7] text-[#5C4300]";
  return "bg-[#EEF9D9] text-[#3D6600]";
}

export default function TeacherClassDashboard({
  schoolId,
  academicYearId,
  classRow,
  allClasses,
}: {
  schoolId: string;
  academicYearId: string;
  classRow: ClassRow;
  allClasses: ClassRow[];
}) {
  const requestKey = `${schoolId}|${academicYearId}|${classRow.id}`;
  const [result, setResult] = useState<{ key: string; data: ClassGroupDashboard | "unavailable" | "error" } | null>(null);
  const state = result?.key === requestKey ? result.data : "loading";

  useEffect(() => {
    if (!academicYearId) return;
    let cancelled = false;
    const params = new URLSearchParams({ academicYearId, classId: classRow.id });
    fetch(`/api/school/${schoolId}/class-dashboard?${params}`, { credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) return "error" as const;
        const body = (await response.json()) as ClassGroupDashboard & { unavailable?: boolean };
        return body.unavailable ? ("unavailable" as const) : body;
      })
      .catch(() => "error" as const)
      .then((data) => {
        if (!cancelled) setResult({ key: requestKey, data });
      });
    return () => {
      cancelled = true;
    };
  }, [academicYearId, classRow.id, requestKey, schoolId]);

  if (state === "unavailable") {
    return <MyClassSummary schoolId={schoolId} academicYearId={academicYearId} classes={[classRow]} allClasses={allClasses} />;
  }

  const dashboard = typeof state === "object" ? state : null;
  const label = dashboard ? comparisonLabel(dashboard) : "";
  const cards = dashboard ? buildCards(dashboard, classRow.id) : null;
  const trends = dashboard ? buildTrendRows(dashboard, classRow.id, parentRealmName, curriculumWeekTitle) : [];
  const peers = dashboard && dashboard.scope === "group" ? buildPeerCards(dashboard) : [];
  const peerClasses = peers
    .map((peer) => ({ peer, row: allClasses.find((item) => item.id === peer.classId) }))
    .filter((item): item is { peer: (typeof peers)[number]; row: ClassRow } => Boolean(item.row))
    .sort((a, b) => a.row.name.localeCompare(b.row.name, "en-AU", { numeric: true }));
  const tagText = (tag: TrendTag) =>
    tag === "whole" ? (dashboard?.scope === "group" ? "Whole group" : "Whole school") : tag === "class" ? `Just ${classRow.name}` : dashboard?.scope === "group" ? "Ahead of group" : "Ahead of school";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-3xl font-black tracking-tight">{classRow.name}</h2>
            <span className="rounded-full bg-[#EEF9D9] px-2.5 py-1 text-xs font-bold text-[#3D6600]">{ROLE_LABELS[classRow.myRole ?? ""] ?? "Teacher"}</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {formatClassYearLevels(classRow.yearLevels) || "Year level not set"} · {classRow.studentCount} students
            {dashboard?.scope === "group" ? ` · compared with ${label}` : ""}
          </p>
        </div>
        <a
          href={`/school/${schoolId}/classes/${classRow.id}`}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--reliq-lime)] px-4 text-sm font-bold text-[#121314] hover:bg-[var(--reliq-lime-hover)]"
        >
          Open {classRow.name} <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      <section aria-label={`${classRow.name} this week`} className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {cards
          ? cards.map((card) => (
              <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-[15px] font-medium text-slate-500">{card.label}</p>
                <p className="mt-2 font-display text-4xl font-black tracking-tight text-[#121314]">{card.value}</p>
                <p className="mt-2 text-sm text-slate-500">{card.compare.split(": ")[0]}: <strong className="text-[#121314]">{card.compare.split(": ")[1]}</strong></p>
              </article>
            ))
          : [0, 1, 2, 3].map((index) => (
              <div key={index} className={`h-32 rounded-2xl ${state === "loading" ? "animate-pulse bg-slate-100" : "bg-white"}`} />
            ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h3 className="font-display text-2xl font-black tracking-tight">Trends in {classRow.name}</h3>
        <p className="mt-1 text-sm text-slate-500">
          {dashboard
            ? `Last two school weeks (${formatDay(dashboard.periods.recentStart)} – ${formatDay(dashboard.periods.recentEnd)}) compared with the two before, beside ${dashboard.scope === "group" ? `the other ${label}` : "the rest of the school"}`
            : "Last two school weeks compared with the two before"}
        </p>
        {state === "loading" ? (
          <div className="mt-4 space-y-2">{[0, 1, 2].map((index) => <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div>
        ) : state === "error" ? (
          <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">Trends could not be loaded right now.</p>
        ) : trends.length === 0 ? (
          <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">Nothing stands out yet. Trends appear once there are a few weeks of lessons and quizzes to compare.</p>
        ) : (
          <ul className="mt-3">
            {trends.map((row) => {
              const Icon = row.direction === "down" ? ArrowDownRight : ArrowUpRight;
              return (
                <li key={row.key} className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 py-4">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${row.direction === "down" ? "bg-[#FFE3DF] text-[#9B2318]" : "bg-[#EEF9D9] text-[#3D6600]"}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 basis-64">
                    <span className="block text-lg font-bold text-[#121314]">{row.title}</span>
                    <span className="block text-sm text-slate-500">{row.detail}</span>
                  </span>
                  <span className="flex gap-6 tabular-nums">
                    <span className="text-right">
                      <span className="block text-xs text-slate-500">{classRow.name}</span>
                      <span className={`block text-lg font-extrabold ${row.direction === "down" ? "text-[#9B2318]" : "text-[#3D6600]"}`}>{row.classValue}</span>
                    </span>
                    <span className="text-right">
                      <span className="block text-xs text-slate-500">{dashboard?.scope === "group" ? "Other classes" : "Rest of school"}</span>
                      <span className="block text-lg font-extrabold text-[#3A3D40]">{row.groupValue}</span>
                    </span>
                  </span>
                  <span className={`min-w-[150px] rounded-lg px-3 py-2 text-center text-xs font-extrabold uppercase tracking-[0.08em] ${row.tag ? tagStyle(row.tag) : "bg-slate-100 text-slate-500"}`}>
                    {row.tag ? tagText(row.tag) : "Watch"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {dashboard?.scope === "group" && dashboard.group ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h3 className="font-display text-2xl font-black tracking-tight">{dashboard.group.name}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {peerClasses.length} classes · {peerClasses.reduce((total, item) => total + item.peer.students, 0)} students · you can help in every class
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {peerClasses.map(({ peer, row }) => {
              const mine = row.id === classRow.id;
              return (
                <a
                  key={row.id}
                  href={`/school/${schoolId}/classes/${row.id}`}
                  className={`block rounded-xl p-5 text-[#121314] no-underline transition hover:border-[#121314] ${mine ? "border-2 border-[#121314]" : "border border-slate-200"}`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-display text-2xl font-black">{row.name}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${mine ? "bg-[var(--reliq-lime,#B9F23F)]" : "bg-slate-100 text-slate-700"}`}>{mine ? "Your class" : "Same group"}</span>
                  </span>
                  <span className="mt-2 block text-sm text-slate-500">{row.leadTeacher ?? "Teacher not assigned"} · {peer.students} students</span>
                  <span className="mt-4 grid grid-cols-2 gap-3">
                    <span><span className="block text-xs text-slate-500">Active this week</span><span className="block text-lg font-extrabold">{peer.active7d} of {peer.students}</span></span>
                    <span><span className="block text-xs text-slate-500">Quiz average</span><span className="block text-lg font-extrabold">{peer.quizAverage === null ? "—" : `${peer.quizAverage}%`}</span></span>
                  </span>
                </a>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-slate-500">Classes are listed in order, never ranked. Other classes are under All classes.</p>
        </section>
      ) : dashboard ? (
        <p className="text-sm text-slate-500">Compared with the whole school. Ask your school administrator to put similar classes (like all the 3/4s) in a class group to compare with them instead.</p>
      ) : null}
    </div>
  );
}
