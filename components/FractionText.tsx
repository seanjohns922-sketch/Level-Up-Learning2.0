"use client";

import { Fragment } from "react";

const FRACTION_TOKEN_PATTERN = /(\d+\s+\d+\/\d+|\d+\/\d+)/g;
const FRACTION_TOKEN_EXACT_PATTERN = /^(\d+\s+\d+\/\d+|\d+\/\d+)$/;

function isFractionToken(value: string) {
  return FRACTION_TOKEN_EXACT_PATTERN.test(value);
}

function FractionToken({
  token,
  compact = false,
}: {
  token: string;
  compact?: boolean;
}) {
  const mixedMatch = token.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  const simpleMatch = token.match(/^(\d+)\/(\d+)$/);

  if (mixedMatch) {
    const [, whole, numerator, denominator] = mixedMatch;
    return (
      <span className="inline-flex items-center gap-1 align-middle">
        <span>{whole}</span>
        <span className="inline-flex flex-col items-center leading-none">
          <span className={compact ? "text-[0.7em]" : "text-[0.75em]"}>{numerator}</span>
          <span className="my-[0.08em] h-[0.08em] w-[0.95em] rounded-full bg-current" />
          <span className={compact ? "text-[0.7em]" : "text-[0.75em]"}>{denominator}</span>
        </span>
      </span>
    );
  }

  if (simpleMatch) {
    const [, numerator, denominator] = simpleMatch;
    return (
      <span className="inline-flex flex-col items-center align-middle leading-none">
        <span className={compact ? "text-[0.7em]" : "text-[0.75em]"}>{numerator}</span>
        <span className="my-[0.08em] h-[0.08em] w-[0.95em] rounded-full bg-current" />
        <span className={compact ? "text-[0.7em]" : "text-[0.75em]"}>{denominator}</span>
      </span>
    );
  }

  return <>{token}</>;
}

export function MathFormattedText({
  text,
  compactFractions = false,
}: {
  text: string;
  compactFractions?: boolean;
}) {
  const parts = text.split(FRACTION_TOKEN_PATTERN);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;
        return (
          <Fragment key={`${part}-${index}`}>
            {isFractionToken(part) ? (
              <FractionToken token={part} compact={compactFractions} />
            ) : (
              <span>{part}</span>
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
}: {
  value: string;
  compact?: boolean;
}) {
  return <FractionToken token={value} compact={compact} />;
}
