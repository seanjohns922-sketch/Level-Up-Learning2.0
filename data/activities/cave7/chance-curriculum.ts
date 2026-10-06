const curriculum = [
  {
    "title": "Outcomes and sample spaces",
    "code": "AC9M7P01",
    "lessons": [
      {
        "title": "List a sample space",
        "goal": "identify every possible outcome of a single-stage event",
        "idea": "A sample space lists all possible elementary outcomes without omissions or repeats.",
        "caution": "An event can contain more than one outcome."
      },
      {
        "title": "Identify a favourable event",
        "goal": "count the outcomes that satisfy an event",
        "idea": "An event is a set of outcomes. Check each outcome against the condition; the ones that fit are the favourable outcomes.",
        "caution": "Words such as above and at least include different boundary values."
      },
      {
        "title": "Check a complete sample space",
        "goal": "identify missing or repeated outcomes",
        "idea": "Compare a proposed list with the full set of possibilities.",
        "caution": "Possible colour names are not automatically equally likely outcomes."
      }
    ]
  },
  {
    "title": "Assign probabilities",
    "code": "AC9M7P01",
    "lessons": [
      {
        "title": "Use equally likely outcomes",
        "goal": "calculate a probability from favourable and total outcomes",
        "idea": "Count favourable elementary outcomes and divide by the total when they are equally likely.",
        "caution": "The equally likely condition matters."
      },
      {
        "title": "Reason about unequal likelihood",
        "goal": "use counts or equal-area sections to compare likelihood",
        "idea": "Colours represented by more equal sections or counters have greater probability.",
        "caution": "Equal-size sections do not imply equal colour probabilities."
      },
      {
        "title": "Find a not-event",
        "goal": "find the probability of outcomes outside a stated event",
        "idea": "Count all outcomes that do not meet the event condition.",
        "caution": "The event and its not-event together cover the sample space."
      }
    ]
  },
  {
    "title": "Probability representations and fairness",
    "code": "AC9M7P01",
    "lessons": [
      {
        "title": "Connect fraction and decimal",
        "goal": "express a probability as a fraction or decimal",
        "idea": "Divide favourable outcomes by total outcomes and use equivalent representations.",
        "caution": "A probability must lie between zero and one."
      },
      {
        "title": "Complete a probability model",
        "goal": "use a complete set of outcome probabilities",
        "idea": "The probabilities of all mutually exclusive elementary outcomes sum to one.",
        "caution": "Do not add overlapping events as though they were separate outcomes."
      },
      {
        "title": "Compare fair winning chances",
        "goal": "compare players\u2019 probabilities in a one-stage game",
        "idea": "Compare the total probability assigned to each player.",
        "caution": "Equal numbers of colour names do not guarantee equal winning chances."
      }
    ]
  },
  {
    "title": "Predict frequencies",
    "code": "AC9M7P01",
    "lessons": [
      {
        "title": "Predict an expected count",
        "goal": "use a probability to predict a count over repeated trials",
        "idea": "Multiply the number of trials by the probability of the event.",
        "caution": "An expected count is a prediction, not a guarantee."
      },
      {
        "title": "Predict a relative frequency",
        "goal": "predict the share of trials giving an event",
        "idea": "Over many trials, the relative frequency is expected to be near the probability.",
        "caution": "Relative frequency is a proportion, not the total count."
      },
      {
        "title": "Recover a prediction model",
        "goal": "infer a probability from a predicted count",
        "idea": "Divide the expected count by the number of trials.",
        "caution": "Use the predicted count and the matching trial total."
      }
    ]
  },
  {
    "title": "Record and compare experiments",
    "code": "AC9M7P02",
    "lessons": [
      {
        "title": "Record trial totals",
        "goal": "organise results of repeated single-stage trials",
        "idea": "An experiment is repeated as trials. Each trial gives one outcome, so all the outcome counts add up to the number of trials.",
        "caution": "A result can repeat many times."
      },
      {
        "title": "Calculate observed frequency",
        "goal": "calculate an experimental relative frequency",
        "idea": "Divide the observed event count by the number of completed trials.",
        "caution": "Use actual results for observed frequency, not the theoretical probability."
      },
      {
        "title": "Compare observed and expected",
        "goal": "describe the difference between predicted and observed counts",
        "idea": "Calculate the prediction, then compare it with the recorded result.",
        "caution": "A difference alone does not prove that the model is wrong."
      }
    ]
  },
  {
    "title": "Run digital simulations",
    "code": "AC9M7P02",
    "lessons": [
      {
        "title": "Map random outcomes fairly",
        "goal": "design a simulation with the intended probabilities",
        "idea": "A simulation copies a chance situation using random numbers. Give each outcome the same share of the random numbers as its probability. For a spinner with 6 red sections out of 16, let 6 of the numbers 1 to 16 mean red and the other 10 mean blue.",
        "caution": "Giving each colour just one number makes the colours equally likely, even when they are not."
      },
      {
        "title": "Check a simulation rule",
        "goal": "test whether a digital rule matches a chance model",
        "idea": "To check a simulation rule, list the random numbers that count as a win, count them, and write that count over the total. Then compare it with the probability you wanted. Read the words carefully: “at most 6” includes 6, but “less than 6” does not.",
        "caution": "Check whether the end number is included."
      },
      {
        "title": "Run and summarise trials",
        "goal": "use digital trials and summarise the actual outcomes",
        "idea": "After running a simulation, count what actually happened. The observed share is the number of wins divided by the total number of trials. Report that real result, even if it is different from the prediction.",
        "caution": "Report the results you got, not the prediction."
      }
    ]
  },
  {
    "title": "Variation and larger samples",
    "code": "AC9M7P02",
    "lessons": [
      {
        "title": "Explain variation between runs",
        "goal": "explain why repeated experiments produce different results",
        "idea": "Random results vary. Toss a fair coin 50 times, then do it again, and you will usually get a different number of heads, even though the chance of heads is 1/2 on every toss. The expected count (25 heads) is what happens on average, not in every run.",
        "caution": "A fair coin does not have to give exactly half heads in every run."
      },
      {
        "title": "Compare small and large runs",
        "goal": "compare relative frequencies across different trial totals",
        "idea": "Relative frequency = count ÷ number of trials. Small runs jump around a lot. As the number of trials grows, the relative frequency usually settles close to the true probability. When runs have different sizes, compare relative frequencies, not raw counts.",
        "caution": "A larger run usually settles closer to the probability, but not every single time."
      },
      {
        "title": "Challenge chance misconceptions",
        "goal": "explain why past independent outcomes do not force the next result",
        "idea": "Each toss, roll or spin is independent: the coin, die or spinner has no memory. After 5 heads in a row, the chance of tails on the next toss is still 1/2. No outcome is ever “due”.",
        "caution": "A run of one outcome does not make the other outcome more likely next time."
      }
    ]
  },
  {
    "title": "Investigate and report chance",
    "code": "AC9M7P02",
    "lessons": [
      {
        "title": "Plan a chance investigation",
        "goal": "design repeated trials to investigate a probability claim",
        "idea": "State the model, event, trial procedure and how results will be recorded.",
        "caution": "Keep the event definition and trial conditions consistent."
      },
      {
        "title": "Compare experimental evidence",
        "goal": "evaluate recorded results against competing predictions",
        "idea": "Compare observed proportions with the predicted probabilities and consider the trial totals.",
        "caution": "Finite experimental results support a model; they do not prove it with certainty."
      },
      {
        "title": "Report a simulation conclusion",
        "goal": "explain observed results, prediction and random variation",
        "idea": "Report the trial total, observed event count, relative frequency and model comparison.",
        "caution": "Keep expected and observed values clearly distinguished."
      }
    ]
  }
];

export default curriculum;
