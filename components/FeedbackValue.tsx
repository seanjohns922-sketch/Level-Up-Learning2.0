"use client";
import { MathFormattedText } from "@/components/FractionText";

/** Feedback values read like the question: true minus signs and stacked fractions. */
export default function FeedbackValue({ value, unit, labels }: { value: unknown; unit?: string; labels?: string[] }) {
  let text = String(value ?? "").trim();
  // Two-box times and durations read as a time, not a list: "17, 0" → "17:00", "12, 15" → "12 min 15 s".
  const pair = labels?.length === 2 ? text.match(/^(\d+),\s*(\d+)$/) : null;
  if (pair && labels) {
    const [a, b] = [Number(pair[1]), Number(pair[2])];
    if (/24-hour/i.test(labels[0])) text = `${a}:${String(b).padStart(2, "0")}`;
    else if (/^hours?$/i.test(labels[0]) && /^minutes?$/i.test(labels[1])) text = [a ? `${a} h` : "", b ? `${b} min` : ""].filter(Boolean).join(" ") || "0 min";
    else if (/^minutes?$/i.test(labels[0]) && /^seconds?$/i.test(labels[1])) text = [a ? `${a} min` : "", b ? `${b} s` : ""].filter(Boolean).join(" ") || "0 s";
  }
  const number = /^-?\d+(\.\d+)?$/.test(text) ? Number(text) : null;
  if (number !== null && unit === "$") {
    const abs = Math.abs(number).toLocaleString("en-AU", { minimumFractionDigits: Number.isInteger(number) ? 0 : 2, maximumFractionDigits: 2 });
    text = `${number < 0 ? "-" : ""}$${abs}`;
  } else if (number !== null && unit) {
    text = unit === "%" || unit === "°C" || unit === "°F" ? `${text}${unit}` : `${text} ${unit}`;
  }
  // An improper fraction also shows its mixed number, so it matches working that ends "= −4 11/12".
  const improper = text.match(/^(-?)(\d+)\/(\d+)$/);
  if (improper && Number(improper[2]) > Number(improper[3])) {
    const [n, d] = [Number(improper[2]), Number(improper[3])];
    text = `${text} = ${improper[1]}${Math.floor(n / d)}${n % d ? ` ${n % d}/${d}` : ""}`;
  }
  text = text.replace(/(^|[\s(,=])-(?=[\d$])/g, "$1−");
  return <MathFormattedText text={text} compactFractions />;
}
