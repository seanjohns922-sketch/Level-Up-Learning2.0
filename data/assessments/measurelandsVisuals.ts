// ── Measurelands assessment visuals ──────────────────────────────────────────
// Pure, dependency-free deriver (no React) that turns a measurement assessment
// question into a compact visual descriptor echoing the real lesson instruments
// (ruler, scales, jug, clock, thermometer, area grid, cube stack, protractor…).
// Rendered by components/assessment/MeasurelandsAssessmentVisual.tsx.
//
// Golden rule: a visual must NEVER contradict the stored correct answer. When an
// exact value can't be parsed with confidence, we fall back to a themed "concept"
// instrument card (correct-answer-neutral) rather than assert a wrong reading.
//
// ── Future direction (seed, do not build yet) ────────────────────────────────
// Generalise this into `realmVisuals.ts`: a registry keyed by realm, where each
// realm registers `{ derive(question) -> RealmVisual, render(visual) }`. Number,
// Measurement, Space, Algebra and Statistics would all derive visuals the same
// way; this file becomes the "measurement" entry. The MzVisual union below is the
// measurement realm's visual vocabulary — a separate concern from the artwork,
// so emojis can later be swapped for real Measurelands art without touching the
// deriver.

export type MzVisual =
  | { kind: "ruler"; toCm: number; label?: string; emoji?: string }
  | { kind: "scaleDial"; value: number; unit: "g" | "kg"; max: number }
  | { kind: "jug"; value: number; unit: "mL" | "L"; max: number }
  | { kind: "clock"; hour: number; minute: number; digital?: string }
  | { kind: "thermometer"; value: number; from?: number; min?: number; max?: number }
  | { kind: "rectangle"; w: number; h: number; mode: "perimeter" | "area"; unit?: string }
  | { kind: "cubes"; l: number; w: number; h: number }
  | { kind: "angle"; single?: number; known?: number; unknown?: number; total?: 180 | 360 }
  | { kind: "convert"; fromValue: number; fromUnit: string; toValue: number; toUnit: string }
  | { kind: "objects"; items: Array<{ label: string; emoji: string }>; caption?: string }
  | { kind: "concept"; icon: string; label: string; sub?: string };

type Q = {
  prompt: string;
  options?: unknown[];
  correctAnswer?: string;
  skillId?: string;
  skillLabel?: string;
};

// ── parsing helpers ───────────────────────────────────────────────────────────
function nums(s: string): number[] {
  return (s.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
}
function firstNum(s: string): number | undefined {
  const m = s.match(/\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : undefined;
}
function valueWithUnit(s: string): { value: number; unit: string } | undefined {
  const m = s.match(/(\d+(?:\.\d+)?)\s*(mm|cm|km|m|kg|g|mL|ml|L|°C|units²|units|cubes?|cups?|blocks?|squares?|min|h)\b/i);
  if (!m) return undefined;
  let unit = m[2];
  if (unit.toLowerCase() === "ml") unit = "mL";
  return { value: Number(m[1]), unit };
}
// Normalise a measurement to a base unit so bars compare fairly across units
// (2 L must out-bar 500 mL). Same-type units only ever appear together.
function toBase(value: number, unit: string): number {
  switch (unit.toLowerCase()) {
    case "km": return value * 100000; case "m": return value * 100; case "cm": return value; case "mm": return value / 10;
    case "kg": return value * 1000; case "g": return value;
    case "l": return value * 1000; case "ml": return value;
    default: return value; // cups / blocks / squares / cubes — already comparable
  }
}
// Up to two measurements pulled from a string, in order.
function measurementsIn(s: string): Array<{ label: string; value: number; base: number }> {
  const out: Array<{ label: string; value: number; base: number }> = [];
  const re = /(\d+(?:\.\d+)?)\s*(mm|cm|km|m|kg|g|mL|ml|L|cubes?|cups?|blocks?|squares?)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) && out.length < 2) {
    let unit = m[2]; if (unit.toLowerCase() === "ml") unit = "mL";
    out.push({ label: `${m[1]} ${unit}`, value: Number(m[1]), base: toBase(Number(m[1]), unit) });
  }
  return out;
}
// A measurement value's instrument emoji (fallback only — real art via ObjectArt).
function unitEmoji(label: string): string {
  const l = label.toLowerCase();
  if (/\bl\b|ml/.test(l)) return "🫙";
  if (/kg|\bg\b/.test(l)) return "⚖️";
  if (/cm|mm|km|\bm\b/.test(l)) return "📏";
  if (/cube/.test(l)) return "🧊";
  if (/square/.test(l)) return "🔲";
  if (/°c/.test(l)) return "🌡️";
  if (/cup/.test(l)) return "🥤";
  if (/block/.test(l)) return "🧱";
  return "📦";
}
// Two labelled instrument cards for a genuine two-item comparison (exactly two
// numeric OPTIONS, the rest decoys). Shows the two GIVEN measurements as cards —
// no magnitude bar, so it never points at the answer.
function compareCards(q: Q): MzVisual | undefined {
  const numeric = optionLabels(q).filter((l) => /\d/.test(l));
  if (numeric.length !== 2) return undefined;
  return { kind: "objects", items: numeric.map((l) => ({ label: l, emoji: unitEmoji(l) })), caption: "Compare the measurements" };
}
// Same, from a measured PROMPT that names two quantities.
function promptCards(q: Q): MzVisual | undefined {
  const found = measurementsIn(q.prompt ?? "");
  if (found.length !== 2) return undefined;
  return { kind: "objects", items: found.map((f) => ({ label: f.label, emoji: unitEmoji(f.label) })), caption: "Compare the measurements" };
}

// Time words → an analog clock position. Handles "half past 3", "quarter to 5",
// "4 o'clock", "quarter past 7", 24-hour "14:00" and 12-hour "6:45 pm".
function parseClock(answer: string, prompt: string): { hour: number; minute: number; digital?: string } | undefined {
  const a = answer.toLowerCase().trim();

  const hhmm = a.match(/\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/);
  if (hhmm) {
    let h = Number(hhmm[1]); const min = Number(hhmm[2]); const ap = hhmm[3];
    const digital = ap ? `${h}:${hhmm[2]} ${ap}` : `${String(h).padStart(2, "0")}:${hhmm[2]}`;
    if (ap === "pm" && h !== 12) h += 12;
    if (ap === "am" && h === 12) h = 0;
    return { hour: h % 12, minute: min, digital };
  }
  const hourWord = (label: string): number | undefined => {
    const m = label.match(/\b(\d{1,2})\b/);
    return m ? Number(m[1]) : undefined;
  };
  if (a.includes("o'clock")) { const h = hourWord(a); if (h !== undefined) return { hour: h % 12, minute: 0 }; }
  if (a.includes("half past")) { const h = hourWord(a); if (h !== undefined) return { hour: h % 12, minute: 30 }; }
  if (a.includes("quarter past")) { const h = hourWord(a); if (h !== undefined) return { hour: h % 12, minute: 15 }; }
  if (a.includes("quarter to")) { const h = hourWord(a); if (h !== undefined) return { hour: (h + 11) % 12, minute: 45 }; }

  // Answer had no hour (e.g. "half past"): use the "long hand points to N" prompt
  // to place the minute hand; keep the hour generic (12).
  const p = prompt.toLowerCase();
  const pointsTo = p.match(/points to (\d{1,2})/);
  if (pointsTo) {
    const n = Number(pointsTo[1]);
    return { hour: 12, minute: (n % 12) * 5 };
  }
  return undefined;
}

// Object keyword → emoji (for qualitative compare / sequence scenes).
const EMOJI: Array<[RegExp, string]> = [
  [/pencil/, "✏️"], [/crayon/, "🖍️"], [/ribbon/, "🎀"], [/rope/, "🪢"], [/straw/, "🥤"],
  [/string/, "🧵"], [/stick/, "🪵"], [/vine/, "🌿"], [/eraser/, "🧽"], [/button/, "🔘"],
  [/peg/, "📌"], [/ruler/, "📏"], [/book/, "📚"], [/feather/, "🪶"], [/leaf|leav/, "🍃"],
  [/paper/, "📄"], [/rock|brick/, "🪨"], [/apple/, "🍎"], [/backpack|school bag|bag/, "🎒"],
  [/chair/, "🪑"], [/table|desk/, "🪑"], [/cup|mug/, "☕"], [/bucket/, "🪣"], [/bottle/, "🍼"],
  [/jug/, "🫙"], [/jar/, "🫙"], [/fish tank|tank/, "🐟"], [/bathtub|bath/, "🛁"], [/bowl/, "🥣"],
  [/watering can/, "🪴"], [/teddy|bear/, "🧸"], [/watermelon/, "🍉"], [/dog/, "🐕"], [/car/, "🚗"],
  [/suitcase/, "🧳"], [/pool/, "🏊"], [/soil|garden|grass|lawn/, "🌱"], [/sand/, "🏖️"],
  [/water|juice|drink|milk/, "💧"], [/parcel|box|storage/, "📦"], [/tree/, "🌳"], [/blink/, "😉"],
  [/clap/, "👏"], [/jump/, "🤸"], [/sleep/, "😴"], [/movie|watch/, "🎬"], [/read/, "📖"],
  [/wash/, "🧼"], [/wake/, "🌅"], [/lunch|dinner|eat/, "🍽️"], [/bed/, "🛏️"], [/brush/, "🪥"],
  [/school/, "🏫"], [/camp/, "⛺"], [/train/, "🚆"], [/bus/, "🚌"], [/flight|plane/, "✈️"],
  [/morning/, "🌅"], [/afternoon/, "☀️"], [/evening/, "🌆"], [/night/, "🌙"],
];
function emojiFor(label: string): string {
  const l = label.toLowerCase();
  for (const [re, e] of EMOJI) if (re.test(l)) return e;
  return "📦";
}
function optionLabels(q: Q): string[] {
  return (q.options ?? []).map((o) => (typeof o === "string" ? o : String((o as { label?: string }).label ?? ""))).filter(Boolean);
}

const has = (s: string | undefined, ...keys: string[]) => !!s && keys.some((k) => s.includes(k));

// Domain concept fallbacks — premium instrument icon, answer-neutral.
function concept(skill: string, label: string): MzVisual {
  return { kind: "concept", icon: skill, label };
}

export function deriveMeasurelandsAssessmentVisual(q: Q): MzVisual | undefined {
  const skill = (q.skillId ?? "").toLowerCase();
  const prompt = q.prompt ?? "";
  const answer = q.correctAnswer ?? "";
  const promptA = `${prompt} ${answer}`;

  // ── Metric conversions ── show the GIVEN measurement + the target unit as "?"
  // (never the converted answer).
  if (has(skill, "convert")) {
    const from = valueWithUnit(prompt);
    const toUnit = valueWithUnit(answer)?.unit;
    if (from && toUnit) return { kind: "convert", fromValue: from.value, fromUnit: from.unit, toValue: 0, toUnit };
    return concept("convert", "Metric Conversion");
  }

  // ── Angles ── show the GIVEN angle; the unknown stays a "?".
  if (has(skill, "angle") || has(skill, "straight_line", "missing_angle")) {
    if (has(skill, "straight_line", "missing_angle")) {
      const known = firstNum(prompt);
      const unknown = firstNum(answer);
      if (known !== undefined && unknown !== undefined) {
        const total = known + unknown >= 300 ? 360 : 180;
        return { kind: "angle", known, unknown, total: total as 180 | 360 };
      }
    }
    if (has(skill, "right_angle")) return { kind: "angle", single: 90 };
    return concept("angle", "Angles");
  }

  // ── Volume ── an OUTLINE prism (Year 6 reasons with l×w×h; no countable cubes).
  if (has(skill, "volume")) {
    if (has(skill, "array")) {
      const n = nums(prompt);
      if (n.length >= 3) return { kind: "cubes", l: n[1], w: n[0], h: n[2] };
    }
    if (has(skill, "compare")) return compareCards(q) ?? concept("volume", "Volume");
    return concept("volume", "Volume");
  }

  // ── Area ── labelled rectangle with its dimensions (no countable grid → no free answer).
  if (has(skill, "area") && !has(skill, "area_or_perimeter")) {
    const dims = nums(prompt).filter((n) => n <= 30);
    if ((has(skill, "formula", "rectangle") || /rows of|by/.test(prompt)) && dims.length >= 2) {
      return { kind: "rectangle", w: dims[0], h: dims[1], mode: "area", unit: /m²|m\b/.test(promptA) ? "m" : /cm/.test(promptA) ? "cm" : "" };
    }
    if (has(skill, "compare")) return compareCards(q) ?? concept("area", "Area");
    return concept("area", "Area");
  }

  // ── Perimeter ── labelled rectangle, edge highlighted; dimensions given, not the total.
  if (has(skill, "perimeter")) {
    if (has(skill, "find", "reasoning")) {
      const dims = nums(prompt).filter((n) => n <= 50);
      if (dims.length >= 2) return { kind: "rectangle", w: dims[0], h: dims[1], mode: "perimeter", unit: /m\b/.test(promptA) ? "m" : "units" };
    }
    return concept("perimeter", "Perimeter");
  }

  // ── Temperature ── the two GIVEN temps for a difference; else a neutral thermometer.
  if (has(skill, "temperature")) {
    const t = nums(promptA).filter((n) => n <= 60);
    if (has(skill, "difference") && t.length >= 2) return { kind: "thermometer", from: Math.min(t[0], t[1]), value: Math.max(t[0], t[1]) };
    return concept("thermometer", "Temperature");
  }

  // ── Clock ── reading the clock IS the task; the hands are the stimulus.
  if (has(skill, "clock", "time_24")) {
    const clock = parseClock(answer, prompt);
    if (clock) return { kind: "clock", ...clock };
    return concept("clock", "Time");
  }

  // ── Ruler ── reading the ruler IS the task.
  if (has(skill, "read_ruler", "measure_precisely")) {
    const cm = firstNum(answer);
    if (cm !== undefined && /cm/.test(answer)) return { kind: "ruler", toCm: cm };
    return concept("ruler", "Reading a Ruler");
  }
  if (has(skill, "ruler")) return concept("ruler", "Reading a Ruler");

  // ── Scales / mass ──
  if (has(skill, "scale") || (has(skill, "mass") && /\d\s*k?g/.test(answer))) {
    if (has(skill, "read_scale", "scale_reasoning")) {
      const v = valueWithUnit(prompt) ?? valueWithUnit(answer);
      if (v && (v.unit === "g" || v.unit === "kg")) return { kind: "scaleDial", value: v.value, unit: v.unit, max: v.unit === "kg" ? Math.max(5, Math.ceil(v.value)) : 1000 };
    }
    if (has(skill, "compare")) return compareCards(q) ?? promptCards(q) ?? concept("scale", "Mass");
    if (has(skill, "measure")) return promptCards(q) ?? concept("scale", "Mass");
    return concept("scale", "Mass");
  }

  // ── Jugs / capacity ──
  if (has(skill, "jug") || has(skill, "ml_l") || has(skill, "capacity")) {
    if (has(skill, "read_jug")) {
      const v = valueWithUnit(promptA);
      if (v && (v.unit === "mL" || v.unit === "L")) return { kind: "jug", value: v.value, unit: v.unit, max: v.unit === "L" ? Math.max(2, Math.ceil(v.value)) : 1000 };
    }
    if (has(skill, "compare")) return compareCards(q) ?? promptCards(q) ?? concept("jug", "Capacity");
    if (has(skill, "order", "measure")) return promptCards(q) ?? concept("jug", "Capacity");
    return concept("jug", "Capacity");
  }

  // ── Length (non-ruler) ──
  if (has(skill, "length", "metre", "cm", "formal_units", "informal_units", "fair_units", "accuracy")) {
    if (has(skill, "difference")) return promptCards(q) ?? concept("ruler", "Length");
    if (has(skill, "compare", "order", "height")) {
      const cards = compareCards(q);
      if (cards) return cards;
      const labels = optionLabels(q).slice(0, 4);
      if (labels.length && !labels.some((l) => /\d/.test(l) || l.includes(","))) return { kind: "objects", items: labels.map((l) => ({ label: l, emoji: emojiFor(l) })) };
    }
    return concept("ruler", "Length");
  }

  // ── Time of day / duration / calendar / sequencing ──
  if (has(skill, "time_of_day", "duration", "sequenc", "calendar", "days", "months", "week", "time_units", "elapsed", "advanced_time", "timetable", "time_problems", "compare_times")) {
    if (has(skill, "elapsed", "advanced_time", "timetable", "time_problems", "compare_times")) {
      const clock = parseClock(answer, prompt);
      if (clock && /\d/.test(answer)) return { kind: "clock", ...clock };
      return concept("duration", "Elapsed Time");
    }
    const labels = optionLabels(q).slice(0, 4);
    if (labels.length && labels.every((l) => l.length <= 22) && !labels.some((l) => l.includes(","))) {
      return { kind: "objects", items: labels.map((l) => ({ label: l, emoji: emojiFor(l) })) };
    }
    return concept("calendar", "Time");
  }

  // ── Mass / capacity qualitative compare (named objects) ──
  if (has(skill, "mass", "capacity")) {
    const labels = optionLabels(q).slice(0, 4);
    if (labels.length && !labels.some((l) => /\d/.test(l) || l.includes(","))) {
      return { kind: "objects", items: labels.map((l) => ({ label: l, emoji: emojiFor(l) })) };
    }
    return concept(has(skill, "capacity") ? "jug" : "scale", has(skill, "capacity") ? "Capacity" : "Mass");
  }

  // ── Optimisation / investigations / tool choice / misc reasoning ──
  if (has(skill, "optimisation", "project", "investigation", "master", "tool", "mixed_metric", "decisions")) {
    return concept("tools", "Measurement Thinking");
  }

  return concept("ruler", "Measurement");
}
