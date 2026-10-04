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
        "idea": "Assign equally likely random outcomes in the same proportions as the model.",
        "caution": "One random label per colour misrepresents unequal colour probabilities."
      },
      {
        "title": "Check a simulation rule",
        "goal": "test whether a digital rule matches a chance model",
        "idea": "Count which random inputs trigger the event and compare that share with the target.",
        "caution": "An inclusive endpoint adds another possible input."
      },
      {
        "title": "Run and summarise trials",
        "goal": "use digital trials and summarise the actual outcomes",
        "idea": "Run the stated trials, record the results and calculate the observed share.",
        "caution": "Report the generated results rather than replacing them with the prediction."
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
        "idea": "Random variation makes different runs differ even when their probability model is unchanged.",
        "caution": "A fair process does not force each short run to be balanced."
      },
      {
        "title": "Compare small and large runs",
        "goal": "compare relative frequencies across different trial totals",
        "idea": "Compare proportions, not raw counts, when sample sizes differ.",
        "caution": "A larger run often gives a more stable proportion, but closeness is not guaranteed every time."
      },
      {
        "title": "Challenge chance misconceptions",
        "goal": "explain why past independent outcomes do not force the next result",
        "idea": "With a reset independent process, the next trial keeps the same probability.",
        "caution": "A run of one outcome does not make the opposite outcome due."
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
