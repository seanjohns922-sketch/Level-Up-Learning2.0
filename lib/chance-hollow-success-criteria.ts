/** The "I can" success criteria for each Chance Hollow lesson, by level, week and lesson. */
export function chanceHollowSuccessCriteria(levelNumber: number, week: number, lessonNumber: number): string[] {
  if (levelNumber === 6) {
    const criteria: Record<number, string[]> = {
      1: ["place probability on a scale", "match fractions, decimals and percentages", "estimate probability from information"],
      2: ["calculate favourable outcomes", "complete probability to one whole", "build a target probability"],
      3: ["predict an expected frequency", "compare expected and observed results", "explain chance variation"],
      4: ["compare increasing trial sizes", "track relative frequency", "state what larger samples tend to do"],
      5: ["choose a matching simulator", "debug an unfair model", "check probabilities total one"],
      6: ["plan a fair investigation", "run increasing trial counts", "defend a conclusion with evidence"],
    };
    return criteria[week] ?? ["represent probability", "run a simulation", "use evidence carefully"];
  }
  if (levelNumber === 5) {
    const criteria: Record<string, string[]> = {
      "1-1": ["match outcomes to the question", "separate outcomes from details", "explain why the outcome set changes"],
      "1-2": ["list every possible outcome", "include each outcome once", "check that the list is complete"],
      "1-3": ["identify equally likely outcomes", "identify unequally likely outcomes", "use counts as evidence"],
      "2-1": ["connect equal regions to equal chance", "compare equal outcome counts", "explain why the tool is fair"],
      "2-2": ["find the outcome with more chance", "compare unequal counts or regions", "explain the likelihood difference"],
      "2-3": ["spot a hidden advantage", "use outcome counts as evidence", "describe how the design is biased"],
      "3-1": ["organise all 36 dice pairs", "count pairs for a grouped result", "check that no pair is missing"],
      "3-2": ["compare two-dice differences", "count how many pairs make each difference", "explain why the chances differ"],
      "3-3": ["find unfair race rules", "group 18 pairs for each racer", "test the repaired game"],
      "4-1": ["run the same experiment repeatedly", "record every outcome", "check the total frequency"],
      "4-2": ["write frequency as a fraction", "use outcome count as the numerator", "use total trials as the denominator"],
      "4-3": ["compare repeated trial results", "describe frequency variation", "explain why fair trials can differ"],
      "5-1": ["predict from the tool design", "compare target shares", "explain which outcome should occur more"],
      "5-2": ["estimate likelihood from frequency", "compare frequencies with different totals", "support my estimate with evidence"],
      "5-3": ["identify suspicious frequency patterns", "compare fair and loaded results", "make a cautious evidence-based verdict"],
      "6-1": ["write a testable chance question", "choose a consistent procedure", "plan how every result will be recorded"],
      "6-2": ["predict before testing", "run and record repeated trials", "calculate each relative frequency"],
      "6-3": ["answer the investigation question", "defend my conclusion with frequency evidence", "complete the fair race against Roller"],
    };
    return criteria[`${week}-${lessonNumber}`] ?? ["list the possible outcomes", "record repeated results", "explain my conclusion with evidence"];
  }

  if (levelNumber === 4) {
    const criteria: Record<string, string[]> = {
      "1-1": [
        "tell if a chance situation is fair",
        "count each possible outcome",
        "explain who has more chance",
      ],
      "1-2": [
        "recognise equal chance outcomes",
        "use equal counts as evidence",
        "choose matching chance words",
      ],
      "1-3": [
        "explain why chances are equal",
        "use outcome counts in my reason",
        "check that each outcome can happen",
      ],
      "2-1": [
        "read outcomes from a chance tool",
        "name the possible results",
        "use the tool as evidence",
      ],
      "2-2": [
        "count possible outcomes",
        "count different outcomes carefully",
        "tell the total number of outcomes",
      ],
      "2-3": [
        "match a tool to a chance",
        "choose a tool with the right number of outcomes",
        "explain the match",
      ],
      "3-1": [
        "draw a counter and put it back or keep it",
        "tell if the next chance stays the same or changes",
        "name independent and dependent events",
      ],
      "3-2": [
        "sort everyday events as independent or dependent",
        "decide if the first result affects the next",
        "explain why the chance does or does not change",
      ],
      "3-3": [
        "predict the next draw after keeping a counter",
        "tell which colour is now more or less likely",
        "use what is left in the bag as evidence",
      ],
      "4-1": [
        "decide if a game is fair",
        "count each player's winning outcomes",
        "explain my fairness decision",
      ],
      "4-2": [
        "spot what makes a game unfair",
        "change outcomes to make the game fair",
        "check both players have equal chance",
      ],
      "4-3": [
        "design a fair game",
        "give each player equal winning outcomes",
        "explain why my game is fair",
      ],
      "5-1": [
        "compare which event has more chance",
        "use outcome counts to compare",
        "choose the event with better chance",
      ],
      "5-2": [
        "recognise the same chance in different tools",
        "compare equivalent chances",
        "explain why chances match",
      ],
      "5-3": [
        "choose the best prediction",
        "use the most likely outcome",
        "explain why my prediction is sensible",
      ],
      "6-1": [
        "predict from the chance tool",
        "use probability before testing",
        "explain my expected result",
      ],
      "6-2": [
        "run and record a chance trial",
        "read the recorded results",
        "compare results with my prediction",
      ],
      "6-3": [
        "compare expected and actual results",
        "notice when results vary",
        "explain variation using chance language",
      ],
    };

    return criteria[`${week}-${lessonNumber}`] ?? [
      "compare chance outcomes",
      "explain my probability thinking",
      "use the chance tool as evidence",
    ];
  }

  const criteria: Record<string, string[]> = {
    "1-1": [
      "use certain for something that will happen",
      "use impossible for something that cannot happen",
      "choose the best chance word for an event",
    ],
    "1-2": [
      "use likely for something that has a good chance",
      "use unlikely for something that has a small chance",
      "compare two chance events",
    ],
    "1-3": [
      "choose a chance word",
      "give a reason for my choice",
      "use chance words in a sentence",
    ],
    "2-1": [
      "spot chance events around me",
      "tell what could happen",
      "use chance words for real events",
    ],
    "2-2": [
      "sort event cards by chance",
      "check if a chance word makes sense",
      "explain one sorted choice",
    ],
    "2-3": [
      "give a reason for a chance word",
      "use evidence from the event",
      "change my answer when the evidence changes",
    ],
    "3-1": [
      "name possible outcomes",
      "tell if an outcome can happen",
      "choose a matching outcome",
    ],
    "3-2": [
      "list every possible outcome",
      "check that no outcomes are missing",
      "use the tool to support my list",
    ],
    "3-3": [
      "match an event to its outcomes",
      "reject outcomes that cannot happen",
      "explain why an outcome matches",
    ],
    "4-1": [
      "make a prediction before testing",
      "use outcomes to support my prediction",
      "say why my prediction is sensible",
    ],
    "4-2": [
      "run a simple chance experiment",
      "record what happens",
      "compare the result with my prediction",
    ],
    "4-3": [
      "say if my prediction matched",
      "explain the result with chance language",
      "remember that possible outcomes can surprise us",
    ],
    "5-1": [
      "run repeated chance trials",
      "record each result carefully",
      "count how often each outcome happens",
    ],
    "5-2": [
      "record results with tally marks",
      "read a tally table",
      "find the outcome that happened most often",
    ],
    "5-3": [
      "compare repeated trial results",
      "find what stayed the same or changed",
      "use results to describe chance",
    ],
    "6-1": [
      "repeat the same experiment",
      "notice that results can change",
      "describe variation between trials",
    ],
    "6-2": [
      "compare class chance results",
      "find similarities and differences",
      "talk about variation using evidence",
    ],
    "6-3": [
      "explain why repeated results can vary",
      "use tally evidence in my explanation",
      "connect variation to chance",
    ],
  };

  return criteria[`${week}-${lessonNumber}`] ?? [
    "use chance language",
    "explain my thinking",
    "record results carefully",
  ];
}
