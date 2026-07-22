# Starpath Lesson Experience Audit

## Canonical flow

Every Starpath lesson route now opens the shared `StarpathMissionHome` before any lesson engine can mount. The mission home owns the mission brief, learning intention, success criteria, rewards preview, approximate duration and explicit Start Mission action.

The platform-wide `RealmLessonBlueprint` fixes the authoring contract to one teaching segment, exactly three curriculum activities and one reflection. `StarpathLessonContent` adds Starpath mission language to that shared contract. Lesson authors cannot configure timers, brain breaks, saving, results or navigation.

Only an implemented registry lesson can receive a Start Mission callback. Planned lessons show the same mission identity and a safe preparation state; they cannot enter placeholder activities or another realm's engine.

## Implemented

- `ground-space-w1-l1` Meet the Shapes: mission home, teaching introduction, three randomly rotating activity types, shared brain breaks, Mission Log, XP results and Back to Week navigation.

## Missing lesson engines

These routes have the shared mission home but are intentionally unavailable until their three curriculum activities exist:

- Ground Level: `ground-space-w1-l2` through `ground-space-w1-l3`; `ground-space-w2-l1` through `ground-space-w8-l3`.
- Level 1: `y1-space-w1-l1` through `y1-space-w8-l3`.
- Level 2: `y2-space-w1-l1` through `y2-space-w8-l3`.
- Level 3: `y3-space-w1-l1` through `y3-space-w8-l3`.
- Level 4: `y4-space-w1-l1` through `y4-space-w8-l3`.
- Level 5: `y5-space-w1-l1` through `y5-space-w8-l3`.
- Level 6: `y6-space-w1-l1` through `y6-space-w8-l3`.

Total: 167 planned lesson engines.

For each route above, the missing pieces are the teaching introduction, three implemented activity types, reflection content, completion persistence validation and end-to-end results verification. Mission metadata and safe Back to Week navigation are already present through the shared route.

## Shared architecture

- `RealmLessonBlueprint` defines the lifecycle content contract shared by every realm.
- `StarpathLessonShell` owns Starpath's lesson presentation and translates Starpath terminology into the shared runtime.
- Individual Starpath lesson files contain curriculum content, artwork, teaching, exactly three activities and reflection only.
- Timer creation and automatic brain breaks remain inside `PracticeRunner`; it is not mounted before Start Mission.
- The three curriculum activities rotate in shuffled random cycles inside one continuous timed practice session; they are not presented as separate challenges or fixed time blocks.
- Mission Log and Mission Complete wording are shared component configuration.
- Saving, XP, completion and result sequencing remain shared runtime responsibilities.
- Number Nexus and Measurelands retain their existing runtime behaviour while using their own realm content and presentation.
- Starpath-specific colour tokens are resolved by the shared realm theme utility.

## Platform rule

Every realm follows the same lifecycle: lesson home, explicit start, teaching, three curriculum activities, automatic brain breaks, reflection, XP results and return to the week. Realm code may change curriculum, activity renderers, artwork, colours, terminology, characters and backgrounds. It may not change progression, timing ownership, completion, saving or navigation rules.
