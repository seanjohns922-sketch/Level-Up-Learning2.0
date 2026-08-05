# Measurelands Assessment Blueprint

Status: **Approved; independent-bank rebuild pending**

This document defines the approved assessment design. The typed source of truth is `data/assessments/measurelandsAssessmentBlueprint.ts`. The live banks satisfy its descriptor allocations, but still reuse lesson-native interactions and therefore remain a legacy migration baseline under `docs/LEVEL_UP_LEARNING_ASSESSMENT_FRAMEWORK.md`.

Curriculum basis: Australian Curriculum v9.0 Mathematics, Measurement strand, Prep-Year 6 sequence of content descriptions.

## Approval Gate

- The blueprint is approved for independent assessment-bank regeneration. Any regenerated form must satisfy its allocation and mix rules.
- Approval must cover descriptor scope, allocations, demand mixes, misconceptions and question archetypes.
- Missing lesson content must be implemented before a corresponding descriptor is used for scored mastery.
- Measurelands Assessments v1.0 has passed the approved release gates. All live forms use independent assessment banks; lesson-derived forms are retained only in the retired legacy archive.

## Assessment Contract

- Ground has one 20-question Post-Test. Levels 1-6 each have a 20-question Pre-Test and Post-Test.
- Pre-Test purpose: diagnose independent entry knowledge and locate the earliest descriptor requiring instruction.
- Post-Test purpose: demonstrate independent mastery through transfer, misconception analysis and multi-step application.
- Pre-Test and Post-Test use the same descriptor allocation. They use different contexts, values, response demands and question instances.
- Pass threshold: 85% for both forms.
- Exactly one response can be scored as correct.
- Visuals provide necessary mathematical data without naming the operation or exposing the method.
- Read-aloud text may restate a question but cannot provide a conversion rule, intermediate result or solution strategy.
- Worked examples and correctness feedback remain unavailable until a response is locked.
- No more than 2 questions from one descriptor appear consecutively.
- Challenging and reasoning questions are distributed through the second half rather than grouped at the end.
- Selected-response limits decrease by level; constructed and manipulated responses increase.

## Form Profiles

R/U/A/G means Recall / Understanding / Application / Reasoning.

| Form | Difficulty: accessible/moderate/challenging | R/U/A/G | Selected response max | Constructed/manipulated min |
|---|---:|---:|---:|---:|
| Ground Post | 8 / 8 / 4 | 2 / 7 / 7 / 4 | 10 | 10 |
| Level 1 Pre | 10 / 8 / 2 | 3 / 7 / 8 / 2 | 8 | 12 |
| Level 1 Post | 6 / 9 / 5 | 1 / 5 / 9 / 5 | 8 | 12 |
| Level 2 Pre | 8 / 9 / 3 | 2 / 6 / 9 / 3 | 6 | 14 |
| Level 2 Post | 5 / 10 / 5 | 1 / 4 / 10 / 5 | 6 | 14 |
| Level 3 Pre | 7 / 9 / 4 | 1 / 5 / 10 / 4 | 4 | 16 |
| Level 3 Post | 4 / 10 / 6 | 0 / 4 / 10 / 6 | 4 | 16 |
| Level 4 Pre | 6 / 10 / 4 | 1 / 4 / 10 / 5 | 3 | 17 |
| Level 4 Post | 3 / 10 / 7 | 0 / 3 / 9 / 8 | 3 | 17 |
| Level 5 Pre | 5 / 10 / 5 | 0 / 4 / 10 / 6 | 2 | 18 |
| Level 5 Post | 2 / 10 / 8 | 0 / 2 / 9 / 9 | 2 | 18 |
| Level 6 Pre | 4 / 10 / 6 | 0 / 3 / 9 / 8 | 1 | 19 |
| Level 6 Post | 1 / 9 / 10 | 0 / 1 / 8 / 11 | 1 | 19 |

## Ground Post-Test

### Question Allocation

| Descriptor | Questions | Current mapping |
|---|---:|---|
| AC9MFM01: compare length, capacity, mass and duration | 14 | Aligned: Weeks 1-4 and 8 |
| AC9MFM02: sequence days and times of day | 6 | Aligned: Weeks 5-8 |

### Descriptor Blueprint

**AC9MFM01**
- Learning intentions: identify the attribute; compare 2 objects/events directly; communicate the reason.
- Success criteria: use the same attribute, valid comparison language and visible evidence.
- Misconceptions: visual size always determines mass/capacity; screen position determines length; familiarity determines duration.
- Question blueprint: direct comparison with reason choices; counter-intuitive pairs; attribute selection before comparison.

**AC9MFM02**
- Learning intentions: sequence days/day parts; connect familiar events to sensible times.
- Success criteria: order the cycle and explain an event's position.
- Misconceptions: the week restarts after Friday; lunch and afternoon are interchangeable; relative-day words are weekday names.
- Question blueprint: complete day/week sequences; place events into a routine and justify the placement.

## Level 1 Pre-Test and Post-Test

### Question Allocation

| Descriptor | Pre | Post | Current mapping |
|---|---:|---:|---|
| AC9M1M01: compare/order length, mass, capacity and duration | 8 | 8 | Aligned: Weeks 1-4 |
| AC9M1M02: informal length units, uniform and end-to-end | 5 | 5 | Aligned: Week 1 |
| AC9M1M03: duration and sequence using years to hours | 7 | 7 | Partial: Weeks 4-8 include Year 2-style date navigation |

### Descriptor Blueprint

**AC9M1M01**
- Learning intentions: choose direct/indirect strategies, order items and explain comparisons consistently.
- Success criteria: order at least 3 items by one attribute and support the order with evidence.
- Misconceptions: taller means greater capacity; larger-looking means heavier; unlike units remain fair.
- Pre blueprint: order measured objects; compare familiar event duration. Post blueprint: resolve not-to-scale indirect comparisons; diagnose unfair comparisons.

**AC9M1M02**
- Learning intentions: measure with equal informal units; place units end-to-end; diagnose invalid measurement.
- Success criteria: align from the start, count once and explain gaps/overlaps.
- Misconceptions: unequal units are valid; gaps do not matter; marks and spaces are identical.
- Pre blueprint: measure or select a valid arrangement. Post blueprint: correct shifted starts, gaps and overlaps; construct a valid measure.

**AC9M1M03**
- Learning intentions: select duration units, sequence cycles/events and compare familiar durations.
- Success criteria: distinguish duration from date and choose years/months/weeks/days/hours appropriately.
- Misconceptions: dates are durations; weeks/months are interchangeable fixed counts; more event steps means longer duration.
- Pre blueprint: choose units and complete cycles. Post blueprint: build/explain sequences and reject dimensionally wrong durations.

## Level 2 Pre-Test and Post-Test

### Question Allocation

| Descriptor | Pre | Post | Current mapping |
|---|---:|---:|---|
| AC9M2M01: informal measurement and smaller units for accuracy | 6 | 6 | Aligned: Weeks 1-4 |
| AC9M2M02: halves, quarters and eighths in measurement contexts | 3 | 3 | Aligned: Week 5 Lesson 3 |
| AC9M2M03: dates and days between events | 4 | 4 | Aligned: Week 7 |
| AC9M2M04: analog time to hour, half-hour and quarter-hour | 4 | 4 | Content present Weeks 5-6; metadata incorrect |
| AC9M2M05: quarter, half, three-quarter and full turns | 3 | 3 | **Missing** |

### Descriptor Blueprint

- **AC9M2M01:** choose, measure and compare with uniform informal units; test smaller-unit count and accuracy misconceptions; post items diagnose conflicting unit sizes and faulty plans.
- **AC9M2M02:** recognise and represent equal halves/quarters/eighths; test unequal partitions and links between fractions and quarter-hour events.
- **AC9M2M03:** locate dates and count day-to-day jumps; test inclusive counting, week boundaries and unequal month lengths.
- **AC9M2M04:** read and construct benchmark analog times; test hour-hand movement, hand roles and quarter-to naming.
- **AC9M2M05:** identify and apply fractional turns from a starting orientation; test turn amount independently of direction.

## Level 3 Pre-Test and Post-Test

### Question Allocation

| Descriptor | Pre | Post | Current mapping |
|---|---:|---:|---|
| AC9M3M01: metric-unit choice and benchmark estimation | 4 | 4 | Aligned: Weeks 1-4 |
| AC9M3M02: measure/compare with labelled instruments | 6 | 6 | Aligned: Weeks 1-4 |
| AC9M3M03: formal duration-unit relationships | 3 | 3 | Aligned: Week 5 |
| AC9M3M04: analog/digital relationship and nearest minute | 4 | 4 | Aligned: Week 6 |
| AC9M3M05: angles as turn compared with right angles | 3 | 3 | **Missing** |

### Descriptor Blueprint

- **AC9M3M01:** choose realistic units and benchmark estimates; post items require justification among plausible alternatives.
- **AC9M3M02:** read rulers/scales/jugs and compare compatible measurements; post items diagnose zero, interval and unit errors.
- **AC9M3M03:** estimate and compare days/hours/minutes/seconds; test numeral-only comparisons that ignore units.
- **AC9M3M04:** read, match and construct nearest-minute times; test hour-hand position and minute interval counting.
- **AC9M3M05:** identify turns and compare with a right angle; test orientation and arm-length distractions.

**AC9M3M06 cross-realm ownership:** Money descriptors are intentionally excluded from Measurelands. These outcomes are assessed within Number Nexus to preserve thematic consistency. Measurelands assesses only physical measurement concepts.

Implementation status: **planned, not yet verified**. Number Nexus currently contains money contexts, but its Year 3 program and assessment blueprint do not explicitly guarantee `AC9M3M06`. Number Nexus must teach and assess dollar-cent relationships and equivalent money representations before Year 3 curriculum coverage can be marked complete.

Current perimeter/area preview questions are Level 4 content and receive no allocation in this blueprint.

## Level 4 Pre-Test and Post-Test

### Question Allocation

| Descriptor | Pre | Post | Current mapping |
|---|---:|---:|---|
| AC9M4M01: unmarked/partial units on scaled instruments | 6 | 6 | Aligned: Weeks 1-3 |
| AC9M4M02: measure/approximate perimeter and area | 5 | 5 | Aligned: Weeks 4-5 |
| AC9M4M03: duration, am/pm and time-unit conversions | 5 | 5 | Content present Week 6; metadata incorrectly says M02 |
| AC9M4M04: estimate and compare named angles | 4 | 4 | Aligned: Week 7 |

### Descriptor Blueprint

- **AC9M4M01:** infer interval values, interpret partial units and diagnose scale-reading errors across rulers, scales, jugs and thermometers.
- **AC9M4M02:** distinguish boundary/surface, select linear/square units and approximate before measuring; test internal-edge and unit misconceptions.
- **AC9M4M03:** convert time units and solve missing start/finish/elapsed problems across am/pm; test base-10 subtraction and noon crossing.
- **AC9M4M04:** estimate, classify and order acute, obtuse, straight, reflex and revolution angles; test orientation and arm length.

## Level 5 Pre-Test and Post-Test

### Question Allocation

| Descriptor | Pre | Post | Current mapping |
|---|---:|---:|---|
| AC9M5M01: metric-unit choice and precision | 4 | 4 | Aligned: Weeks 1-2 |
| AC9M5M02: practical perimeter/area, regular and irregular | 6 | 6 | Aligned: Weeks 3-5 and corrected to 6 questions |
| AC9M5M03: compare/convert 12-hour and 24-hour systems | 4 | 4 | Partial: Week 6 also pre-teaches Year 6 timetables |
| AC9M5M04: estimate, construct and measure angles | 6 | 6 | Aligned: Week 7 |

### Descriptor Blueprint

- **AC9M5M01:** choose fit-for-purpose units/precision and read mixed units; test digit-by-digit comparison and unnecessary precision.
- **AC9M5M02:** formulate and solve regular/irregular perimeter and area problems with correct units; compare strategies rather than repeat rectangle arrays.
- **AC9M5M03:** convert and compare 12/24-hour times, including midnight and midday; timetable planning is excluded from scored Year 5 evidence.
- **AC9M5M04:** independently estimate, measure and construct angles; test baseline alignment and opposite protractor scales.

## Level 6 Pre-Test and Post-Test

### Question Allocation

| Descriptor | Pre | Post | Current mapping |
|---|---:|---:|---|
| AC9M6M01: metric conversions and decimal representations | 5 | 5 | Content present Week 4; metadata is `ALL` |
| AC9M6M02: establish/use rectangle area formula | 5 | 5 | Content present Weeks 1-2; metadata is `ALL` |
| AC9M6M03: timetables/itineraries, activity and journey planning | 5 | 5 | Content present Week 5; metadata is `ALL` |
| AC9M6M04: straight-line, point and vertically opposite angles | 5 | 5 | Content present Week 6; metadata is `ALL` |

### Descriptor Blueprint

**AC9M6M01**
- Learning intentions: convert common units, choose decimal representations and evaluate reasonableness.
- Success criteria: preserve magnitude/attribute and justify a context-appropriate representation.
- Misconceptions: always multiply; move decimals without considering unit size; compare before converting.
- Pre blueprint: one conversion and one compatible comparison. Post blueprint: multi-step constraints requiring unit and decimal choices with justification.

**AC9M6M02**
- Learning intentions: establish why rectangle area is length multiplied by width; solve and compare practical designs.
- Success criteria: connect arrays to the formula, use compatible dimensions/square units and reason about constraints.
- Misconceptions: perimeter is area; incompatible units can be multiplied; one area has only one dimension pair.
- Pre blueprint: explain formula from an array and apply it once. Post blueprint: formulate and compare designs under fixed area/perimeter constraints.

**AC9M6M03**
- Learning intentions: interpret timetables/itineraries, plan under multiple constraints and compare total journey duration.
- Success criteria: account for departures, arrivals, transfers, waiting and deadlines; justify the selected plan.
- Misconceptions: earliest departure gives earliest arrival; transfers never count; arriving exactly at a deadline is late.
- Pre blueprint: interpret a timetable and determine one duration. Post blueprint: plan and justify a multi-leg itinerary.

**AC9M6M04**
- Learning intentions: identify angle relationships, calculate unknowns and communicate a reasoning chain.
- Success criteria: name the relationship, show a valid sequence and verify the complete diagram.
- Misconceptions: all adjacent angles total 180 degrees; vertically opposite angles total 180 degrees; every visible point implies 360 degrees.
- Pre blueprint: identify a relationship and calculate an unknown without options. Post blueprint: solve a multi-relationship diagram including vertically opposite angles and construct the reasoning chain.

Volume and cubic-unit questions receive **zero allocation** because volume is not a Year 6 AC v9 Measurement descriptor. Week 7 strategy activities and Week 8 projects may provide contexts for the 4 descriptors, but cannot become standalone non-descriptor assessment categories.

## Approval Decisions Required

1. Confirm that Year 2 fractional measurement and turn remain in Measurelands, while Year 3 money is owned and assessed by Number Nexus.
2. Confirm the 20-question descriptor allocations.
3. Confirm the increasing difficulty, reasoning and constructed-response profiles.
4. Confirm that Level 6 volume remains absent from placement/mastery evidence and reachable lesson generators.
5. Confirm that missing lesson coverage is implemented before affected assessments are regenerated.
