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
      have={paid}
      cost={cost}
      haveLabel="You pay"
      costLabel="It costs"
      options={options}
      answer={answer}
      onCorrect={onCorrect}
      onWrong={onWrong}
      prompt={`You pay $${paid} for a $${cost} toy. How much change do you get?`}
    />
  );
}
