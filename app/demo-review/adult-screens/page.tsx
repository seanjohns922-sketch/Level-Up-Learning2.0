"use client";

import { useEffect, useState } from "react";
import ParentDashboardReview from "@/components/demo/ParentDashboardReview";
import CurriculumExplorer from "@/components/teacher/CurriculumExplorer";
import LiveClassPanel from "@/components/teacher/LiveClassPanel";
import StrandStudentsPanel from "@/components/teacher/StrandStudentsPanel";
import WholeMathsDiagnosticPanel from "@/components/teacher/WholeMathsDiagnosticPanel";

type PanelProps = Parameters<typeof StrandStudentsPanel>[0];

const NAMES = ["Ava Nguyen", "Leo Patel", "Mia Brown", "Noah Smith", "Isla Chen", "Oliver Jones", "Zara Ali", "Jack Wilson"];
const STUDENTS: PanelProps["students"] = NAMES.map((name, index) => {
  const [first, last] = name.split(" ");
  return { id: `s${index}`, display_name: name, first_name: first, last_name: last, class_id: "c1", user_id: `u${index}`, school_year_level: index % 2 ? "Year 4" : "Year 3", year_level: "Year 3" };
});

/** Review-only: adult screens with sample data, for checking the brand styling without logins. ?view=students|live|diagnostic|parent|curriculum */
export default function AdultScreensReview() {
  const [view, setView] = useState("students");
  useEffect(() => {
    const timer = setTimeout(() => setView(new URLSearchParams(window.location.search).get("view") ?? "students"), 0);
    return () => clearTimeout(timer);
  }, []);
  if (view === "parent") return <ParentDashboardReview />;
  return (
    <main className="reliq-adult min-h-screen bg-[#f4f5f1] p-6">
      {view === "live" ? (
        <LiveClassPanel selectedClass={{ id: "c1", class_code: "XWFKN", name: "3/4J", year_level: "Year 3" }} students={STUDENTS as Parameters<typeof LiveClassPanel>[0]["students"]} progressRows={[]} />
      ) : view === "diagnostic" ? (
        <WholeMathsDiagnosticPanel selectedClass={{ id: "c1", name: "3/4J" }} students={STUDENTS as Parameters<typeof WholeMathsDiagnosticPanel>[0]["students"]} schoolName="Cobram Primary School" />
      ) : view === "curriculum" ? (
        <CurriculumExplorer yearLabel="Year 3" studentCount={STUDENTS.length} studentIds={[]} progress={[]} progressAvailable={false} />
      ) : (
        <StrandStudentsPanel yearLabel="Year 3" students={STUDENTS} progress={[]} liveRows={[]} liveEvents={[]} progressAvailable={false} />
      )}
    </main>
  );
}
