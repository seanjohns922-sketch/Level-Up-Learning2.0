# Measurelands Level 3 — five matched forms for review

Source: supplied Australian Curriculum v9 F–6 content document, pages 32–33.
Retains the existing Level 3 pre/post emphasis: metric units and estimates,
labelled rulers/scales/jugs, duration relationships, analogue time and right-angle
benchmarks. Twenty questions per form, matching skill/code, response type and
intended end-of-Year-3 demand. Six accessible, eleven moderate and three
challenging items; difficulty is author judgement pending student calibration.

Coverage: AC9M3M01 (units and estimates), M02 (metric instruments/comparison),
M03 (days/hours/minutes/seconds), M04 (time to the minute), M05 (angles as turns).
AC9M3M06 money is covered in the released Number Nexus forms, as in the existing
realm allocation; this is not a claim that money is outside the Measurement strand.
Practical measuring/estimating should also be observed in lessons.

All five forms use the same 20-slot blueprint. Changed numbers, object examples,
clock times, angle orientation/size and answer positions provide parallel forms.
Definitions such as a half turn being two right angles necessarily recur.
Hours remain 2–4; duration comparisons stay within one hour; labelled instruments
land exactly on numbered marks. Ruler offsets and near-hour clock readings are
reserved for challenge slots. No degree calculation or unlabelled-scale interpolation.

Visual reuse: inspected the Year 3 lesson object pools and instrument components.
Reuse RulerWithObject, MeasurelandsScale, MeasurelandsJug and ClockFace. The ruler
has an opt-in recognisable pencil whose tip/end share the ruler's coordinates;
existing lesson rendering is unchanged. Use the existing stitched ribbon renderer.
Inspected lesson PNGs: backpack, pumpkin, watermelon, chair, bucket, apple, cup and
desk. Use these for units and benchmark groups. Angle diagrams have controlled
openings and arm lengths, including unequal arm lengths with equal angles.

Question/option read-aloud and IDK/navigation come from the shared assessment
screen. Read diagram narrates captions and visible comparison values, without
announcing instrument readings or hidden answers. Instrument SVGs are wrapped
so their lesson-specific answer-bearing accessibility labels are not exposed.
The Measurelands theme covers the shared review header and controls.

Demo Review → Measurelands → Level 3 → Pre-Test/Post-Test/Start/Mid/End.
Review only: existing student Level 3 banks and diagnostic versions remain live
until approval. No database changes for this review release.

Validation: 100 independently computed answers, scoring and IDK, unique choices,
matching curriculum/difficulty/response type, ruler bounds, exact labelled scale
readings and asset existence. All 100 panels server-rendered without invalid
coordinates. Targeted rendered checks cover rulers, mass, capacity, angle equality
and benchmark layout. TypeScript and production-build checks accompany publication.
