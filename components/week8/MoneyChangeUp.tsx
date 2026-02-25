"use client";

import MoneyCountUp from "./MoneyCountUp";

export default function MoneyChangeUp({
  paid,
  cost,
  options,
  answer,
  onCorrect,
  onWrong,
}: {
  paid: number;
  cost: number;
  options: string[];
  answer: number;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  return (
    <MoneyCountUp
      have={cost}
      cost={paid}
      options={options}
      answer={answer}
      onCorrect={onCorrect}
      onWrong={onWrong}
      promptPrefix={`You pay $${paid} for a $${cost} item.`}
    />
  );
}
