export type PracticeTask =
  | {
      kind: "mcq";
      prompt: string;
      options: string[];
      answer: string;
      feedback?: { correct: string; wrong: string };
    }
  | {
      kind: "order3";
      prompt: string;
      numbers: number[];
      direction: "ASC" | "DESC";
    }
  | {
      kind: "count";
      prompt: string;
      count: number;
      max: number;
    }
  | {
      kind: "audioPick";
      prompt: string;
      targetNumber: number;
      cards: number[];
      speechText?: string;
    }
  | {
      kind: "numberHunt";
      prompt: string;
      targetNumber: number;
      tiles: number[];
    }
  | {
      kind: "matchPairs";
      prompt: string;
      config: {
        min?: number;
        max?: number;
        pairsCount?: number;
      };
    }
  | {
      kind: "countObjects";
      prompt: string;
      options: number[];
      answer: number;
    }
  | {
      kind: "fillTheJar";
      prompt: string;
      total: number;
      target: number;
    }
  | {
      kind: "countCircle";
      prompt: string;
      totalDots: number;
      target: number;
    }
  | {
      kind: "typeNumber";
      prompt: string;
      target: number;
      word: string;
    }
  | {
      kind: "numberLadder";
      prompt: string;
      start: number;
      target: number;
      min: number;
      max: number;
    }
  | {
      kind: "numberLineTap";
      prompt: string;
      min: number;
      max: number;
      target: number;
    }
  | {
      kind: "numberLineJump";
      prompt: string;
      min: number;
      max: number;
      start: number;
      target: number;
      step: number;
    }
  | {
      kind: "chartFill";
      prompt: string;
      min: number;
      max: number;
      missing: number[];
    }
  | {
      kind: "tensOnesMcq";
      prompt: string;
      min: number;
      max: number;
    }
  | {
      kind: "partitionTwoWays";
      prompt: string;
      min: number;
      max: number;
    }
  | {
      kind: "splitStepper";
      prompt: string;
      target: number;
    }
  | {
      kind: "mabBuild";
      prompt: string;
      target: number;
      maxTens?: number;
      maxOnes?: number;
    }
  | {
      kind: "placeValueDice";
      prompt: string;
    }
  | {
      kind: "equalGroups";
      prompt: string;
    }
  | {
      kind: "equalGroupsMcq";
      prompt: string;
      options: { groups: number[] }[];
      correctIndex: number;
    }
  | {
      kind: "groupCountVisual";
      prompt: string;
      groups: number;
      perGroup: number;
      options: string[];
      answer: string;
    }
  | {
      kind: "groupBoxes";
      prompt: string;
      groups: number;
      perGroup: number;
    }
  | {
      kind: "groupingEstimate";
      prompt: string;
      tensGroups: number;
      ones: number;
      options: string[];
      answer: string;
    }
  | {
      kind: "addDots";
      prompt: string;
      a: number;
      b: number;
      maxDots: number;
    }
  | {
      kind: "ppw";
      prompt: string;
      mode: "missingWhole" | "missingPart" | "build";
      a: number;
      b: number;
      whole: number;
      missing?: "a" | "b";
    }
  | {
      kind: "mentalAdd";
      prompt: string;
      equation: string;
      strategy: "make10" | "double" | "nearDouble";
      a: number;
      b: number;
      options: number[];
      answer: number;
    }
  | {
      kind: "subtractTakeAway";
      total: number;
      remove: number;
      mode: "equation" | "takeAway" | "startWith";
    }
  | {
      kind: "subtractMoveToTaken";
      total: number;
      remove: number;
    }
  | {
      kind: "subtractMissingPart";
      total: number;
      part: number;
      options: string[];
    }
  | {
      kind: "tapGroupsSkipCount";
      groups: number;
      perGroup: number;
      options: string[];
      answer: string;
    }
  | {
      kind: "buildGroupsSkipCount";
      total: number;
      perGroup: number;
      options: string[];
      answer: string;
    }
  | {
      kind: "chooseSkipCount";
      groups: number;
      perGroup: number;
      options: string[];
      answer: string;
    }
  | {
      kind: "arrayBuilder";
      rows: number;
      cols: number;
      options: string[];
      answer: string;
    }
  | {
      kind: "barGroupModel";
      groups: number;
      perGroup: number;
      options: string[];
      answer: string;
    }
  | {
      kind: "missingGroupCount";
      perGroup: number;
      total: number;
      options: string[];
      answer: string;
    }
  | {
      kind: "groupStory";
      groups: number;
      perGroup: number;
      itemLabel: string;
      containerLabel: string;
      options: string[];
      answer: string;
    }
  | {
      kind: "howManyGroupsStory";
      total: number;
      perGroup: number;
      itemLabel: string;
      containerLabel: string;
      options: string[];
      answer: string;
    }
  | {
      kind: "twoStepGrouping";
      groups: number;
      perGroup: number;
      broken: number;
      itemLabel: string;
      containerLabel: string;
      options: string[];
      answer: string;
    }
  | {
      kind: "flashFacts";
      durationSeconds: number;
    }
  | {
      kind: "make10Builder";
    }
  | {
      kind: "missingNumberFacts";
    }
  | {
      kind: "doubleIt";
    }
  | {
      kind: "nearDouble";
    }
  | {
      kind: "doubleDetective";
    }
  | {
      kind: "gridRace";
    }
  | {
      kind: "factMatch";
    }
  | {
      kind: "climbLadder";
    }
  | {
      kind: "mixedReviewSprint";
      durationSeconds: number;
    }
  | {
      kind: "strategyChoice";
      total: number;
      remove: number;
      options: number[];
      answer: number;
    }
  | {
      kind: "targetedRevision";
    }
  | {
      kind: "funGames";
    }
  | {
      kind: "subtractBar";
      total: number;
      remove: number;
      options: string[];
    }
  | {
      kind: "mentalSubtract";
      strategy: "make10" | "factFamily" | "countUp";
      total: number;
      remove: number;
      options: string[];
      answer: number;
    }
  | {
      kind: "storyOpChoice";
      story: string;
      answer: "add" | "subtract";
      variant: "choice" | "sort";
    }
  | {
      kind: "missingOperation";
      story?: string;
      a: number;
      b: number;
      result: number;
      answer: "+" | "-";
    }
  | {
      kind: "storySolve";
      story: string;
      a: number;
      b: number;
      op: "add" | "subtract";
      answer: number;
      requireOpChoice?: boolean;
      options: string[];
      hideEquation?: boolean;
      allowEquationInput?: boolean;
    }
  | {
      kind: "moneyMakeAmount";
      target: number;
      allowTen?: boolean;
    }
  | {
      kind: "moneyChange";
      paid: number;
      cost: number;
      answer: number;
      options: string[];
    }
  | {
      kind: "moneyEnough";
      have: number;
      cost: number;
      answer: "YES" | "NO";
    }
  | {
      kind: "joinStories";
      story: string;
      a: number;
      b: number;
      options: string[];
      answer: number;
    }
  | {
      kind: "combineGroups";
      a: number;
      b: number;
      options: string[];
      answer: number;
    }
  | {
      kind: "compareGroups";
      a: number;
      b: number;
      options: string[];
      answer: number;
    }
  | {
      kind: "make20Visual";
      a: number;
      b: number;
      options: string[];
      answer: number;
    }
  | {
      kind: "moneyAddPrices";
      itemA: string;
      itemB: string;
      priceA: number;
      priceB: number;
      options: string[];
      answer: number;
    }
  | {
      kind: "moneyHowMuchMore";
      have: number;
      cost: number;
      options: string[];
      answer: number;
    }
  | {
      kind: "moneyChangeUp";
      paid: number;
      cost: number;
      options: string[];
      answer: number;
    }
  | {
      kind: "buildStory";
      story: string;
      mode: "add" | "subtract";
      start: number;
      change: number;
      options: string[];
      answer: number;
    }
  | {
      kind: "twoMats";
      story: string;
      mode: "add" | "subtract";
      a: number;
      b: number;
      total?: number;
      options: string[];
      answer: number;
    }
  | {
      kind: "whatHappened";
      before: number;
      after: number;
      answerOp: "add" | "subtract";
      options: string[];
      answer: number;
    }
  | {
      kind: "barModel";
      total: number;
      part: number;
      missing: number;
      options: string[];
      answer: number;
    }
  | {
      kind: "compareBars";
      story: string;
      a: number;
      b: number;
      options: string[];
      answer: number;
    }
  | {
      kind: "strategySelect";
      total: number;
      remove: number;
      options: string[];
      answer: number;
    }
  | {
      kind: "shareDrag";
      total: number;
      groups: number;
    }
  | {
      kind: "shareDeal";
      total: number;
      groups: number;
    }
  | {
      kind: "shareFair";
      total: number;
      groups: number;
      distribution: number[];
      isFair: boolean;
    }
  | {
      kind: "groupBoxesInput";
      total: number;
      groups: number;
    }
  | {
      kind: "groupBoxesTap";
      total: number;
      groups: number;
    }
  | {
      kind: "missingGroupSize";
      total: number;
      groups: number;
      options: string[];
      answer: number;
    }
  | {
      kind: "packBoxes";
      total: number;
      perBox: number;
    }
  | {
      kind: "groupGrabBags";
      total: number;
      size: number;
    }
  | {
      kind: "howManyGroups";
      total: number;
      size: number;
    };
