export type Difficulty = "easy" | "medium" | "hard";

/** Time-based difficulty gates (strict) */
export function getDifficultyFromTime(elapsedSeconds: number): Difficulty {
  if (elapsedSeconds < 270) return "easy";   // 0:00–4:30
  if (elapsedSeconds < 440) return "medium"; // 4:30–7:20
  return "hard";                              // 7:20–9:00
}

/** Scale a numeric range by difficulty */
export function diffRange(
  difficulty: Difficulty,
  easy: [number, number],
  medium: [number, number],
  hard: [number, number]
): [number, number] {
  if (difficulty === "easy") return easy;
  if (difficulty === "medium") return medium;
  return hard;
}

/** Pick a value from difficulty-scaled range */
export function diffPick(
  difficulty: Difficulty,
  easy: number,
  medium: number,
  hard: number
): number {
  if (difficulty === "easy") return easy;
  if (difficulty === "medium") return medium;
  return hard;
}

export type PracticeTask = (
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
        rounds?: number;
        mode?: "number-number" | "number-word";
      };
    }
  | {
      kind: "countObjects";
      prompt: string;
      options?: number[];
      answer?: number;
      config?: {
        min?: number;
        max?: number;
        rounds?: number;
        optionsCount?: number;
      };
    }
  | {
      kind: "fillTheJar";
      prompt: string;
      total?: number;
      target?: number;
      config?: {
        minTarget?: number;
        maxTarget?: number;
        rounds?: number;
        increments?: number[];
      };
    }
  | {
      kind: "countCircle";
      prompt: string;
      totalDots?: number;
      target?: number;
      config?: {
        minTarget?: number;
        maxTarget?: number;
        totalDots?: number;
        rounds?: number;
      };
    }
  | {
      kind: "typeNumber";
      prompt: string;
      target?: number;
      word?: string;
      answer?: number;
      min?: number;
      max?: number;
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
      step?: number;
      steps?: number[];
    }
  | {
      kind: "chartFill";
      prompt: string;
      min: number;
      max: number;
      missing: number[];
    }
  | {
      kind: "groundMatch";
      prompt: string;
      speakText?: string;
      introPrompt?: string;
      targetNumber: number;
      targetNumberName?: string;
      visualType: "ground-number-card" | "ground-quantity-card" | "ground-flash-match-card";
      promptType:
        | "number_to_numeral"
        | "numeral_to_group"
        | "group_to_numeral"
        | "number_to_objects"
        | "match_pair"
        | "word_audio_match"
        | "numeral_to_word"
        | "word_to_numeral"
        | "word_pair_match"
        | "same_or_different_group";
      helperVariant?: "numbot" | "speech_bubble" | "memory";
      objectType?: "dots" | "gems" | "stars" | "blocks" | "robot_tokens" | "energy_orbs" | "crystals" | "bolts" | "futuristic_coins" | "planets" | "rockets" | "number_orbs";
      patternLayout?: "dice" | "ten_frame" | "domino" | "finger" | "symmetry";
      shownNumeral?: number;
      shownQuantity?: number;
      shownWord?: string;
      shownSequence?: Array<number | "__">;
      shownSecondQuantity?: number;
      shownSecondObjectType?: "dots" | "gems" | "stars" | "blocks" | "robot_tokens" | "energy_orbs" | "crystals" | "bolts" | "futuristic_coins" | "planets" | "rockets" | "number_orbs";
      shownSecondPatternLayout?: "dice" | "ten_frame" | "domino" | "finger" | "symmetry";
      options: Array<{
        id: string;
        kind: "numeral" | "quantity" | "pair" | "word";
        numeral?: number;
        word?: string;
        quantity?: number;
        objectType?: "dots" | "gems" | "stars" | "blocks" | "robot_tokens" | "energy_orbs" | "crystals" | "bolts" | "futuristic_coins" | "planets" | "rockets" | "number_orbs";
        patternLayout?: "dice" | "ten_frame" | "domino" | "finger" | "symmetry";
        pairNumeral?: number;
        pairQuantity?: number;
        pairWord?: string;
        pairParts?: number[];
        pairPartObjectTypes?: Array<"dots" | "gems" | "stars" | "blocks" | "robot_tokens" | "energy_orbs" | "crystals" | "bolts" | "futuristic_coins" | "planets" | "rockets" | "number_orbs">;
        pairPartLayouts?: Array<"dice" | "ten_frame" | "domino" | "finger" | "symmetry">;
      }>;
      correctOptionId: string;
      feedback?: { correct: string; wrong: string };
    }
  | {
      kind: "groundCollect";
      prompt: string;
      speakText?: string;
      introPrompt?: string;
      targetNumber: number;
      objectType: "dots" | "gems" | "stars" | "blocks" | "robot_tokens" | "energy_orbs" | "crystals" | "bolts" | "futuristic_coins" | "planets" | "rockets" | "number_orbs";
      totalObjects: number;
      feedback?: { correct: string; wrong: string };
    }
  | {
      kind: "groundBuild";
      prompt: string;
      speakText?: string;
      introPrompt?: string;
      targetNumber: number;
      objectType: "dots" | "gems" | "stars" | "blocks" | "robot_tokens" | "energy_orbs" | "crystals" | "bolts" | "futuristic_coins" | "planets" | "rockets" | "number_orbs";
      compareMode?: "exact" | "more_than" | "less_than";
      compareBase?: number;
      visualStyle?: "double_ten_frame" | "energy_cell_grid" | "build_trays" | "crate_system" | "reactor_cells" | "stacked_groups" | "collection_shelves";
      maxBuild?: number;
      startingBuilt?: number;
      referenceGroup?: {
        quantity: number;
        objectType: "dots" | "gems" | "stars" | "blocks" | "robot_tokens" | "energy_orbs" | "crystals" | "bolts" | "futuristic_coins" | "planets" | "rockets" | "number_orbs";
        patternLayout?: "dice" | "ten_frame" | "domino" | "finger" | "symmetry";
      };
      buildMode?: "single" | "split";
      exampleParts?: number[];
      showExample?: boolean;
      hideSplitSupport?: boolean;
      exampleObjectTypes?: Array<"dots" | "gems" | "stars" | "blocks" | "robot_tokens" | "energy_orbs" | "crystals" | "bolts" | "futuristic_coins" | "planets" | "rockets" | "number_orbs">;
      examplePartLayouts?: Array<"dice" | "ten_frame" | "domino" | "finger" | "symmetry">;
      splitObjectTypes?: Array<"dots" | "gems" | "stars" | "blocks" | "robot_tokens" | "energy_orbs" | "crystals" | "bolts" | "futuristic_coins" | "planets" | "rockets" | "number_orbs">;
      splitPartLayouts?: Array<"dice" | "ten_frame" | "domino" | "finger" | "symmetry">;
      requireDifferentFromExample?: boolean;
      feedback?: { correct: string; wrong: string };
    }
  | {
      kind: "groundCompare";
      prompt: string;
      speakText?: string;
      introPrompt?: string;
      targetNumber: number;
      comparisonType: "more" | "less" | "equal" | "biggest" | "smallest" | "order" | "statement" | "match" | "different";
      helperVariant?: "numbot" | "battle" | "flash" | "ten_frame";
      visualStyle?: "balance_panels" | "reactor_cells" | "collection_shelves" | "crate_system" | "double_ten_frame" | "energy_cell_grid" | "stacked_groups";
      statementRelation?: "more" | "less" | "equal";
      referenceGroup?: {
        quantity: number;
        objectType: "dots" | "gems" | "stars" | "blocks" | "robot_tokens" | "energy_orbs" | "crystals" | "bolts" | "futuristic_coins" | "planets" | "rockets" | "number_orbs";
        patternLayout?: "dice" | "ten_frame" | "domino" | "finger" | "symmetry";
      };
      referenceRevealMs?: number;
      groups: Array<{
        id: string;
        quantity: number;
        objectType: "dots" | "gems" | "stars" | "blocks" | "robot_tokens" | "energy_orbs" | "crystals" | "bolts" | "futuristic_coins" | "planets" | "rockets" | "number_orbs";
        patternLayout?: "dice" | "ten_frame" | "domino" | "finger" | "symmetry";
      }>;
      correctGroupId?: string;
      correctOrderIds?: string[];
      orderDirection?: "ASC" | "DESC";
      feedback?: { correct: string; wrong: string };
    }
  | {
      kind: "groundFlash";
      prompt: string;
      speakText?: string;
      introPrompt?: string;
      targetNumber: number;
      displayNumber?: number;
      promptAfterReveal?: string;
      objectType: "dots" | "gems" | "stars" | "blocks" | "robot_tokens" | "energy_orbs" | "crystals" | "bolts" | "futuristic_coins" | "planets" | "rockets" | "number_orbs";
      patternLayout?: "dice" | "ten_frame" | "domino" | "finger" | "symmetry";
      revealType?: "objects" | "numeral";
      revealMs?: number;
      options: Array<{
        id: string;
        numeral?: number;
        numerals?: number[];
      }>;
      correctOptionId: string;
      feedback?: { correct: string; wrong: string };
    }
  | {
      kind: "groundHunt";
      prompt: string;
      speakText?: string;
      introPrompt?: string;
      targetNumber: number;
      tiles: Array<{
        id: string;
        numeral: number;
        isTarget: boolean;
      }>;
      feedback?: { correct: string; wrong: string };
    }
  | {
      kind: "groundSequence";
      prompt: string;
      speakText?: string;
      introPrompt?: string;
      targetNumber: number;
      sequence: Array<number | "__">;
      options: Array<{
        id: string;
        numeral?: number;
        numerals?: number[];
      }>;
      correctOptionId: string;
      feedback?: { correct: string; wrong: string };
    }
  | {
      kind: "groundTapCount";
      prompt: string;
      speakText?: string;
      introPrompt?: string;
      targetNumber: number;
      objectType: "dots" | "gems" | "stars" | "blocks" | "robot_tokens" | "energy_orbs" | "crystals" | "bolts" | "futuristic_coins" | "planets" | "rockets" | "number_orbs";
      options: Array<{
        id: string;
        numeral: number;
      }>;
      correctOptionId: string;
      feedback?: { correct: string; wrong: string };
    }
  | {
      kind: "groundMoveCount";
      prompt: string;
      speakText?: string;
      introPrompt?: string;
      targetNumber: number;
      objectType: "dots" | "gems" | "stars" | "blocks" | "robot_tokens" | "energy_orbs" | "crystals" | "bolts" | "futuristic_coins" | "planets" | "rockets" | "number_orbs";
      options: Array<{
        id: string;
        numeral: number;
      }>;
      correctOptionId: string;
      feedback?: { correct: string; wrong: string };
    }
  | {
      kind: "groundFeed";
      prompt: string;
      speakText?: string;
      introPrompt?: string;
      targetNumber: number;
      objectType: "energy_orbs" | "robot_tokens";
      totalObjects: number;
      feedback?: { correct: string; wrong: string };
    }
  | {
      kind: "groundSoundCount";
      prompt: string;
      speakText?: string;
      introPrompt?: string;
      targetNumber: number;
      options: Array<{
        id: string;
        numeral: number;
      }>;
      correctOptionId: string;
      feedback?: { correct: string; wrong: string };
    }
  | {
      kind: "groundOrderTap";
      prompt: string;
      speakText?: string;
      introPrompt?: string;
      targetNumber: number;
      startNumber?: number;
      pathNumerals?: number[];
      direction?: "ASC" | "DESC";
      uiMode?: "path" | "order";
      badgeLabel?: string;
      tiles: Array<{
        id: string;
        numeral: number;
      }>;
      feedback?: { correct: string; wrong: string };
    }
  | {
      kind: "groundGrowingCount";
      prompt: string;
      speakText?: string;
      introPrompt?: string;
      targetNumber: number;
      objectType: "dots" | "gems" | "stars" | "blocks" | "robot_tokens" | "energy_orbs" | "crystals" | "bolts" | "futuristic_coins" | "planets" | "rockets" | "number_orbs";
      revealMs?: number;
      options: Array<{
        id: string;
        numeral: number;
      }>;
      correctOptionId: string;
      feedback?: { correct: string; wrong: string };
    }
  | {
      kind: "groundOrdinal";
      prompt: string;
      speakText?: string;
      introPrompt?: string;
      targetNumber: number;
      badgeLabel?: string;
      scenario: "line" | "race" | "train" | "podium" | "rockets" | "queue" | "stepping_stones";
      mode: "identify" | "relative" | "place" | "same_position" | "which_place";
      characters: Array<{
        id: string;
        label: string;
        emoji: string;
      }>;
      order: Array<string | null>;
      raceStartOrder?: Array<string | null>;
      raceProgressOrders?: Array<Array<string | null>>;
      raceDurationMs?: number;
      secondaryOrder?: Array<string | null>;
      targetPosition?: number;
      positionOptions?: number[];
      secondaryTargetPosition?: number;
      targetCharacterId?: string;
      secondaryTargetCharacterId?: string;
      referenceCharacterId?: string;
      relation?: "before" | "after";
      revealMs?: number;
      correctBoolean?: boolean;
      feedback?: { correct: string; wrong: string };
    }
  | {
      kind: "groundSpatial";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scenario: "lab" | "map" | "obstacle" | "portal_room" | "treasure" | "maze";
      mode: "identify" | "place" | "same_position" | "changed_position";
      characters: Array<{
        id: string;
        label: string;
        emoji: string;
      }>;
      slots: Array<{
        id: string;
        label: string;
        row: number;
        col: number;
      }>;
      placementBySlot: Record<string, string | null>;
      secondaryPlacementBySlot?: Record<string, string | null>;
      targetCharacterId?: string;
      secondaryTargetCharacterId?: string;
      targetSlotId?: string;
      secondaryTargetSlotId?: string;
      bankCharacterIds?: string[];
      correctBoolean?: boolean;
      feedback?: { correct: string; wrong: string };
    }
  | {
      kind: "measurementCompare";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "pair" | "trio" | "order" | "sequence" | "sort";
      /** Intro scene: themeable Meazurex copy (falls back to the length copy). */
      introBody?: string[];
      introIcon?: string;
      targetMode?: "longer" | "taller" | "longest" | "shortest" | "heavier" | "lighter" | "heaviest" | "lightest";
      /** "sort" scene: two labelled baskets; correctOptionId is the right one.
       *  `fill` (0..1) renders a mini container at that level (capacity bins)
       *  instead of the emoji icon. */
      bins?: Array<{ id: string; label: string; icon: string; fill?: number }>;
      /** Fill-state task (Lesson 3): renders the fillable water gauge in
       *  compare/trio/order scenes instead of the flat container image. */
      fillState?: boolean;
      objects: Array<{
        id: string;
        label: string;
        icon: string;
        compareValue: number;
        axis: "length" | "height" | "mass" | "capacity" | "duration" | "day" | "timeofday" | "calendar";
        /** Optional visible fill amount for capacity scenes, 0..1 */
        waterLevel?: number;
        accent: "gold" | "teal" | "violet" | "rose" | "sky" | "leaf";
        /** Optional real image (transparent PNG/SVG). Falls back to `icon` emoji. */
        imageSrc?: string;
      }>;
      /** Correct ordering of object ids for the "order" scene (first slot → last). */
      orderedIds?: string[];
      /** Optional explicit slot labels for the "order" scene. */
      orderLabels?: string[];
      /** Objects already shown before the "?" in the "sequence" scene. */
      sequencePrefix?: Array<{
        id: string;
        label: string;
        icon: string;
        compareValue: number;
        axis: "length" | "height" | "mass" | "capacity" | "duration" | "day" | "timeofday" | "calendar";
        waterLevel?: number;
        accent: "gold" | "teal" | "violet" | "rose" | "sky" | "leaf";
        /** Optional real image (transparent PNG/SVG). Falls back to `icon` emoji. */
        imageSrc?: string;
      }>;
      teachingMoments?: Array<{
        id: string;
        title: string;
        objects?: Array<{
          label: string;
          icon: string;
          compareValue: number;
          axis: "length" | "height" | "mass" | "capacity" | "duration" | "day" | "timeofday" | "calendar";
          waterLevel?: number;
          accent: "gold" | "teal" | "violet" | "rose" | "sky" | "leaf";
          /** Optional real image (transparent PNG/SVG). Falls back to `icon` emoji. */
          imageSrc?: string;
}>;
        left: {
          label: string;
          icon: string;
          compareValue: number;
          axis: "length" | "height" | "mass" | "capacity" | "duration" | "day" | "timeofday" | "calendar";
          waterLevel?: number;
          accent: "gold" | "teal" | "violet" | "rose" | "sky" | "leaf";
          /** Optional real image (transparent PNG/SVG). Falls back to `icon` emoji. */
          imageSrc?: string;
};
        right: {
          label: string;
          icon: string;
          compareValue: number;
          axis: "length" | "height" | "mass" | "capacity" | "duration" | "day" | "timeofday" | "calendar";
          waterLevel?: number;
          accent: "gold" | "teal" | "violet" | "rose" | "sky" | "leaf";
          /** Optional real image (transparent PNG/SVG). Falls back to `icon` emoji. */
          imageSrc?: string;
};
        narration: string;
      }>;
      correctOptionId: string;
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Ground W1 L3 — measuring paths with equal informal units.
      kind: "measurePath";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      // Year 2 adds "difference": two measured objects shown, MCQ on "how many
      // more / fewer units" (quantifying the gap, not just "which is longer").
      // Year 2 W4 L1 accuracy activities: "reMeasure" (measure with big blocks →
      // a bit left over → re-measure with smaller blocks that tile exactly →
      // count), "moreOrFewer" (predict: smaller blocks give more or fewer?),
      // "countSmall" (count the small blocks that fit exactly).
      // W4 L2 adds "compareAccuracy": same object measured with big (leftover)
      // and small (exact) blocks — decide which is exact / the exact number / why.
      // W4 "finishGap"/"fillSmall": earlier single-answer fill activities.
      // "measureYourWay": OPEN-ENDED — the child adds big and/or small blocks
      // however they like to measure the object exactly (many valid answers;
      // a big block won't fit a 1-unit gap, so small blocks finish it off).
      // W4 L2 "Estimate It": estimateGuess (pick a sensible guess), estimateSlider
      // (drag your guess, then check), estimateLonger (guess which is longer).
      scene: "intro" | "count" | "compare" | "build" | "order" | "same" | "difference" | "reMeasure" | "moreOrFewer" | "countSmall" | "compareAccuracy" | "finishGap" | "fillSmall" | "measureYourWay" | "estimateGuess" | "estimateSlider" | "estimateLonger";
      /** W4 L2 estimate activities: real object photo(s) to estimate by eye. */
      estimatePair?: Array<{ id: string; imageSrc: string; label: string; blocks: number }>;
      estimateMin?: number;
      estimateMax?: number;
      estimateStart?: number;
      estimateTolerance?: number;
      estimateMeasurement?: {
        objectLengthUnits: number;
        bigUnitSize: number;
        smallUnitSize: number;
        expectedBigCount: number;
        expectedSmallCount: number;
        gapAmount: number;
        correctAnswer: number;
        closeRange: [number, number];
      };
      /** Unit being used to measure (footstep / block / star / flower / stone).
       *  Rendered as an illustrated glyph; unitEmoji/unitLabel are hints only. */
      unitEmoji?: string;
      unitLabel?: string;
      /** Year 1+: a real object illustration shown above the measuring blocks
       *  ("measure this pencil"). Omit for abstract Prep paths. */
      objectImageSrc?: string;
      objectLabel?: string;
      /** "count" scene: a single path of this many equal units, MCQ on length. */
      pathLength?: number;
      options?: number[];
      correctAnswer?: number;
      /** "compare" scene: two paths; tap the longer one. */
      paths?: Array<{
        id: string;
        length: number;
        unitEmoji: string;
        unitLabel: string;
        objectImageSrc?: string;
        objectLabel?: string;
      }>;
      correctPathId?: string;
      /** "order" scene: tap cards from shortest to longest. */
      correctOrderIds?: string[];
      /** "build" scene: build a path exactly this many units long. */
      targetLength?: number;
      maxUnits?: number;
      /** "intro" scene: worked example paths shown during the teaching sequence. */
      teachingPaths?: Array<{
        length: number;
        unitEmoji: string;
        caption: string;
        objectImageSrc?: string;
        objectLabel?: string;
      }>;
      /** Year 2 W4 ("between"/"accuracy", and an optional teaching example on
       *  "intro"): an object measured over `wholeBlocks` whole units whose tip
       *  may extend partway past the last block. `overhang` is 0 (exact) or a
       *  fraction 0<x<1 of one unit poking past `wholeBlocks` (never reaches the
       *  next whole unit). Renders a faint "ghost" of the next block + a dashed
       *  boundary line so "between N and N+1" reads clearly. */
      betweenItem?: {
        id?: string;
        imageSrc?: string;
        label?: string;
        wholeBlocks: number;
        overhang: number;
      };
      /** "accuracy": two measured objects (one exact, one between); tap the one
       *  that would measure more precisely with a smaller unit (correctItemId). */
      betweenItems?: Array<{
        id: string;
        imageSrc?: string;
        label?: string;
        wholeBlocks: number;
        overhang: number;
      }>;
      correctItemId?: string;
      /** "between"/"compareAccuracy": text MCQ. (Mirrors the massMeasure
       *  "reason" text-option pattern.) */
      textOptions?: string[];
      correctTextOption?: string;
      /** "compareAccuracy" (W4 L2) answer mode:
       *   tapExact    — tap the exact measurement (small blocks),
       *   exactNumber — pick the exact number,
       *   whyExact    — pick why it's exact,
       *   sameLength  — same object as N big / 2N small (both exact): is it the
       *                 same length, or longer? (teaches: bigger number ≠ longer). */
      accuracyMode?: "tapExact" | "exactNumber" | "whyExact" | "sameLength";
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 1 W1 L3 — valid measurement (AC9M1M02): informal units
      // must be uniform, end-to-end, with no gaps and no overlaps.
      kind: "measureValidity";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "choose" | "diagnose" | "fix";
      /** Object being measured (optional context image above the blocks). */
      objectImageSrc?: string;
      objectLabel?: string;
      /** Number of blocks in the (intended) measurement. */
      length: number;
      /** "choose": several block arrangements; tap the correct (fair) one. */
      arrangements?: Array<{ id: string; flaw: "none" | "gap" | "overlap"; flawIndex?: number }>;
      correctArrangementId?: string;
      /** "diagnose"/"fix": a single arrangement with this flaw. */
      flaw?: "none" | "gap" | "overlap";
      flawIndex?: number;
      /** "diagnose": which flaw labels to offer. */
      diagnoseOptions?: Array<"none" | "gap" | "overlap">;
      /** "intro": worked teaching examples. */
      teachingArrangements?: Array<{ flaw: "none" | "gap" | "overlap"; flawIndex?: number; caption: string }>;
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 1 W2 L1 — measuring mass with uniform informal units
      // (AC9M1M01: compare mass indirectly using balance cubes). An object sits
      // on a live balance scale against N identical "balance cubes".
      kind: "massMeasure";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      // Year 2 adds "difference" (MCQ on "how many more cubes") and "reason"
      // (two measured objects + a text MCQ justifying which has greater mass).
      scene: "intro" | "count" | "compare" | "order" | "equal" | "fairChoose" | "fairJudge" | "fairFix" | "difference" | "reason";
      /** "count": one object balancing this many cubes; MCQ on the cube count.
       *  "difference": MCQ answer is the cube difference between the two items. */
      object?: { imageSrc?: string; label: string; cubes: number };
      options?: number[];
      correctAnswer?: number;
      /** "compare"/"order"/"equal"/"difference": measured objects on balance scales. */
      items?: Array<{ id: string; imageSrc?: string; label: string; cubes: number }>;
      compareMode?: "greater" | "less";
      correctOptionId?: string;
      /** "reason": text options justifying which object has greater mass. */
      textOptions?: string[];
      correctTextOption?: string;
      /** "compare": hide the "· N cubes" labels (e.g. "which measures 5 cubes?"). */
      hideCounts?: boolean;
      /** "order": correct order of item ids (lightest→heaviest or reverse). */
      orderedIds?: string[];
      /** "equal": the reference object the student matches by mass. */
      target?: { imageSrc?: string; label: string; cubes: number };
      /** Fairness scenes — a measurement is FAIR when every cube is the same
       *  size. `fairUnits` are the rendered cube sizes (uniform = fair). */
      fairUnits?: number[];
      fair?: boolean;
      /** "fairChoose": several measurements; tap the fair one (correctOptionId). */
      fairArrangements?: Array<{ id: string; imageSrc?: string; label: string; units: number[] }>;
      /** "intro": worked teaching scales shown during the teaching sequence. */
      teachingItems?: Array<{ imageSrc?: string; label: string; cubes: number; caption?: string }>;
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 3 W3 — first formal mass units. Lesson 1 introduces
      // grams (g) and kilograms (kg) through sensible unit choices.
      kind: "massUnit";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene:
        | "intro"
        | "chooseUnit"
        | "sort"
        | "sensibleMeasure"
        | "mistakeCheck";
      object?: { imageSrc?: string; emoji?: string; label: string; unit: "g" | "kg"; sensibleMass?: string };
      statement?: string;
      options?: string[];
      correctOption?: string;
      items?: Array<{ imageSrc?: string; emoji?: string; label: string; unit: "g" | "kg" }>;
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 3 W3 — reusable formal mass scale tasks.
      kind: "massScale";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "read" | "match" | "realistic" | "compare" | "order" | "difference";
      scaleType?: "dial" | "digital";
      /** Level 4: read partial graduations (0.5 kg, 50 g) with a coarser minor
       *  step and an analog dial by default. */
      precision?: boolean;
      object?: { label: string; emoji: string; mass: number; unit: "g" | "kg" };
      items?: Array<{ label: string; emoji: string; mass: number; unit: "g" | "kg" }>;
      scales?: Array<{ id: string; mass: number; unit: "g" | "kg"; scaleType?: "dial" | "digital" }>;
      options?: string[];
      correctOption?: string;
      /** Practice-only typed numeric response for "how much heavier" tasks.
       *  MCQ quiz rendering still uses options/correctOption. */
      answerValue?: number;
      answerUnit?: "g" | "kg";
      correctOptionId?: string;
      orderedLabels?: string[];
      statement?: string;
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 1 W3 L1 — measuring capacity with uniform informal
      // units (AC9M1M01). A container is measured as N identical "cups".
      kind: "capacityMeasure";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "count" | "compare" | "order" | "equal" | "difference" | "fairChoose" | "fairJudge" | "betterUnit";
      /** "count": one container holding this many cups; MCQ on the cup count. */
      container?: { imageSrc?: string; label: string; cups: number };
      options?: number[];
      correctAnswer?: number;
      /** "compare"/"order"/"equal": measured containers shown with cup counts. */
      items?: Array<{ id: string; imageSrc?: string; label: string; cups: number }>;
      compareMode?: "more" | "less";
      correctOptionId?: string;
      /** "compare": hide the "· N cups" labels (e.g. "which holds 5 cups?"). */
      hideCounts?: boolean;
      /** "order": correct order of item ids (smallest→largest or reverse). */
      orderedIds?: string[];
      /** "equal": the reference container the student matches by capacity. */
      target?: { imageSrc?: string; label: string; cups: number };
      /** Capacity fairness / sensible unit scenes. */
      fairComparisons?: Array<{
        id: string;
        containerImageSrc?: string;
        label: string;
        left: { unit: "cup" | "spoon" | "measuringJug" | "bucket"; count: number };
        right: { unit: "cup" | "spoon" | "measuringJug" | "bucket"; count: number };
      }>;
      fairComparison?: {
        containerImageSrc?: string;
        label: string;
        left: { unit: "cup" | "spoon" | "measuringJug" | "bucket"; count: number };
        right: { unit: "cup" | "spoon" | "measuringJug" | "bucket"; count: number };
      };
      fair?: boolean;
      problemOptions?: string[];
      correctProblem?: string;
      sensibleUnits?: Array<{ id: string; unit: "cup" | "spoon" | "measuringJug" | "bucket"; label: string }>;
      /** "intro": worked teaching containers shown during the teaching sequence. */
      teachingItems?: Array<{ imageSrc?: string; label: string; cups: number; caption?: string }>;
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 1 W4 L1 — duration in hour/day/week (AC9M1M03).
      // Activity scenes are matched to / ordered by their usual duration unit.
      kind: "durationUnit";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "classify" | "compare" | "order" | "sort";
      /** "classify": one activity scene; tap Hour / Day / Week. */
      activity?: { imageSrc?: string; label: string; unit: "hour" | "day" | "week" };
      /** "compare"/"order"/"sort": activity scenes (sort places each into its unit bin). */
      items?: Array<{ id: string; imageSrc?: string; label: string; unit: "hour" | "day" | "week" }>;
      compareMode?: "longer" | "shorter";
      correctOptionId?: string;
      /** "order": correct order of item ids (shortest→longest duration). */
      orderedIds?: string[];
      /** "intro": worked teaching scenes shown during the teaching sequence. */
      teachingItems?: Array<{ imageSrc?: string; label: string; unit: "hour" | "day" | "week"; caption?: string }>;
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 1 W5 L1 — 7 days make a week, and weeks repeat
      // (AC9M1M03). Extended in W5 L2 to show that weeks sit inside months.
      kind: "weekCycle";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "build" | "count" | "next" | "missing" | "whichWeek" | "weekOrMonth" | "findWeeks" | "whichBigger" | "buildMonth";
      /** "build": day cards (shuffled) to order Monday→Sunday. */
      items?: Array<{ id: string; imageSrc?: string; label: string }>;
      orderedIds?: string[];
      /** "buildMonth": numbered week-rows to stack into a month (4 weeks). */
      monthWeeks?: Array<{ id: string; label: string; dates: number[] }>;
      /** render calendar cells with running dates instead of weekday letters. */
      numbered?: boolean;
      /** "count": how many days in a week. */
      options?: number[];
      correctAnswer?: number;
      /** "weekOrMonth"/"whichBigger": text answer options. */
      textOptions?: string[];
      correctTextOption?: string;
      /** "weekOrMonth"/"findWeeks"/"whichBigger": one row = one week, many rows = a month. */
      weekRows?: number;
      highlightRow?: number;
      visualMode?: "week" | "month";
      visualLabel?: string;
      /** "next": the day cards leading up to the "?" slot. */
      sequence?: Array<{ id: string; imageSrc?: string; label: string }>;
      /** "next"/"missing": day-card answer options. */
      choices?: Array<{ id: string; imageSrc?: string; label: string }>;
      /** "missing": the week strip with one slot null (the gap to fill). */
      strip?: Array<{ id: string; imageSrc?: string; label: string } | null>;
      /** "whichWeek": groups of day cards; tap the one that is a full week. */
      groups?: Array<{ id: string; days: Array<{ id: string; imageSrc?: string; label: string }> }>;
      correctOptionId?: string;
      /** "intro": worked week-strip examples. */
      teachingDays?: Array<{ id: string; imageSrc?: string; label: string }>;
      introTitle?: string;
      introBody?: string[];
      introVisual?: "weekCycle" | "weekToMonth" | "monthCycle";
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 1 W6 L1 — find/read dates on a month calendar and
      // connect events to dates (AC9M1M03). The date is the NUMBER in the cell.
      kind: "calendarFind";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "find" | "read" | "event" | "match";
      /** Month grid: number of days, and which weekday (0=Mon..6=Sun) day 1 sits on. */
      days: number;
      startWeekday: number;
      monthLabel?: string;
      /** "find"/"event": tap the cell with this date. */
      targetDate?: number;
      /** "read"/"match": the highlighted date the student reads. */
      markedDate?: number;
      /** "intro": a date highlighted for teaching. */
      highlightDate?: number;
      /** event icons placed on dates (icon = cake | trophy | gift | music | star). */
      events?: Array<{ date: number; label: string; icon: string }>;
      /** "event": the event the student must find on the calendar. */
      askEventLabel?: string;
      /** "read": number answer options. */
      options?: number[];
      correctAnswer?: number;
      /** "match": event-name answer options. */
      textOptions?: string[];
      correctTextOption?: string;
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 1 W6 L2 — move through a month calendar (AC9M1M03):
      // find the next/previous date, and jump one week later/earlier. Dates move
      // in a predictable pattern; a week is +7 / -7 (one row) on the grid.
      kind: "calendarNavigate";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      // Year 2 W7 adds "between" (count the day-jumps between two dates —
      // exclusive of the start), "whichCount" (pick the correct between-count),
      // "months" (months of the year / days in each month), "until"/
      // "eventCompare"/"eventPlan" (count forward to familiar calendar events),
      // "dateLabel" (read the date number under a month title), and
      // "missingDate" (solve before/after calendar clues by tapping a date).
      scene: "intro" | "next" | "before" | "explore" | "between" | "whichCount" | "months" | "until" | "eventCompare" | "eventPlan" | "dateLabel" | "missingDate";
      /** Month grid: number of days, and which weekday (0=Mon..6=Sun) day 1 sits on. */
      days: number;
      startWeekday: number;
      monthLabel?: string;
      /** The date the student starts on (highlighted on the grid / path). */
      fromDate?: number;
      /** "between"/"whichCount": the end date; the answer is the number of
       *  day-jumps from fromDate to toDate (toDate - fromDate). */
      toDate?: number;
      /** "next"/"before": which way the path points (visual + wording). */
      direction?: "next" | "before" | "later" | "earlier";
      /** Step size for the path strip/arrow: 1 for next/before, 7 for a week jump. */
      stepDays?: number;
      /** "explore": tap the cell this many days away — the answer date. */
      targetDate?: number;
      /** "next"/"before"/"whichCount": number answer options. */
      options?: number[];
      correctAnswer?: number;
      /** Year 2 W7 L2: familiar events placed on a monthly calendar. */
      events?: Array<{ date: number; label: string; icon: string }>;
      /** Year 2 W7 L2: event the student is counting toward. */
      askEventLabel?: string;
      /** "months": month-name text options (e.g. which month comes next). */
      monthName?: string;
      textOptions?: string[];
      correctTextOption?: string;
      /** "months": a short strip of consecutive months to show the sequence —
       *  the answer month is `blank` (a gap the child fills), with the months
       *  around it visible (e.g. …March, [ ? ], May…). */
      monthStrip?: Array<{ label: string; blank?: boolean; highlight?: boolean }>;
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 1 W6 L3 — use a calendar to plan events (AC9M1M03):
      // read when an event is, place an event on a date, and compare which event
      // comes first/last. Heavy event icons; minimal reading. "Plan my week."
      kind: "calendarEvent";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "when" | "place" | "compare";
      /** Month grid: number of days, and which weekday (0=Mon..6=Sun) day 1 sits on. */
      days: number;
      startWeekday: number;
      monthLabel?: string;
      /** Events shown on the calendar (icon = cake|trophy|bus|party|book|palette|run). */
      events?: Array<{ date: number; label: string; icon: string }>;
      /** "when": which event's date the student reads, with number options. */
      askEventLabel?: string;
      options?: number[];
      correctAnswer?: number;
      /** "place": the event to drop onto the calendar, and the date to tap. */
      placeLabel?: string;
      placeIcon?: string;
      targetDate?: number;
      /** "compare": pick the event that happens first or last. */
      compareMode?: "first" | "last";
      textOptions?: string[];
      correctTextOption?: string;
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 1 W7 L1 — yesterday / today / tomorrow on a simple
      // timeline (AC9M1M03). Time language, not calendar dates: yesterday = the
      // day before today. Events sit on a Yesterday -> Today -> Tomorrow line.
      kind: "timeSequence";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "which" | "before" | "build" | "meaning" | "sort" | "next";
      /** Events placed on the timeline, each tagged with when it happens. */
      slots?: Array<{ when: "yesterday" | "today" | "tomorrow"; label: string; icon: string }>;
      /** "which": which time slot the student must identify the event for. */
      askWhen?: "yesterday" | "today" | "tomorrow";
      /** "which"/"before"/"meaning"/"next": text answer options. */
      textOptions?: string[];
      correctTextOption?: string;
      /** "build"/"sort": shuffled event cards (each tagged with its day).
       *  "next": the answer options (icons looked up here; correct = tomorrow). */
      buildItems?: Array<{ label: string; icon: string; when: "yesterday" | "today" | "tomorrow" }>;
      /** "build": the expected order; "sort": the columns to sort into. */
      orderedWhen?: Array<"yesterday" | "today" | "tomorrow">;
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 2 W5+ — reusable analog clock mechanic. The clock
      // is controlled by snapped time states first; free hand dragging can be
      // layered on later without changing the task data.
      kind: "analogClock";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "read" | "build" | "chooseClock";
      mode: "read" | "build";
      granularity: "hour" | "halfHour" | "quarterHour";
      targetHour: number;
      targetMinute: 0 | 15 | 30 | 45;
      options?: Array<{
        id: string;
        label: string;
        hour: number;
        minute: 0 | 15 | 30 | 45;
      }>;
      correctOptionId?: string;
      teachingPoints?: string[];
      teachingSteps?: Array<{
        label: string;
        text: string;
        focus: "minute" | "hour" | "time";
      }>;
      showDigital?: boolean;
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 1 W8 L1 — sequencing familiar routine events using
      // first / next / last (AC9M1M03). Daily routine scenes are primary.
      kind: "routineSequence";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      // W8 L2 "Build My Day" adds: "partOfDay" (classify one event as
      // morning/afternoon/evening/night) and "next" (continue a routine chain).
      scene: "intro" | "first" | "build" | "fix" | "meaning" | "partOfDay" | "next";
      /** "first": cards to compare. "partOfDay": the single event to classify.
       *  "next": the routine chain shown so far (in order), ending in a "?". */
      items?: Array<{ id: string; label: string; icon: string; order: number; imageSrc?: string }>;
      /** "meaning"/"partOfDay": answer options ("partOfDay" = day-part words).
       *  "next": holds the correct option id in correctTextOption. */
      textOptions?: string[];
      correctTextOption?: string;
      /** "build": shuffled cards to place into time order.
       *  "next": the answer option cards (correct one matches correctTextOption id). */
      buildItems?: Array<{ id: string; label: string; icon: string; order: number; imageSrc?: string }>;
      /** "fix": a visible wrong chain that the student repairs. */
      brokenItems?: Array<{ id: string; label: string; icon: string; order: number; imageSrc?: string }>;
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 2 W2 L3 — "Measuring Detective": choose the best
      // measuring tool for an object and justify why (AC9M2M01, appropriate
      // strategies). Tools = cubes / ruler / tape measure / trundle wheel /
      // footsteps. Image-ready: each tool/object renders a premium image when
      // `imageSrc` exists, else a lucide icon (iconKey).
      kind: "toolChoice";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "best" | "whyBad" | "whyBest" | "reflection" | "measureUnit" | "sameObject" | "completeMeasure" | "estimateReveal" | "measureIt";
      /** W4 L3: object length in base units (paper clips), for sizing the
       *  horizontal measurement line + drop targets. */
      objectLengthUnits?: number;
      /** Optional teaching-strip tools for intro scenes. */
      introTools?: Array<{ id: string; label: string; focus: string; iconKey: string; imageSrc?: string }>;
      /** Optional intro briefing lines (overrides the default teaching copy). */
      introLines?: string[];
      /** The object being measured (shown in the middle). */
      object?: { label: string; iconKey: string; imageSrc?: string };
      /** "best"/"whyBest": tool option cards; tap the best (correctToolId).
       *  `focus` is an optional one-line description under the label (L5 W5). */
      tools?: Array<{ id: string; label: string; iconKey: string; imageSrc?: string; focus?: string }>;
      correctToolId?: string;
      /** "whyBad": a wrong tool shown with the object; pick why it's a bad fit. */
      wrongTool?: { label: string; iconKey: string; imageSrc?: string };
      /** "whyBad"/"whyBest"/"reflection": text reason options. */
      reasonOptions?: string[];
      correctReason?: string;
      /** W4 L3: show the same object measured by different informal units. */
      measurementRows?: Array<{ id: string; unitLabel: string; unitIconKey: string; unitImageSrc?: string; count: number }>;
      /** W4 L3 complete-measure task: student adds missing unit markers. */
      completeMeasurement?: { unitLabel: string; unitIconKey: string; unitImageSrc?: string; shownCount: number; targetCount: number };
      correctCount?: number;
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Generic, reusable interactive balance scale for equivalence activities
      // (Measurelands "Balance the Scales" and any future same-weight tasks).
      // The student fills/edits one pan; the scale is solved when both pans
      // weigh the same. Weights are abstract whole "units" (never shown).
      kind: "balanceScale";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      /** Non-interactive teaching demo: auto-animates tip-left/right/level. */
      demo?: boolean;
      /** "Recognise" mode: a pre-set scale the student judges Balanced / Not. */
      judge?: boolean;
      /** "Find the balanced scale": several mini-scales; tap the balanced one. */
      scales?: Array<{
        id: string;
        left: Array<{ id: string; label: string; icon: string; imageSrc?: string; weight: number }>;
        right: Array<{ id: string; label: string; icon: string; imageSrc?: string; weight: number }>;
      }>;
      correctScaleId?: string;
      /** "Fix the scale": pick the action (add/remove) that balances it. */
      fixActions?: Array<{ id: string; label: string; icon?: string }>;
      correctFixId?: string;
      /** Items already resting on each pan. */
      leftItems: Array<{ id: string; label: string; icon: string; imageSrc?: string; weight: number }>;
      rightItems: Array<{ id: string; label: string; icon: string; imageSrc?: string; weight: number }>;
      /** Which pan the student fills/edits; the other stays fixed. */
      target: "left" | "right";
      supply: {
        // "pile" = tap to add copies of a single unit (add/remove freely until
        //          balanced — forgiving). "shelf" = pick ONE candidate (scored).
        mode: "pile" | "shelf";
        items: Array<{ id: string; label: string; icon: string; imageSrc?: string; weight: number }>;
        /** pile only: max copies the student may add. */
        maxAdds?: number;
      };
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 3 W1 "Ruler Ridge" — the reusable Ruler mechanic
      // (AC9M3M01/M02). Measure objects in WHOLE centimetres against a premium
      // ruler that ALWAYS starts at 0. Objects are rendered (not photos) so their
      // width maps exactly to the ruler scale and lines up on the 0 mark. Scenes:
      //   "intro"     — Professor Gauge introduces the ruler (teaching demo).
      //   "startZero" — tap the mark we start measuring from (correct = 0 cm).
      //   "measure"   — read the length of one object aligned to 0 (cm options).
      //   "compare"   — two measured objects; tap the longer/shorter one.
      kind: "rulerMeasure";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "startZero" | "measure" | "compare" | "whichRuler" | "order" | "spotWrong";
      /**
       * Level 4 precision reading (AC9M4M01): render fine millimetre graduations
       * with a longer 5 mm mark so readings can fall on a half centimetre. Object
       * lengths and answer options may be halves (e.g. 7.5). Off = whole-cm ruler
       * (Level 3). Same ruler component either way — do not build a second ruler.
       */
      precision?: boolean;
      /** Length of the drawn ruler in whole centimetres (e.g. 12, 20). */
      rulerCm: number;
      /** Single-object scenes: the object measured on the ruler. Defaults to starting at 0. */
      object?: { label: string; icon: string; lengthCm: number; startCm?: number };
      /** "startZero": the cm marks offered as taps (correct = 0). */
      tickOptions?: number[];
      correctTick?: number;
      /** "startZero": also offer a non-number "edge of the ruler" distractor. */
      includeEdgeOption?: boolean;
      /** "measure": whole-cm answer options; correct = object.lengthCm. */
      options?: number[];
      correctAnswer?: number;
      /** "compare": two measured objects; tap the longer (or shorter). */
      compareObjects?: Array<{ label: string; icon: string; lengthCm: number; startCm?: number }>;
      compareMode?: "longer" | "shorter";
      correctLabel?: string;
      /** "compare": optional numeric comparison question (for difference tasks). */
      differenceOptions?: number[];
      correctDifference?: number;
      /** "measure": optional detective wording for checking a bad measurement. */
      detectiveOptions?: string[];
      correctDetectiveAnswer?: string;
      displayedMeasurement?: number;
      /** "whichRuler" (L4 W1 L2): the same object shown on several rulers with a
       *  claimed reading; pick the one aligned to 0 AND read correctly. */
      rulerOptions?: Array<{ id: string; startCm: number; claim: number; correct: boolean }>;
      /** "order" (L4 W1 L3): measured objects to arrange shortest → longest. */
      orderObjects?: Array<{ label: string; icon: string; lengthCm: number }>;
      /** "spotWrong" (L4 W1 L3): objects each with Professor Gauge's claimed
       *  reading; tap the one whose claim doesn't match its ruler. */
      claimObjects?: Array<{ label: string; icon: string; lengthCm: number; claim: number; isWrong: boolean }>;
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 3 W2 "Metre Mountain" — unit sense (AC9M3M01): a metre
      // is 100 cm, and you CHOOSE the sensible unit for a length. No calculation,
      // no reading a scale — intuition + tool choice. Reuses the ruler/metre-stick
      // visual language (extension of the ruler component). Scenes:
      //   "intro"        — Professor Gauge shows the metre stick (100 cm = 1 m).
      //   "aboutMetre"   — is this object about one metre? (yes / no)
      //   "whichTool"    — measure it with the ruler (cm) or the metre stick (m)?
      //   "compareMetre" — is it shorter / about / longer than one metre?
      kind: "unitChoice";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      // W2 L1 scenes: aboutMetre / whichTool / compareMetre.
      // W2 L2 scenes: whichUnit (cm vs m), sort (tap objects into cm/m bins),
      //               spotMistake (is Professor Gauge's unit sensible?).
      // W2 L3 adds bestEstimate (pick the most sensible estimate, cm/m options).
      scene: "intro" | "aboutMetre" | "whichTool" | "compareMetre" | "whichUnit" | "sort" | "spotMistake" | "bestEstimate";
      /** The familiar object being judged (emoji MATCHES the label). */
      object?: { label: string; icon: string };
      /** Choice labels in display order; correctOption must be one of them. */
      options?: string[];
      correctOption?: string;
      /** "sort": the objects to sort into the cm / m bins. */
      items?: Array<{ label: string; icon: string; unit: "cm" | "m" }>;
      /** "spotMistake": Professor Gauge's claim, e.g. "The tree is 4 centimetres tall." */
      statement?: string;
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Level 5 (Year 5) W1 "Metric Mastery" (AC9M5M01): choosing the
      // most appropriate metric unit — and smaller units when accuracy matters.
      // A new Level-5 DECISION mechanic: students choose the unit (and sometimes
      // the instrument) BEFORE measuring, then justify it. Decimal reading is
      // Week 2, not here — Week 1 stays whole-unit and decision-focused.
      kind: "metricUnit";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "chooseUnit" | "sortBins" | "spotMistake" | "accuracyPick" | "toolAndUnit" | "justify";
      attribute?: "length" | "mass" | "capacity" | "temperature";
      /** The object being measured (emoji MUST match the label). */
      object?: { label: string; emoji: string; context?: string };
      /** Unit chip options in display order; correctOption is one of them. */
      options?: string[];
      correctOption?: string;
      /** "intro": the unit ladder to teach (small -> large), with an example each. */
      ladder?: Array<{ unit: string; example: string; emoji: string }>;
      /** "sortBins": the unit bins and the objects to sort into them. */
      bins?: Array<{ unit: string; label: string }>;
      metricItems?: Array<{ id: string; label: string; emoji: string; unit: string }>;
      /** "spotMistake": Professor Gauge's claim with a silly unit. */
      statement?: string;
      /** "toolAndUnit": the instrument options + the correct instrument. */
      tools?: Array<{ id: string; label: string; emoji: string }>;
      correctTool?: string;
      /** "justify": reason options + the correct reason. */
      reasonOptions?: string[];
      correctReason?: string;
      /** Optional teaching sub-note under the object (e.g. accuracy framing). */
      note?: string;
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Level 5 (Year 5) W2 "Precision Measurement" (AC9M5M01): use a
      // COMBINATION of units (m + cm, kg + g, L + mL) for a more accurate measure.
      // A drawn graduated instrument (tape measure for length; readout gauge for
      // mass/capacity) plus reading, comparing and matching mixed-unit values.
      // Reading + comparing only — no conversions. This is the permanent Level
      // 5-6 precision measurement mechanic.
      kind: "precisionMeasure";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "readMixed" | "whichAccurate" | "compareMixed" | "matchMixed" | "problem";
      attribute?: "length" | "mass" | "capacity";
      /** The value shown on the instrument, in SMALL units (cm / g / mL). */
      valueSmall?: number;
      /** readMixed / whichAccurate / matchMixed / problem: string options + correct. */
      options?: string[];
      correctOption?: string;
      /** The object being measured (emoji matches label). */
      object?: { label: string; emoji: string; context?: string };
      /** compareMixed: two measurements (small-unit values) to compare. */
      pair?: {
        a: { valueSmall: number; label: string; emoji: string };
        b: { valueSmall: number; label: string; emoji: string };
      };
      compareMode?: "larger" | "smaller";
      correctSide?: "a" | "b";
      /** intro: a rough vs precise reading to contrast. */
      beforeAfter?: { before: string; after: string };
      /** problem: reason options + the correct reason. */
      reasonOptions?: string[];
      correctReason?: string;
      /** Optional teaching sub-note. */
      note?: string;
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 3 W2 L3 "Estimate then Measure" (AC9M3M01): the full
      // measuring cycle — estimate first, measure with the ruler / metre stick,
      // then compare. Estimation is rewarded by CLOSENESS (🎯 exact / 👏 very
      // close / 👍 close), not marked right/wrong. Scenes:
      //   "intro"    — Professor Gauge: estimate first, measure second, check.
      //   "estimate" — (optionally choose cm/m first) → pick an estimate → reveal
      //                the real length on the ruler/metre stick → closeness medal.
      kind: "estimateMeasure";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "estimate";
      /** The unit this object is measured in. */
      unit?: "cm" | "m";
      /** The object + its real whole-number length in `unit`. Emoji MATCHES label. */
      object?: { label: string; icon: string; length: number };
      /** Estimate choices (in `unit`); the real length may be one of them. */
      estimateOptions?: number[];
      /** Activity C: ask the student to choose cm or m before estimating. */
      chooseUnitFirst?: boolean;
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 3 W4 "Capacity Lab" (AC9M3M01/M02) — Learn → Read → Apply.
      // L1 (unit sense): chooseUnit / sort / spotMistake.
      // L2 (read the jug): readJug / matchJug / whichJug.
      // L3 (apply): compareMore / order / howMuchMore (typed difference).
      kind: "capacity";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene:
        | "intro"
        | "chooseUnit"
        | "sort"
        | "spotMistake"
        | "readJug"
        | "matchJug"
        | "whichJug"
        | "compareMore"
        | "order"
        | "howMuchMore";
      /** Level 4: read partial jug graduations (0.5 L, 250 mL) — minors unlabelled. */
      precision?: boolean;
      /** The familiar container being judged (emoji MATCHES the label). */
      object?: { label: string; emoji: string };
      /** Text MCQ options + the correct one (chooseUnit / spotMistake / whichJug). */
      options?: string[];
      correctOption?: string;
      /** "sort": containers to sort into the mL / L bins. */
      items?: Array<{ label: string; emoji: string; unit: "mL" | "L" }>;
      /** "spotMistake": Professor Gauge's capacity claim. */
      statement?: string;
      /** "readJug": a single jug to read; number options are in `numberOptions`. */
      jug?: { value: number; unit: "mL" | "L"; max: number; majorStep: number };
      numberOptions?: number[];
      correctNumber?: number;
      readUnit?: "mL" | "L";
      /** "matchJug": several jugs; tap the one that matches the asked amount. */
      jugs?: Array<{ id: string; value: number; unit: "mL" | "L"; max: number; majorStep: number }>;
      correctJugId?: string;
      /** "compareMore"/"order"/"howMuchMore": measured containers to reason about. */
      compareItems?: Array<{ label: string; emoji: string; value: number; unit: "mL" | "L" }>;
      compareMode?: "more" | "less";
      correctLabel?: string;
      orderedLabels?: string[];
      /** "howMuchMore": the typed numeric answer + its unit (same unit, no conversions). */
      answerValue?: number;
      answerUnit?: "mL" | "L";
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 4 W3 "Temperature" (AC9M4M01) — read a thermometer in
      // degrees Celsius (whole numbers, 0–40, no negatives/decimals) and use the
      // readings. Reuses the reusable MeasurelandsThermometer (analog + digital).
      //   read    — read one thermometer (number options; optional Gauge claim).
      //   match   — several thermometers; tap the one showing the target temp.
      //   compare — tap the warmest / weather-appropriate item.
      //   order   — arrange items coldest → warmest.
      kind: "temperature";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "read" | "match" | "compare" | "order";
      display?: "analog" | "digital";
      /** "read": the thermometer's reading + bracketing number options. */
      value?: number;
      options?: number[];
      correctNumber?: number;
      /** "read" (verify): Professor Gauge's stated reading. */
      statement?: string;
      /** "match": tap the thermometer showing this temperature. */
      targetValue?: number;
      thermometers?: Array<{ id: string; value: number; display?: "analog" | "digital" }>;
      correctId?: string;
      /** "compare"/"order": labelled items with a temperature (city/day). */
      items?: Array<{ id: string; label: string; emoji?: string; value: number }>;
      correctLabel?: string;
      orderedLabels?: string[];
      /** Intro visual. */
      introValue?: number;
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 4 W4 "Perimeter Path" (AC9M4M02) — CALCULATE perimeter by
      // adding the side lengths of themed land (gardens/paddocks/playgrounds/pools).
      // Whole-number sides, one metric unit, no formula (add the sides), no algebra.
      //   measureEvery — tap every side to measure it (don't miss one).
      //   calc         — type the total perimeter.
      //   choose       — pick the correct perimeter (misconception distractors).
      //   spotMissed   — Professor Gauge's total forgot a side; is he right?
      //   problem      — real-world surveyor problem (fence/path/enclosure).
      kind: "perimeterCalc";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "measureEvery" | "calc" | "choose" | "spotMissed" | "problem" | "measureOnce";
      /** Vertices of the rectilinear outline, in unit space (y up), closed. */
      poly: Array<[number, number]>;
      /** Length of each edge, in poly-edge order. */
      sideLabels: number[];
      unit: "cm" | "m";
      theme?: "garden" | "paddock" | "playground" | "pool" | "park";
      shapeName?: string;
      perimeter?: number;
      /** "measureOnce" (L5 W3): edge indices already measured (shown labelled).
       *  The remaining sides are tapped and their equal length chosen — teaching
       *  "measure once, use twice" for opposite sides. */
      measuredSides?: number[];
      /** "intro": override the default "What is perimeter?" teaching copy (L5+). */
      introLines?: string[];
      /** "calc"/"problem": typed numeric answer. */
      answerValue?: number;
      answerUnit?: "cm" | "m";
      /** "choose"/"problem": MCQ options + correct. */
      options?: number[];
      correctNumber?: number;
      /** "spotMissed": Professor Gauge's (wrong) total. */
      statement?: string;
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 4 W6 "Time Quest" (AC9M4M03) — Convert → Calculate → Solve.
      // Convert time units, calculate elapsed time / finish time (12-hour am/pm,
      // no 24-hour, no midday crossing) and solve real-world time problems.
      // Reuses the ClockFace; adds the reusable MeasurelandsTimeline.
      kind: "timeQuest";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "matchUnits" | "convert" | "convertBuild" | "howLong" | "finishTime" | "timeline" | "compare" | "order";
      /** "matchUnits": pairs of equivalent units to connect. */
      unitPairs?: Array<{ id: string; small: string; big: string }>;
      /** "convert"/"compare": text MCQ options + the correct one. */
      options?: string[];
      correctOption?: string;
      /** "convertBuild": set a number (e.g. 1 hour = ? minutes). */
      answerNumber?: number;
      answerUnitWord?: string;
      stepUnit?: number;
      stepMax?: number;
      /** Clock times as minutes since midnight (0–1439). */
      startMin?: number;
      finishMin?: number;
      /** "howLong": the elapsed answer (minutes). "finishTime"/"timeline": start+duration. */
      durationMin?: number;
      answerMin?: number;
      /** "timeline": axis range (minutes since midnight). */
      rangeStartMin?: number;
      rangeEndMin?: number;
      /** "compare"/"order": events with times. */
      events?: Array<{ id: string; label: string; emoji?: string; startMin?: number; finishMin?: number; min?: number }>;
      correctId?: string;
      orderedIds?: string[];
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 4 W7 "Angle Adventures" (AC9M4M04) — Recognise → Compare
      // → Apply. Angles as measures of turn; compare to a right-angle benchmark;
      // name acute/right/obtuse/straight/reflex/revolution. No degrees, no
      // protractors, no unknown-angle calculation. Reuses MeasurelandsAngle.
      kind: "angleQuest";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "pickAngle" | "compareRight" | "order" | "classify";
      /** "pickAngle"/"order": the figures to choose/arrange. */
      figures?: Array<{ id: string; kind?: "angle" | "line" | "ray"; turn?: number; rot?: number; arm1?: number; arm2?: number; label?: string; emoji?: string }>;
      correctId?: string;
      /** "compareRight"/"classify": a single angle. */
      angle?: { turn: number; rot?: number; arm1?: number; arm2?: number };
      /** "compareRight": smaller / equal / larger than a right angle. */
      correctCompare?: "smaller" | "equal" | "larger";
      /** "classify": angle-name options + the correct name. */
      options?: string[];
      correctOption?: string;
      /** Optional real-world object framing. */
      context?: { label: string; emoji: string };
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 3 W5 "Time Trails" (AC9M3M03) — Understand → Estimate → Compare.
      // Duration reasoning with seconds/minutes/hours; NOT reading a clock.
      // L1: chooseUnit / sort / spotMistake.  L2: estimate / bestEstimate / (challenge).
      // L3: compareLonger / order / howMuchLonger (typed).
      kind: "duration";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene:
        | "intro"
        | "unitFact"
        | "chooseUnit"
        | "sort"
        | "spotMistake"
        | "estimate"
        | "bestEstimate"
        | "contextEstimate"
        | "compareLonger"
        | "order"
        | "howMuchLonger";
      /** The familiar activity (emoji MATCHES the label). */
      activity?: { label: string; emoji: string };
      /** Text MCQ options + the correct one (chooseUnit / spotMistake / bestEstimate). */
      options?: string[];
      correctOption?: string;
      /** "contextEstimate": a real-world cloze sentence with a ___ blank to fill. */
      sentence?: string;
      /** "sort": activities to sort into the seconds / minutes / hours bins. */
      items?: Array<{ label: string; emoji: string; unit: "s" | "min" | "hr" }>;
      /** "spotMistake": Professor Gauge's duration claim. */
      statement?: string;
      /** "estimate": the activity's real duration + estimate choices (in `estimateUnit`). */
      estimateValue?: number;
      estimateUnit?: "s" | "min" | "hr";
      estimateOptions?: number[];
      /** Ask the student to choose the unit before estimating (challenge). */
      chooseUnitFirst?: boolean;
      /** "compareLonger"/"order"/"howMuchLonger": activities with durations. */
      compareItems?: Array<{ label: string; emoji: string; value: number; unit: "s" | "min" | "hr" }>;
      correctLabel?: string;
      orderedLabels?: string[];
      /** "howMuchLonger": the typed numeric answer + unit (same unit, no conversions). */
      answerValue?: number;
      answerUnit?: "s" | "min" | "hr";
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 3 W6 "Minute Clockworks" (AC9M3M04) — read/build analog
      // and digital time to the nearest minute. Reuses the ClockFace mechanic.
      // L1 five-minute (step 5), L2 to-the-minute (step 1), L3 build any time.
      kind: "clockMinute";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "read" | "matchClock" | "spotTime" | "build";
      /** The target time (hour 1–12, minute 0–59). Hour hand is proportional. */
      targetHour: number;
      targetMinute: number;
      /** Build/step granularity: 5 (five-minute) or 1 (to the minute). */
      minuteStep?: number;
      /** "read": analog shown → pick the digital time. "spotTime": Yes/No options. */
      options?: string[];
      correctOption?: string;
      /** "matchClock": pick the analog clock matching the asked digital time. */
      clockOptions?: Array<{ id: string; hour: number; minute: number }>;
      correctClockId?: string;
      askDigital?: string;
      /** "spotTime": the digital time Professor Gauge claims. */
      claimedTime?: string;
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 3 W7 "Perimeter" — CONCEPTUAL preview (no formulas, no
      // calculation): perimeter = the distance all the way around the outside.
      // The reusable "Perimeter Trace" mechanic: tap each outside edge to walk the
      // boundary; it glows. Shapes are grid polyominoes (list of filled cells).
      kind: "perimeter";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "trace" | "missingSide" | "whichPath" | "compareWalk";
      /** Filled grid cells [col, row] defining the shape. */
      cells?: Array<[number, number]>;
      gridW?: number;
      gridH?: number;
      label?: string;
      emoji?: string;
      /** "trace": boundary edges already walked at the start (finish-the-path). */
      prefilled?: Array<[number, number, "top" | "right" | "bottom" | "left"]>;
      /** "missingSide": the correct missing boundary edge + tappable decoys. */
      missingSide?: [number, number, "top" | "right" | "bottom" | "left"];
      decoySides?: Array<[number, number, "top" | "right" | "bottom" | "left"]>;
      /** "whichPath": path variants on the same shape; correct = the full outside. */
      pathOptions?: Array<{ id: string; pathType: "full" | "cut" | "incomplete" }>;
      correctPathId?: string;
      /** "compareWalk": two shapes; pick the one with the longer perimeter. */
      compareShapes?: {
        a: { cells: Array<[number, number]>; label: string; emoji: string; gridW: number; gridH: number };
        b: { cells: Array<[number, number]>; label: string; emoji: string; gridW: number; gridH: number };
      };
      feedback?: { correct: string; wrong: string };
    }
  | {
      // Measurelands Year 3 W8 "Area" — CONCEPTUAL preview (no formulas): area =
      // the space inside, measured by counting equal square units. Area Builder:
      // tap square tiles to fill a shape. Understand → Count → Build.
      kind: "area";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "whichPart" | "cover" | "countSquares" | "compareArea" | "orderArea" | "buildArea" | "sameArea" | "sameDiff" | "rows" | "columns" | "arrayArea" | "calcArea" | "spotMistake" | "investigate";
      /** "compareArea" (L5 W5): compare by "area" (default) or "perimeter". */
      compareMode?: "area" | "perimeter";
      cells?: Array<[number, number]>;
      gridW?: number;
      gridH?: number;
      label?: string;
      emoji?: string;
      /** L5 W4 (Area Architects): a short design context line, e.g. "classroom
       *  carpet". Shown above the rectangle. */
      context?: string;
      /** L5 W4: animate the rows-then-columns array reveal in the intro. */
      arrayReveal?: boolean;
      /** L5 W4 "calcArea": typed answer (rows × columns). */
      answerValue?: number;
      /** L5 W4 "spotMistake": Professor Gauge's wrong area claim. */
      statement?: string;
      /** Formal square unit for Level 4 (each tile = 1 cm² or 1 m²). Level 3
       *  preview leaves this unset and reads "square units". */
      areaUnit?: "cm²" | "m²";
      /** "whichPart": one option fills the inside (area); decoys = edge / partial. */
      partOptions?: Array<{ id: string; fillType: "inside" | "edge" | "partial" }>;
      correctPartId?: string;
      /** "countSquares": number options; correct = number of cells. */
      options?: number[];
      correctNumber?: number;
      /** "buildArea": tap tiles on an empty grid until exactly this many are placed. */
      targetSquares?: number;
      /** "compareArea": two shapes; pick the greater area. */
      compareShapes?: {
        a: { cells: Array<[number, number]>; label: string; emoji: string; gridW: number; gridH: number };
        b: { cells: Array<[number, number]>; label: string; emoji: string; gridW: number; gridH: number };
      };
      /** "orderArea": shapes to order smallest → largest by area. */
      orderShapes?: Array<{ cells: Array<[number, number]>; label: string; emoji: string; gridW: number; gridH: number }>;
      /** "sameArea": pick the option shape with the same number of squares. */
      sameOptions?: Array<{ id: string; cells: Array<[number, number]>; gridW: number; gridH: number }>;
      correctSameId?: string;
      feedback?: { correct: string; wrong: string };
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
      max?: number;
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
    }
) & { difficulty?: Difficulty };
