"use client";

import { Fragment } from "react";

const FRACTION_TOKEN_PATTERN = /(\d+\s+\d+\/\d+|\d+\/\d+)/g;
const FRACTION_TOKEN_EXACT_PATTERN = /^(\d+\s+\d+\/\d+|\d+\/\d+)$/;

export type FractionSize = "sm" | "md" | "lg";

function isFractionToken(value: string) {
  return FRACTION_TOKEN_EXACT_PATTERN.test(value);
}

function sizeClasses(size: FractionSize) {
  switch (size) {
    case "sm":
      return {
        numerator: "text-[0.66em]",
        denominator: "text-[0.66em]",
        whole: "text-[0.95em]",
        bar: "h-[0.08em] w-[1.05em]",
        gap: "gap-1",
        pad: "px-[0.12em] py-[0.08em]",
      };
    case "lg":
      return {
        numerator: "text-[0.82em]",
        denominator: "text-[0.82em]",
        whole: "text-[1.02em]",
        bar: "h-[0.1em] w-[1.28em]",
        gap: "gap-1.5",
        pad: "px-[0.18em] py-[0.1em]",
      };
    case "md":
    default:
      return {
        numerator: "text-[0.74em]",
        denominator: "text-[0.74em]",
        whole: "text-[1em]",
        bar: "h-[0.09em] w-[1.15em]",
        gap: "gap-1.5",
        pad: "px-[0.15em] py-[0.08em]",
      };
  }
}

export function Fraction({
  numerator,
  denominator,
  size = "md",
  whole,
}: {
  numerator: number | string;
  denominator: number | string;
  size?: FractionSize;
  whole?: number | string;
}) {
  const classes = sizeClasses(size);

  const stack = (
    <span
      className={[
        "inline-flex flex-col items-center justify-center align-middle leading-none",
        classes.pad,
      ].join(" ")}
    >
      <span className={classes.numerator}>{numerator}</span>
      <span className={`my-[0.1em] rounded-full bg-current ${classes.bar}`} />
      <span className={classes.denominator}>{denominator}</span>
    </span>
  );

  if (whole !== undefined) {
    return (
      <span className={`inline-flex items-center align-middle ${classes.gap}`}>
        <span className={classes.whole}>{whole}</span>
        {stack}
      </span>
    );
  }

  return stack;
}

function FractionToken({
  token,
  compact = false,
  size,
}: {
  token: string;
  compact?: boolean;
  size?: FractionSize;
}) {
  const resolvedSize = size ?? (compact ? "sm" : "md");
  const mixedMatch = token.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  const simpleMatch = token.match(/^(\d+)\/(\d+)$/);

  if (mixedMatch) {
    const [, whole, numerator, denominator] = mixedMatch;
    return (
      <Fraction
        whole={whole}
        numerator={numerator}
        denominator={denominator}
        size={resolvedSize}
      />
    );
  }

  if (simpleMatch) {
    const [, numerator, denominator] = simpleMatch;
    return <Fraction numerator={numerator} denominator={denominator} size={resolvedSize} />;
  }

  return <>{token}</>;
}

// Unicode superscripts come from two blocks: ¹²³ are in most fonts, but ⁰⁴-⁹ⁿ
// fall back to another font at a different size. Draw every run as <sup> with
// ordinary characters so powers like 2¹⁸ and ((2³)³)² look consistent.
const SUPERSCRIPTS: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁺": "+", "⁻": "−", "⁼": "=", "⁽": "(", "⁾": ")", "ⁿ": "n", "ˣ": "x" };
const SUPERSCRIPT_RUN = /([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿˣ]+)/;

export function SuperscriptText({ text }: { text: string }) {
  if (!SUPERSCRIPT_RUN.test(text)) return <>{text}</>;
  return (
    <>
      {text.split(SUPERSCRIPT_RUN).map((part, index) =>
        index % 2 === 1 ? (
          <sup key={index} className="relative top-[-0.05em] align-super text-[0.68em] leading-none">
            {[...part].map((ch) => SUPERSCRIPTS[ch] ?? ch).join("")}
          </sup>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function MathFormattedText({
  text,
  compactFractions = false,
  fractionSize,
}: {
  text: string;
  compactFractions?: boolean;
  fractionSize?: FractionSize;
}) {
  const parts = text.split(FRACTION_TOKEN_PATTERN);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;
        return (
          <Fragment key={`${part}-${index}`}>
            {isFractionToken(part) ? (
              <FractionToken token={part} compact={compactFractions} size={fractionSize} />
            ) : (
              <span><SuperscriptText text={part} /></span>
            )}
          </Fragment>
        );
      })}
    </>
  );
}

export function FractionText({
  value,
  compact = false,
  size,
}: {
  value: string;
  compact?: boolean;
  size?: FractionSize;
}) {
  return <FractionToken token={value} compact={compact} size={size} />;
}
