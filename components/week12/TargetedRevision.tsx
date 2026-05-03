"use client";

import { useMemo, useState } from "react";
import AddDotsMatch from "@/components/week5/AddDotsMatch";
import PartPartWhole from "@/components/week5/PartPartWhole";
import MentalAdd from "@/components/week5/MentalAdd";
import SubtractTakeAway from "@/components/week6/SubtractTakeAway";
import SubtractMoveToTaken from "@/components/week6/SubtractMoveToTaken";
import SubtractMissingPart from "@/components/week6/SubtractMissingPart";
import DoubleIt from "@/components/week11/DoubleIt";
import NearDouble from "@/components/week11/NearDouble";
import DoubleDetective from "@/components/week11/DoubleDetective";
import ShareDrag from "@/components/week9/ShareDrag";
import ShareDeal from "@/components/week9/ShareDeal";
import ShareFair from "@/components/week9/ShareFair";
import TapGroupsSkipCount from "@/components/week10/TapGroupsSkipCount";
import BuildGroupsSkipCount from "@/components/week10/BuildGroupsSkipCount";
import ChooseSkipCount from "@/components/week10/ChooseSkipCount";
import { speak } from "@/lib/speak";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type Area = "Addition" | "Subtraction" | "Doubles" | "Sharing" | "Grouping";

function buildOptions(answer: number, max = 20) {
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const n = Math.max(0, Math.min(max, answer + (Math.floor(Math.random() * 7) - 3)));
    set.add(n);
  }
  return Array.from(set).sort(() => Math.random() - 0.5);
}

function randEvenShare(totalMin: number, totalMax: number, groupsMin: number, groupsMax: number) {
  const total = randInt(totalMin, totalMax);
  const groups = randInt(groupsMin, groupsMax);
  if (total % groups !== 0) return randEvenShare(totalMin, totalMax, groupsMin, groupsMax);
  return { total, groups };
}

function optionsForAnswer(answer: number) {
  return buildOptions(answer).map(String);
}

export default function TargetedRevision({
  onCorrect,
  onWrong,
}: {
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const areas: Area[] = ["Addition", "Subtraction", "Doubles", "Sharing", "Grouping"];
  const [area, setArea] = useState<Area | null>(null);
  const [step, setStep] = useState<"select" | "booster" | "fix" | "missing">("select");
  const [boosterIdx, setBoosterIdx] = useState(0);
  const [boosterSeed, setBoosterSeed] = useState(0);
  const boosterCount = 6;

  const fixPrompt = "12 − 8 = 6";
  const fixIsCorrect = false;
  const [fixStage, setFixStage] = useState<"check" | "solve">("check");
  const fixAnswer = 4;
  const fixOptions = useMemo(() => buildOptions(fixAnswer), []);

  const missPrompt = "15 − 7";
  const missOptions = [5, 7, 3, 4];
  const missAnswer = 5;

  function advanceBooster() {
    if (boosterIdx + 1 >= boosterCount) setStep("fix");
    else {
      setBoosterIdx((i) => i + 1);
      setBoosterSeed((s) => s + 1);
    }
  }

  function chooseBooster(_opt: number) {
    // booster rendering is handled by renderBooster() which uses advanceBooster directly
    advanceBooster();
  }

  function chooseFix(choice: "correct" | "incorrect") {
    if ((choice === "correct") === fixIsCorrect) {
      if (fixIsCorrect) setStep("missing");
      else setFixStage("solve");
    } else {
      onWrong?.();
    }
  }

  function chooseFixSolve(opt: number) {
    if (opt === fixAnswer) setStep("missing");
    else onWrong?.();
  }

  function chooseMissing(opt: number) {
    if (opt === missAnswer) onCorrect?.();
    else onWrong?.();
  }

  function renderBooster() {
    if (!area) return null;

    if (area === "Addition") {
      const mode = boosterSeed % 3;
      if (mode === 0) {
        return (
          <AddDotsMatch
            key={`booster-add-${boosterSeed}`}
            a={randInt(3, 10)}
            b={randInt(2, 9)}
            maxDots={20}
            onCorrect={advanceBooster}
            onWrong={() => onWrong?.()}
          />
        );
      }
      if (mode === 1) {
        const a = randInt(3, 9);
        const b = randInt(3, 9);
        const whole = a + b;
        return (
          <PartPartWhole
            key={`booster-ppw-${boosterSeed}`}
            mode="missingWhole"
            a={a}
            b={b}
            whole={whole}
            onCorrect={advanceBooster}
            onWrong={() => onWrong?.()}
          />
        );
      }
      const a = randInt(6, 10);
      const b = randInt(3, 9);
      const answer = a + b;
      return (
        <MentalAdd
          key={`booster-mental-${boosterSeed}`}
          prompt="Use a strategy to add"
          equation={`${a} + ${b}`}
          strategy="make10"
          a={a}
          b={b}
          options={buildOptions(answer)}
          answer={answer}
          onCorrect={advanceBooster}
          onWrong={() => onWrong?.()}
        />
      );
    }

    if (area === "Subtraction") {
      const mode = boosterSeed % 3;
      if (mode === 0) {
        const total = randInt(8, 20);
        const remove = randInt(2, 9);
        return (
          <SubtractTakeAway
            key={`booster-sub-take-${boosterSeed}`}
            total={total}
            remove={remove}
            mode="takeAway"
            onCorrect={advanceBooster}
            onWrong={() => onWrong?.()}
          />
        );
      }
      if (mode === 1) {
        const total = randInt(8, 20);
        const remove = randInt(2, 9);
        return (
          <SubtractMoveToTaken
            key={`booster-sub-move-${boosterSeed}`}
            total={total}
            remove={remove}
            onCorrect={advanceBooster}
            onWrong={() => onWrong?.()}
          />
        );
      }
      const total = randInt(8, 20);
      const part = randInt(2, 9);
      const options = buildOptions(total - part).map(String);
      return (
        <SubtractMissingPart
          key={`booster-sub-miss-${boosterSeed}`}
          total={total}
          part={part}
          options={options}
          onCorrect={advanceBooster}
          onWrong={() => onWrong?.()}
        />
      );
    }

    if (area === "Doubles") {
      const mode = boosterSeed % 3;
      if (mode === 0) {
        return <DoubleIt key={`booster-double-${boosterSeed}`} onCorrect={advanceBooster} onWrong={() => onWrong?.()} />;
      }
      if (mode === 1) {
        return <NearDouble key={`booster-near-${boosterSeed}`} onCorrect={advanceBooster} onWrong={() => onWrong?.()} />;
      }
      return <DoubleDetective key={`booster-detect-${boosterSeed}`} onCorrect={advanceBooster} onWrong={() => onWrong?.()} />;
    }

    if (area === "Sharing") {
      const mode = boosterSeed % 3;
      if (mode === 0) {
        const { total, groups } = randEvenShare(6, 20, 2, 5);
        return (
          <ShareDrag
            key={`booster-share-drag-${boosterSeed}`}
            total={total}
            groups={groups}
            onCorrect={advanceBooster}
            onWrong={() => onWrong?.()}
          />
        );
      }
      if (mode === 1) {
        const { total, groups } = randEvenShare(6, 20, 2, 5);
        return (
          <ShareDeal
            key={`booster-share-deal-${boosterSeed}`}
            total={total}
            groups={groups}
            onCorrect={advanceBooster}
            onWrong={() => onWrong?.()}
          />
        );
      }
      const total = 10;
      const groups = 3;
      const distribution = [4, 3, 3];
      return (
        <ShareFair
          key={`booster-share-fair-${boosterSeed}`}
          total={total}
          groups={groups}
          distribution={distribution}
          isFair={false}
          onCorrect={advanceBooster}
          onWrong={() => onWrong?.()}
        />
      );
    }

    const mode = boosterSeed % 3;
    if (mode === 0) {
      const groups = randInt(2, 4);
      const perGroup = randInt(2, 5);
      const answer = groups * perGroup;
      return (
        <TapGroupsSkipCount
          key={`booster-group-tap-${boosterSeed}`}
          groups={groups}
          perGroup={perGroup}
          options={optionsForAnswer(answer)}
          answer={String(answer)}
          onCorrect={advanceBooster}
          onWrong={() => onWrong?.()}
        />
      );
    }
    if (mode === 1) {
      const groups = randInt(2, 4);
      const perGroup = randInt(2, 5);
      const total = groups * perGroup;
      return (
        <BuildGroupsSkipCount
          key={`booster-group-build-${boosterSeed}`}
          total={total}
          perGroup={perGroup}
          options={optionsForAnswer(total)}
          answer={String(total)}
          onCorrect={advanceBooster}
          onWrong={() => onWrong?.()}
        />
      );
    }
    const perGroup = [2, 5, 10][randInt(0, 2)];
    const groups = perGroup === 10 ? 2 : randInt(2, 4);
    const options = ["Count by 2s", "Count by 5s", "Count by 10s"];
    const answer =
      perGroup === 2 ? "Count by 2s" : perGroup === 5 ? "Count by 5s" : "Count by 10s";
    return (
      <ChooseSkipCount
        key={`booster-group-choose-${boosterSeed}`}
        groups={groups}
        perGroup={perGroup}
        options={options}
        answer={answer}
        onCorrect={advanceBooster}
        onWrong={() => onWrong?.()}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      {step === "select" && (
        <>
          <div className="text-lg font-extrabold text-gray-900 mb-2">
            Choose your Practise Area
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {areas.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => {
                  setArea(a);
                  setStep("booster");
                }}
                className="px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold"
              >
                {a}
              </button>
            ))}
          </div>
        </>
      )}

      {step === "booster" && area && (
        <>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="text-lg font-extrabold text-gray-900">
              Weak Spot Booster • {area}
            </div>
            <button
              type="button"
              onClick={() => speak(`Practise ${area}`)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
            >
              🔊 Read
            </button>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            Question {boosterIdx + 1} of {boosterCount}
          </div>
          {renderBooster()}
        </>
      )}

      {step === "fix" && (
        <>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="text-lg font-extrabold text-gray-900">Fix the Mistake</div>
            <button
              type="button"
              onClick={() => speak(`Is this correct? ${fixPrompt}`)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
            >
              🔊 Read
            </button>
          </div>
          <div className="text-2xl font-extrabold text-gray-900 mb-3 text-center">
            {fixPrompt}
          </div>

          {fixStage === "check" ? (
            <div className="grid md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => chooseFix("correct")}
                className="px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold"
              >
                Correct
              </button>
              <button
                type="button"
                onClick={() => chooseFix("incorrect")}
                className="px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold"
              >
                Not correct
              </button>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-2">Solve it:</div>
              <div className="grid gap-2">
                {fixOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => chooseFixSolve(opt)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {step === "missing" && (
        <>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="text-lg font-extrabold text-gray-900">Missing Step</div>
            <button
              type="button"
              onClick={() => speak(`For ${missPrompt}, jump back to 10. What was the first jump?`)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
            >
              🔊 Read
            </button>
          </div>
          <div className="text-sm text-gray-600 mb-2">Problem:</div>
          <div className="text-2xl font-extrabold text-gray-900 mb-2 text-center">
            {missPrompt}
          </div>
          <div className="text-sm text-gray-600 mb-3 text-center">
            Jump back to 10 (−5), then −2
          </div>
          <div className="text-sm font-bold text-gray-700 mb-2">What was the first jump?</div>
          <div className="grid gap-2">
            {missOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => chooseMissing(opt)}
                className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold"
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
