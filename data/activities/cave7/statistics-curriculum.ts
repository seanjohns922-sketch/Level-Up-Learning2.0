const curriculum = [
  {
    "title": "Questions and numerical data",
    "code": "AC9M7ST03",
    "lessons": [
      {
        "title": "Distinguish numerical variables",
        "goal": "identify discrete and continuous numerical data",
        "idea": "Counts are discrete; measurements can take values between whole numbers.",
        "caution": "Rounding a measurement does not turn its underlying variable into a count."
      },
      {
        "title": "Ask an investigable question",
        "goal": "form a question that expects numerical variation",
        "idea": "Specify what will be measured, who or what is included, and the comparison of interest.",
        "caution": "One fact about one person is not a distribution."
      },
      {
        "title": "Plan consistent collection",
        "goal": "plan a fair and consistent measurement method",
        "idea": "Use common units, clear instructions and comparable conditions.",
        "caution": "Changing the measurement method can change the results."
      }
    ]
  },
  {
    "title": "Mean and frequency",
    "code": "AC9M7ST01",
    "lessons": [
      {
        "title": "Calculate a mean",
        "goal": "find the mean of a numerical data set",
        "idea": "Add all observations and divide by the number of observations.",
        "caution": "Divide by the number of values, not by the largest value."
      },
      {
        "title": "Recover a missing observation",
        "goal": "use a known mean to recover a missing value",
        "idea": "Mean times count gives the total; subtract the known values.",
        "caution": "The mean is not necessarily a value in the data set."
      },
      {
        "title": "Use a frequency table",
        "goal": "calculate a mean using frequencies",
        "idea": "Multiply each value by its frequency, add, then divide by total frequency.",
        "caution": "Averaging the distinct values ignores how often each occurs."
      }
    ]
  },
  {
    "title": "Median and mode",
    "code": "AC9M7ST01",
    "lessons": [
      {
        "title": "Find an odd-sized median",
        "goal": "order data and find its middle value",
        "idea": "Put observations in order, then locate the middle position.",
        "caution": "Use the middle of the ordered data, not the original list."
      },
      {
        "title": "Find an even-sized median",
        "goal": "find the median when there are two middle values",
        "idea": "Average the two middle values in the ordered list.",
        "caution": "Do not choose just one of the two middle observations."
      },
      {
        "title": "Identify modes",
        "goal": "identify the most frequent value or values",
        "idea": "A mode is a value with the greatest frequency; ties can give more than one mode.",
        "caution": "The mode is the value, not its frequency."
      }
    ]
  },
  {
    "title": "Spread and extreme values",
    "code": "AC9M7ST01",
    "lessons": [
      {
        "title": "Calculate a range",
        "goal": "use minimum and maximum to describe spread",
        "idea": "Subtract the smallest observation from the largest observation.",
        "caution": "Range is a difference, not the two endpoints written together."
      },
      {
        "title": "Investigate an outlier and mean",
        "goal": "explain how an extreme value affects the mean",
        "idea": "Compare the old total and count with the new total and count.",
        "caution": "An unusually large observation can pull the mean away from most values."
      },
      {
        "title": "Investigate an outlier and median",
        "goal": "compare the effect of an extreme value on median and mean",
        "idea": "Reorder the data and locate the middle positions after a change.",
        "caution": "The median can change; it is less sensitive, not immune."
      }
    ]
  },
  {
    "title": "Choose and compare summaries",
    "code": "AC9M7ST01",
    "lessons": [
      {
        "title": "Choose a representative centre",
        "goal": "justify a useful measure of typical value",
        "idea": "Use the distribution and context to choose mean, median or mode.",
        "caution": "No single measure is best for every data set."
      },
      {
        "title": "Same centre, different data",
        "goal": "build and compare data sets that share a mean or median",
        "idea": "Mean × count gives the total, so different sets with the same total share a mean; compare their ranges too.",
        "caution": "Equal means do not mean identical distributions or equal spread."
      },
      {
        "title": "Compare groups fairly",
        "goal": "compare centre and spread in context",
        "idea": "Use comparable units and describe both typical values and variability.",
        "caution": "A lower average does not necessarily mean every observation is lower."
      }
    ]
  },
  {
    "title": "Stem-and-leaf plots",
    "code": "AC9M7ST02",
    "lessons": [
      {
        "title": "Read a stem-and-leaf key",
        "goal": "interpret values using a stem-and-leaf key",
        "idea": "Join each stem and leaf according to the stated key.",
        "caution": "The key determines the place value and units."
      },
      {
        "title": "Construct ordered leaves",
        "goal": "organise observations into ordered stem-and-leaf rows",
        "idea": "Keep every observation, including repeats, and order leaves within each stem.",
        "caution": "Repeated observations need repeated leaves."
      },
      {
        "title": "Summarise a stem-and-leaf plot",
        "goal": "calculate median and range from a stem-and-leaf display",
        "idea": "Read the ordered observations using the key, then calculate the summary.",
        "caution": "Count leaves, not stems, when finding the middle."
      }
    ]
  },
  {
    "title": "Construct useful displays",
    "code": "AC9M7ST02",
    "lessons": [
      {
        "title": "Build a dot plot",
        "goal": "represent numerical observations with one dot each",
        "idea": "Stack dots above their values; every observation contributes one dot.",
        "caution": "Do not drop repeated values."
      },
      {
        "title": "Connect frequencies and displays",
        "goal": "recover frequencies and totals from a display",
        "idea": "Read how many observations occur at each value and check the total.",
        "caution": "Frequency and the measured value are different quantities."
      },
      {
        "title": "Compare groups with displays",
        "goal": "compare two groups using back-to-back stem-and-leaf plots and parallel dot plots",
        "idea": "Put both groups on a common scale, then compare their centres and spreads.",
        "caution": "In a back-to-back plot, read left-side leaves outward from the stem: leaf 3 on stem 4 is still 43."
      }
    ]
  },
  {
    "title": "Shape of distributions",
    "code": "AC9M7ST02",
    "lessons": [
      {
        "title": "Describe symmetry, skew and bimodal shapes",
        "goal": "describe a distribution as symmetric, positively or negatively skewed, or bimodal",
        "idea": "A long right tail is positive skew, a long left tail is negative skew, and two separate peaks make a bimodal shape.",
        "caution": "Name skew using the tail, not the tallest cluster."
      },
      {
        "title": "Identify clusters and gaps",
        "goal": "describe notable features of a numerical distribution",
        "idea": "Identify groups of nearby values, gaps and unusually distant observations.",
        "caution": "A gap has no observations; it is not just a low frequency."
      },
      {
        "title": "Connect shape and centre",
        "goal": "explain how shape affects mean and median",
        "idea": "In a symmetric distribution the mean and median are equal or close; in a skewed one the mean is pulled toward the tail.",
        "caution": "Do not assume mean and median must always be equal."
      }
    ]
  },
  {
    "title": "Conduct and evaluate investigations",
    "code": "AC9M7ST03",
    "lessons": [
      {
        "title": "Choose a fair comparison",
        "goal": "plan comparable conditions for an investigation",
        "idea": "Keep relevant conditions consistent and collect repeated observations.",
        "caution": "A change in several conditions makes the cause difficult to identify."
      },
      {
        "title": "Check unusual measurements",
        "goal": "decide how to handle an unusual observation",
        "idea": "Check units, recording and measurement before deciding what to do.",
        "caution": "Do not delete a value merely because it weakens a preferred conclusion."
      },
      {
        "title": "Evaluate a design improvement",
        "goal": "use distributions to evaluate a practical claim",
        "idea": "Compare typical performance and variation under matched conditions.",
        "caution": "One successful trial is not enough evidence of a reliable improvement."
      }
    ]
  },
  {
    "title": "Report a statistical investigation",
    "code": "AC9M7ST03",
    "lessons": [
      {
        "title": "Analyse continuous measurements",
        "goal": "summarise measured data with units",
        "idea": "Calculate a suitable centre and range, then describe the distribution.",
        "caution": "Keep the original measurement units in the conclusion."
      },
      {
        "title": "Support a conclusion",
        "goal": "report a claim supported by the data",
        "idea": "State the comparison, numerical evidence and a relevant limitation.",
        "caution": "A claim needs evidence, not just an opinion about the graph."
      },
      {
        "title": "Recognise investigation limits",
        "goal": "limit a conclusion to what the investigation supports",
        "idea": "Explain which people, objects or conditions the collected data represent.",
        "caution": "A convenient group does not automatically represent everyone."
      }
    ]
  }
];

export default curriculum;
