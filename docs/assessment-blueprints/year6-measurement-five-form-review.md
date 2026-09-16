# Level 6 Measurelands: five matched assessment forms

Status: approved for student release on 16 September 2026. Frozen v4 forms serve new assessments; existing drafts, baselines and academic-year diagnostic cycles retain their original version.

Source: supplied Australian Curriculum v9 F–6 Mathematics document, Year 6 Measurement, page 66, AC9M6M01–04. Inspected Level 6 lesson common files for area, composite rectangles, metric conversions, timetables and angle reasoning. The curriculum document governs descriptor mapping: timetable problems are M03 and angle relationships are M04, regardless of older lesson comments.

Each of Pre-Test, Post-Test, Start, Mid and End has 20 questions: five per descriptor, five easy, ten moderate and five challenging. Examples vary while skills, response modes and intended demand remain matched. Difficulty is an author judgement and is not statistically calibrated.

- M01: decimal metres to centimetres, kilograms to grams, millilitres to litres, kilometres to metres and combining kilogram/gram masses.
- M02: rectangular area, composite rectilinear area, equal-perimeter area comparison, finding width from area and equal-area perimeter comparison.
- M03: journey duration, transfer waiting time, selecting the latest suitable service, finishing a four-stage itinerary and selecting a viable connection before calculating the whole journey duration.
- M04: two and three angles on a straight line, vertically opposite angles and three/four angles at a point.

The lesson DimRect and AngleDiagram renderers are reused. Dimensions stay outside shapes; the unknown width is hidden in both visible and accessible labels. Angle diagrams show the precise sector to find, without a numeric answer in accessible text. The existing timber board, parcel, bottle and lunchbox illustrations accompany measured objects, and the train illustration supports timetables. Read diagram covers all written labels, times, units and instructions without narrating calculated answers.

Nineteen questions use typed numbers or time fields; one uses service choices because the response is a train name. Shared Measurelands styling, question navigation, read-aloud, I don’t know, and the normal realm/level dropdown are retained.

Verification: independently recompute all 100 answers, validate units, angle sums, timetable constraints and area/perimeter relationships; check correct/incorrect/blank/IDK scoring and matched form metadata. Render all 100 panels and inspect representative layouts before the production build. The approved release is frozen separately from future review edits.

## Timetable refinement after lesson comparison

Compared with `data/activities/year6Measurelands/week5Common.ts`, `MeasurelandsTimetableCard` and `MeasurelandsTimeQuestCard`. These lessons use four-service timetables and four-stage excursions, rather than only a single departure/arrival pair. All five assessment forms now use:

- Q3: locate a named service among four rows and calculate its duration (accessible entry item).
- Q7: allow a stated minimum platform-change time, select the first catchable service, then calculate the full wait from arrival. Distractors include an already-departed service and an insufficient transfer.
- Q10: compare four departures/arrivals to meet a deadline; differing journey durations prevent choosing by arrival order alone.
- Q14: add outward travel, a museum tour, lunch and return travel to find the final 24-hour arrival time. The lesson's ordered itinerary presentation is adapted without revealing intermediate or final times.
- Q18: select the first viable onward connection, then calculate total travel plus waiting. A later express arrives earlier but is not the first departing eligible service, so the stated instruction matters.

Question counts, descriptor balance, response modes and other measurement content are unchanged. Read diagram includes all provided constraints and itinerary durations. The audit independently selects eligible services and checks missed-service/short-transfer distractors across all five forms. These are intended difficulty judgements; observed student results are still needed for calibration.

Station refinement: Q3 now lists four distinct named routes. Q7 and Q18 use a mixed-destination departure board with named origin, interchange and destination stations, varied across the five forms. Repeat departures to the same station retain the actual station name, without numbered destination suffixes. Catchable trains to other stations are distractors; scoring checks destination as well as transfer time. All route names are included in read-aloud.
