"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { getWeekProgress, isWeekComplete, readProgramStore } from "@/lib/program-progress";

const YEAR = "Prep";
const REALM_ID = "measurement";

const WEEK_NODES = [
  { week: 1, title: "Length Lands", focus: "Longer and shorter", left: "12%", top: "22%", color: "#38bdf8" },
  { week: 2, title: "Balance Basin", focus: "Heavy and light", left: "31%", top: "14%", color: "#34d399" },
  { week: 3, title: "Capacity Springs", focus: "Which holds more?", left: "54%", top: "20%", color: "#22d3ee" },
  { week: 4, title: "Duration Dunes", focus: "Quick or slow?", left: "74%", top: "15%", color: "#f59e0b" },
  { week: 5, title: "Daylight Grove", focus: "Days of the week", left: "18%", top: "56%", color: "#facc15" },
  { week: 6, title: "Clockwork Crossing", focus: "Time of day", left: "40%", top: "64%", color: "#fb7185" },
  { week: 7, title: "Calendar Keep", focus: "Today, yesterday, tomorrow", left: "62%", top: "58%", color: "#a78bfa" },
  { week: 8, title: "Timewielder Trial", focus: "Mixed mastery", left: "80%", top: "66%", color: "#f97316" },
] as const;

export default function MeasurelandsMap() {
  const router = useRouter();
  const [store] = useState(() => readProgramStore());

  const completedByWeek = useMemo(() => {
    const map: Record<number, boolean> = {};
    for (let week = 1; week <= 8; week += 1) {
      map[week] = isWeekComplete(getWeekProgress(store, YEAR, week));
    }
    return map;
  }, [store]);

  const currentWeek = useMemo(() => {
    for (let week = 1; week <= 8; week += 1) {
      if (!completedByWeek[week]) return week;
    }
    return 8;
  }, [completedByWeek]);

  const [viewWeek, setViewWeek] = useState(currentWeek);
  const currentNode = WEEK_NODES.find((node) => node.week === viewWeek) ?? WEEK_NODES[0];

  function openWeek(week: number) {
    router.push(`/program?year=${encodeURIComponent(YEAR)}&week=${week}&legacy=1&realm_id=${REALM_ID}`);
  }

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#07121a" }}>
      <img
        src="/images/tower-plaza-bg.jpg"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
        }}
      />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,10,16,0.45) 0%, rgba(3,8,12,0.72) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 35%, rgba(45,212,191,0.22), transparent 40%)" }} />

      <div style={{ position: "relative", zIndex: 2, height: "100%", padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <button
            type="button"
            onClick={() => router.push(`/realms?level=${encodeURIComponent(YEAR)}`)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 18px",
              borderRadius: 18,
              border: "1px solid rgba(186,230,253,0.25)",
              background: "rgba(5,16,22,0.72)",
              color: "white",
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              backdropFilter: "blur(10px)",
            }}
          >
            <ArrowLeft size={16} />
            Back to Realms
          </button>

          <div style={{ color: "rgba(226,232,240,0.92)", fontSize: 30, fontWeight: 900, letterSpacing: "-0.02em" }}>
            Measurelands
          </div>

          <div style={{ color: "rgba(186,230,253,0.85)", fontSize: 16, fontWeight: 700 }}>Ground Level</div>
        </div>

        <div style={{ position: "absolute", left: "50%", top: "14%", transform: "translateX(-50%)", textAlign: "center", maxWidth: 480 }}>
          <div style={{ color: "rgba(125,211,252,0.95)", fontSize: 13, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase" }}>
            World Map
          </div>
          <h1 style={{ marginTop: 10, color: "white", fontSize: 58, lineHeight: 1, fontWeight: 900 }}>Week {currentNode.week}</h1>
          <div style={{ marginTop: 12, color: "rgba(226,232,240,0.96)", fontSize: 24, fontWeight: 700 }}>{currentNode.title}</div>
          <div style={{ marginTop: 8, color: "rgba(186,230,253,0.85)", fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {currentNode.focus}
          </div>
        </div>

        <div style={{ position: "absolute", left: "50%", top: "30%", transform: "translateX(-50%)", display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={() => setViewWeek((current) => Math.max(1, current - 1))}
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              border: "1px solid rgba(186,230,253,0.25)",
              background: "rgba(5,16,22,0.72)",
              color: "white",
              display: "grid",
              placeItems: "center",
              backdropFilter: "blur(10px)",
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => openWeek(currentNode.week)}
            style={{
              padding: "14px 26px",
              borderRadius: 999,
              border: "1px solid rgba(125,211,252,0.28)",
              background: "linear-gradient(135deg, rgba(14,165,233,0.9), rgba(20,184,166,0.86))",
              color: "#06202c",
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              boxShadow: "0 10px 30px rgba(8,145,178,0.28)",
            }}
          >
            Enter Week
          </button>
          <button
            type="button"
            onClick={() => setViewWeek((current) => Math.min(8, current + 1))}
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              border: "1px solid rgba(186,230,253,0.25)",
              background: "rgba(5,16,22,0.72)",
              color: "white",
              display: "grid",
              placeItems: "center",
              backdropFilter: "blur(10px)",
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {WEEK_NODES.map((node) => {
          const complete = completedByWeek[node.week];
          const active = node.week === currentWeek;
          const focused = node.week === viewWeek;

          return (
            <button
              key={node.week}
              type="button"
              onClick={() => setViewWeek(node.week)}
              style={{
                position: "absolute",
                left: node.left,
                top: node.top,
                transform: focused ? "scale(1.08)" : "scale(1)",
                transition: "transform 180ms ease",
                width: 180,
                padding: "14px 16px",
                borderRadius: 22,
                border: `1px solid ${focused ? `${node.color}99` : "rgba(226,232,240,0.18)"}`,
                background: focused ? "rgba(6,24,33,0.88)" : "rgba(6,18,24,0.72)",
                backdropFilter: "blur(12px)",
                boxShadow: focused ? `0 14px 34px ${node.color}22` : "0 10px 28px rgba(0,0,0,0.22)",
                textAlign: "left",
                color: "white",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(186,230,253,0.9)" }}>
                  Week {node.week}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: complete ? "#86efac" : active ? "#67e8f9" : "rgba(226,232,240,0.6)",
                  }}
                >
                  {complete ? "Complete" : active ? "Active" : "Preview"}
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 25, lineHeight: 1, fontWeight: 900 }}>{node.title}</div>
              <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.35, color: "rgba(226,232,240,0.82)" }}>{node.focus}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
