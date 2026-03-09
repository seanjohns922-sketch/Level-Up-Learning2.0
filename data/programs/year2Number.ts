type Year2CurriculumCode = "AC9M2N01" | "AC9M2N02";

type Year2Lesson = {
  title: string;
  curriculum: Year2CurriculumCode;
};

type Year2Week = {
  week: number;
  focus: string;
  lessons: Year2Lesson[];
};

export const year2Number: {
  yearLevel: number;
  strand: "Number";
  weeks: Year2Week[];
} = {
  yearLevel: 2,
  strand: "Number",
  weeks: [
    {
      week: 1,
      focus: "Place Value to 1000",
      lessons: [
        {
          title: "Read numbers to 1000",
          curriculum: "AC9M2N01",
        },
        {
          title: "Using MAB identify numbers",
          curriculum: "AC9M2N01",
        },
        {
          title: "Order numbers up to 1000",
          curriculum: "AC9M2N01",
        },
      ],
    },
    {
      week: 2,
      focus: "Partitioning & Expanding",
      lessons: [
        {
          title: "Break numbers into hundreds, tens and ones",
          curriculum: "AC9M2N02",
        },
        {
          title: "Expand numbers",
          curriculum: "AC9M2N02",
        },
        {
          title: "Partition numbers in different ways",
          curriculum: "AC9M2N02",
        },
      ],
    },
    {
      week: 3,
      focus: "Number Lines & Rounding",
      lessons: [
        {
          title: "Place numbers on number lines",
          curriculum: "AC9M2N01",
        },
        {
          title: "Round to nearest 10 and 100",
          curriculum: "AC9M2N02",
        },
        {
          title: "Estimate numbers on number lines",
          curriculum: "AC9M2N02",
        },
      ],
    },
  ],
};
