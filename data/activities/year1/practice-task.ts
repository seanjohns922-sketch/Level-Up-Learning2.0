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
      scene: "intro" | "count" | "compare" | "build" | "order" | "same";
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
      scene: "intro" | "count" | "compare" | "order" | "equal" | "fairChoose" | "fairJudge" | "fairFix";
      /** "count": one object balancing this many cubes; MCQ on the cube count. */
      object?: { imageSrc?: string; label: string; cubes: number };
      options?: number[];
      correctAnswer?: number;
      /** "compare"/"order"/"equal": measured objects shown on balance scales. */
      items?: Array<{ id: string; imageSrc?: string; label: string; cubes: number }>;
      compareMode?: "greater" | "less";
      correctOptionId?: string;
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
      // Measurelands Year 1 W3 L1 — measuring capacity with uniform informal
      // units (AC9M1M01). A container is measured as N identical "cups".
      kind: "capacityMeasure";
      prompt: string;
      speakText?: string;
      badgeLabel?: string;
      scene: "intro" | "count" | "compare" | "order" | "equal" | "fairChoose" | "fairJudge" | "betterUnit";
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
        left: { unit: "cup" | "spoon"; count: number };
        right: { unit: "cup" | "spoon"; count: number };
      }>;
      fairComparison?: {
        containerImageSrc?: string;
        label: string;
        left: { unit: "cup" | "spoon"; count: number };
        right: { unit: "cup" | "spoon"; count: number };
      };
      fair?: boolean;
      problemOptions?: string[];
      correctProblem?: string;
      sensibleUnits?: Array<{ id: string; unit: "cup" | "spoon" | "bucket"; label: string }>;
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
