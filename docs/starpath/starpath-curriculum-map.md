# Starpath Curriculum Map

> Status: In development. All 24 Ground Level lessons and seven independent weekly quiz banks are implemented for Demo Mode. The independent Ground Post-Test is Version 1.0 Production.

Starpath uses the canonical realm ID `space`. Every level has exactly 8 weeks and 3 lessons per week. Weeks 1-7 have a 15-question weekly quiz (5 questions per lesson); Week 8 uses the Post-Test. Ground Level has no pre-test. Levels 1-6 use a 20-question pre-test.

## Pathway Rules

- 85-100%: level mastered; no required weeks.
- 50-84%: targeted pathway based on weak skill-to-week evidence.
- 0-49% or no pre-test result: full 8-week pathway.
- Starpath remains a Demo Mode preview. Its journey state is isolated under `realm_id=space` and is not production student progression.

## Curriculum Sources

- [Australian Curriculum v9 Mathematics: Space strand](https://v9.australiancurriculum.edu.au/curriculum-information/understand-this-learning-area/mathematics)
- [QCAA achievement standard and content description sequence](https://www.qcaa.qld.edu.au/downloads/aciqv9/mathematics/curriculum/ac9_maths_prep-yr10_as_cd_sequence_aspects.pdf)

## Starpath Ground Level: Shape and Space Explorers

**Canonical level:** `ground`
**Program ID:** `ground-space`
**Status:** implemented

Young Space Explorers recognise, create, sort and find familiar shapes, then describe people and objects relative to named references in a final Starpath adventure.

### Curriculum Alignment

- **AC9MFSP01:** sort, name and create familiar shapes; recognise and describe familiar shapes within objects in the environment, giving reasons
- **AC9MFSP02:** describe the position and location of themselves and objects in relation to other people and objects within a familiar space

**Achievement-standard connection:** Students describe familiar shapes and the position and location of themselves and objects relative to other objects and people in familiar spaces.

**Prerequisite knowledge**

- Everyday experience with familiar objects, people and simple location words.

**Likely level misconceptions**

- A shape changes name when rotated.
- Size or colour determines a shape.
- Position words have a fixed viewpoint.

**Progression rationale:** The sequence runs shapes first, then space. Weeks 1-3 recognise, create, sort and compare familiar shapes (AC9MFSP01). Weeks 4-6 describe the position and location of objects and people relative to named references in familiar spaces (AC9MFSP02). Weeks 7-8 combine both descriptors to build, locate and describe a space scene and complete a cumulative Space Graduation. Completion is planned to unlock the Ground Level Starpath Graduate title.

### Assessment Metadata

- Pre-test: not required
- Post-test: `ground-space-post-01` (20 questions; unlocks after `ground-space-w8-l3`; implemented)

### Skill Taxonomy

| Skill ID | Student name | Teacher description | Week | Category | Prerequisites |
| --- | --- | --- | ---: | --- | --- |
| `space-ground-shape-recognition` | Spot familiar shapes | Recognises and names circles, squares, triangles and rectangles despite changes in size, colour or orientation. | 1 | shape-and-object-reasoning | None |
| `space-ground-shape-creation` | Build with shapes | Creates familiar shape pictures, recognises the shapes within completed objects and explains simple visual reasoning. | 2 | construction-and-visualisation | `space-ground-shape-recognition` |
| `space-ground-shape-sorting` | Sort shapes with a reason | Sorts and compares familiar shapes despite changes in colour and size, then gives a simple reason for a choice. | 3 | shape-and-object-reasoning | `space-ground-shape-recognition` |
| `space-ground-describe-position` | Say where things are | Describes the position and location of objects in relation to other objects using above, below, beside, behind, in front and inside. | 4 | position-and-navigation | `space-ground-shape-recognition` |
| `space-ground-follow-directions` | Compare people and positions | Describes where they, other people and objects are relative to a named person or object. | 5 | position-and-navigation | `space-ground-describe-position` |
| `space-ground-movement-pathways` | Use location clues | Uses one or more relative-position clues to locate a person or object and explain the reference used. | 6 | position-and-navigation | `space-ground-follow-directions` |
| `space-ground-shape-position-composition` | Build and describe a space scene | Combines familiar shapes in a space scene and describes where objects are using simple positional language. | 7 | construction-and-visualisation | `space-ground-shape-creation`, `space-ground-describe-position` |
| `space-ground-spatial-mission` | Complete Space Graduation | Integrates shape recognition, creation, sorting and relative-position language to solve a cumulative Starpath mission. | 8 | spatial-representation | `space-ground-shape-sorting`, `space-ground-describe-position`, `space-ground-movement-pathways`, `space-ground-shape-position-composition` |

### Eight-Week Sequence

#### Week 1: Shape Spotters

**Central concept:** Recognise and name familiar two-dimensional shapes in varied Starpath scenes.
**Curriculum alignment:** AC9MFSP01
**Practised skills:** `space-ground-shape-recognition`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Meet the Shapes (`ground-space-w1-l1`) | build | Recognise circles, squares, triangles and rectangles. | I can recognise and name familiar shapes. | cosmic-shape-match, shape-name-recall, shape-sorter |
| 2. Shape Detectives (`ground-space-w1-l2`) | develop | Find familiar shapes hidden inside everyday objects. | I can find familiar shapes in the world around me. | space-object-match, shape-explorer, shape-detective-hunt |
| 3. Shape Masters (`ground-space-w1-l3`) | apply | Recognise and sort familiar shapes independently. | I can recognise shapes by myself. | which-one-doesnt-belong, space-shape-sort, cosmic-mission |

**Vocabulary:** circle, square, triangle, rectangle, shape

**Common misconceptions**

- A shape changes name when it is turned.
- The colour or size determines the shape.

**Weekly quiz:** `ground-space-w1-quiz` - Recognition, naming, matching and simple sorting. (15 questions; implemented)

#### Week 2: Shape Builders

**Central concept:** Use familiar shapes as building blocks to create pictures and explain the shapes within them.
**Curriculum alignment:** AC9MFSP01
**Practised skills:** `space-ground-shape-creation`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Build with Shapes (`ground-space-w2-l1`) | build | Use familiar shapes to build simple pictures. | I can use shapes to build pictures. | finish-the-picture, shape-builder, which-shapes-did-you-use |
| 2. Shape Creators (`ground-space-w2-l2`) | develop | Combine familiar shapes to create new pictures. | I can make new things using shapes. | copy-my-picture, shape-challenge, find-the-missing-shape |
| 3. Space Builders (`ground-space-w2-l3`) | apply | Build and explain shape creations using visual reasoning. | I can build and explain my creations. | cosmic-construction, match-the-build, space-museum |

**Vocabulary:** build, shape, combine, picture, explain

**Common misconceptions**

- A picture can contain only one shape.
- A creation must match one exact arrangement.

**Weekly quiz:** `ground-space-w2-quiz` - Guided construction, creative composition and visual shape reasoning. (15 questions; implemented)

#### Week 3: Shape Sorters

**Central concept:** Sort and compare familiar shapes by noticing simple visual similarities and differences.
**Curriculum alignment:** AC9MFSP01
**Practised skills:** `space-ground-shape-sorting`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Shape Families (`ground-space-w3-l1`) | build | Sort familiar shapes into matching groups. | I can sort shapes into groups. | sorting-station, collect-the-family, find-the-odd-shape |
| 2. Same or Different? (`ground-space-w3-l2`) | develop | Compare familiar shapes despite changes in colour and size. | I can compare familiar shapes. | same-or-different, twins-in-disguise, what-changed |
| 3. Shape Challenge (`ground-space-w3-l3`) | apply | Apply shape recognition, sorting and comparing together. | I can recognise, sort and compare familiar shapes. | mixed-shape-hunt, same-or-different-recap, shape-sprint |

**Vocabulary:** sort, same, different, family, belong

**Common misconceptions**

- Colour changes the name of a shape.
- Size changes the name of a shape.

**Weekly quiz:** `ground-space-w3-quiz` - Shape-family sorting, visual comparison and simple explanations. (15 questions; implemented)

#### Week 4: Space Positions

**Central concept:** Describe where objects are using simple positional language within a familiar space.
**Curriculum alignment:** AC9MFSP02
**Practised skills:** `space-ground-describe-position`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Where Is It? (`ground-space-w4-l1`) | build | Describe where objects are using above, below and beside. | I can describe where objects are. | find-it, place-it, which-picture |
| 2. Around Starpath (`ground-space-w4-l2`) | develop | Describe where objects are using behind, in front and inside. | I can describe where objects are in space. | hide-and-seek, space-explorer, match-the-position |
| 3. Position Challenge (`ground-space-w4-l3`) | apply | Follow positional clues to complete a space mission. | I can use positional language to complete a mission. | follow-the-clues, space-map, explorer-mission |

**Vocabulary:** above, below, beside, behind, inside

**Common misconceptions**

- A position word describes an object without a reference object.
- Above and on always mean the same thing.

**Weekly quiz:** `ground-space-w4-quiz` - Positional language: above, below, beside, behind, in front and inside. (15 questions; implemented)

#### Week 5: People and Positions

**Central concept:** Describe where people and objects are relative to named references in familiar spaces.
**Curriculum alignment:** AC9MFSP02
**Practised skills:** `space-ground-follow-directions`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Where Am I? (`ground-space-w5-l1`) | build | Describe where the explorer is relative to Geospin and familiar objects. | I can describe where I am compared with a person or object. | describe-self, match-position, place-explorer |
| 2. Where Are We? (`ground-space-w5-l2`) | develop | Compare where two people are relative to a shared reference. | I can compare where people are using a named reference. | compare-people, choose-scene, place-person |
| 3. Position Mission (`ground-space-w5-l3`) | apply | Place people and objects to match relative-position clues. | I can place people and objects to match position clues. | say-position, check-scene, build-position |

**Vocabulary:** above, below, beside, person, reference

**Common misconceptions**

- A position word makes sense without naming a reference.
- People and objects cannot share the same position word.

**Weekly quiz:** `ground-space-w5-quiz` - Describing people and objects relative to explicit references. (15 questions; implemented)

#### Week 6: Location Clues

**Central concept:** Use relative-position clues to locate people and hidden objects in familiar spaces.
**Curriculum alignment:** AC9MFSP02
**Practised skills:** `space-ground-movement-pathways`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Find the Explorer (`ground-space-w6-l1`) | build | Locate the explorer from a clue naming another person or object. | I can locate the explorer from a relative-position clue. | find, describe, picture |
| 2. Help Geospin (`ground-space-w6-l2`) | develop | Locate Geospin by comparing positions in a familiar scene. | I can locate Geospin by comparing positions. | find, describe, picture |
| 3. Hidden Treasure (`ground-space-w6-l3`) | apply | Find an object by applying several relative-location clues. | I can use several location clues to find a hidden object. | clue-one, check-scene, treasure |

**Vocabulary:** clue, location, person, object, reference

**Common misconceptions**

- A clue does not need a reference.
- The closest object must always be the answer.

**Weekly quiz:** `ground-space-w6-quiz` - Locating people and objects from explicit relative-position clues. (15 questions; implemented)

#### Week 7: Build Starpath

**Central concept:** Combine familiar shapes and positions to create and describe a space scene.
**Curriculum alignment:** AC9MFSP01, AC9MFSP02
**Practised skills:** `space-ground-shape-position-composition`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Build a Planet (`ground-space-w7-l1`) | build | Combine familiar shapes to create a planet design. | I can build pictures using shapes. | build-object, finish-picture, name-the-shapes |
| 2. Create a Space Scene (`ground-space-w7-l2`) | develop | Arrange shape-built objects in a Starpath scene. | I can build objects and arrange them in a scene. | build-for-scene, place-in-scene, which-scene |
| 3. Describe Your Picture (`ground-space-w7-l3`) | apply | Use simple oral positional language to describe the scene. | I can describe where objects are in my scene. | say-where, find-in-scene, scene-reasoning |

**Vocabulary:** create, planet, scene, beside, describe

**Common misconceptions**

- A scene has only one correct arrangement.
- A listener can see where everything is without position words.

**Weekly quiz:** `ground-space-w7-quiz` - Combining shape creation, scene composition and positional description. (15 questions; implemented)

#### Week 8: Space Graduation

**Central concept:** Apply shape recognition, creation, sorting and relative-position language in a final adventure.
**Curriculum alignment:** AC9MFSP01, AC9MFSP02
**Practised skills:** `space-ground-spatial-mission`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Shape Explorer Challenge (`ground-space-w8-l1`) | build | Recognise, create and sort familiar shapes in a cumulative challenge. | I can recognise, sort and compare shapes. | recognise, odd-one-out, compare |
| 2. Position Explorer Challenge (`ground-space-w8-l2`) | develop | Describe and create positions from location clues. | I can find, describe and create relative positions. | find-by-position, say-where, place-person |
| 3. Geospin's Final Mission (`ground-space-w8-l3`) | apply | Help Geospin complete an adventure combining all Ground Level skills. | I can combine all my skills to complete a mission. | sort-shapes, which-picture, final-clues |

**Vocabulary:** shape, sort, position, reference, explorer

**Common misconceptions**

- Only one type of shape or position clue can appear in a mission.
- A position answer does not need a named reference.

**Weekly quiz:** none. Week 8 Lesson 3 unlocks `ground-space-post-01`.

## Starpath Level 1: Shape Makers and Pathfinders

**Canonical level:** `level-1`
**Program ID:** `y1-space`
**Status:** planned

Students compare and classify familiar shapes and objects, then give and follow directions within spaces.

### Curriculum Alignment

- **AC9M1SP01:** Make, compare and classify familiar shapes; recognise familiar shapes and objects in the environment, identifying similarities and differences.
- **AC9M1SP02:** Give and follow directions to move people and objects to different locations within a space.

**Achievement-standard connection:** Students make, compare and classify familiar shapes and objects and give and follow directions to move within a space.

**Prerequisite knowledge**

- Recognise common shapes.
- Use basic relational position and movement words.

**Likely level misconceptions**

- Orientation changes a shape's identity.
- Directions work without a starting position.
- An object has only one useful shape description.

**Progression rationale:** Foundation recognition develops into comparison, classification and construction; familiar movement develops into ordered, communicable routes.

### Assessment Metadata

- Pre-test: `y1-space-pre-01` (20 questions; implemented)
- Post-test: `y1-space-post-01` (20 questions; unlocks after `y1-space-w8-l3`; implemented)

### Skill Taxonomy

| Skill ID | Student name | Teacher description | Week | Category | Prerequisites |
| --- | --- | --- | ---: | --- | --- |
| `space-l1-shape-features` | Become a shape expert | Recognises and compares familiar shapes in varied forms, identifying simple similarities and differences. | 1 | shape-and-object-reasoning | `space-ground-shape-recognition` |
| `space-l1-shape-classification` | Build shape families | Classifies familiar shapes and objects and explains the shared feature. | 2 | shape-and-object-reasoning | `space-l1-shape-features` |
| `space-l1-shape-composition` | Find shapes in pictures | Decomposes a picture into its familiar shapes and finds and counts every shape of each kind. | 3 | construction-and-visualisation | `space-l1-shape-classification` |
| `space-l1-objects-and-views` | Find shapes in the world | Recognises familiar shapes in everyday objects and identifies similarities and differences between them. | 4 | shape-and-object-reasoning | `space-l1-shape-features` |
| `space-l1-make-shapes` | Construct and compare shapes | Makes familiar shapes by joining points, repairs incomplete shapes and compares completed constructions. | 5 | construction-and-visualisation | `space-l1-shape-features` |
| `space-l1-give-directions` | Build and plan routes | Creates ordered routes and plans pathways that satisfy checkpoints, obstacles and destinations across familiar grids. | 6 | position-and-navigation | `space-ground-follow-directions` |
| `space-l1-fix-routes` | Test and fix a route | Runs a route, diagnoses an incorrect step and revises a route until it reaches the goal. | 7 | position-and-navigation | `space-l1-give-directions` |
| `space-l1-pathfinder-reasoning` | Solve a pathfinder challenge | Uses shape information and directions together to solve and explain spatial problems. | 8 | spatial-representation | `space-l1-objects-and-views`, `space-l1-give-directions` |

### Eight-Week Sequence

#### Week 1: Shape Experts

**Central concept:** Recognise and compare familiar shapes despite changes in colour, size and orientation.
**Curriculum alignment:** AC9M1SP01
**Practised skills:** `space-l1-shape-features`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Shape Disguise Mission (`y1-space-w1-l1`) | build | Recognise familiar shapes after changes in colour, size or orientation. | I can recognise familiar shapes even when they look different. | hologram-stabiliser, turntable-scanner, disguise-match |
| 2. Shape Face-Off (`y1-space-w1-l2`) | develop | Compare close shape pairs and identify similarities and differences. | I can compare familiar shapes and explain what is the same or different. | close-pair, similarity-scan, difference-scan |
| 3. Mystery Shape Rescue (`y1-space-w1-l3`) | apply | Use several visual clues to identify and check familiar shapes. | I can use shape clues to solve a shape challenge. | clue-decoder, shape-elimination, label-repair |

**Vocabulary:** shape, same, different, compare, clue

**Common misconceptions**

- Colour or size changes a shape's identity.
- A small turn makes a familiar shape into a new shape.

**Weekly quiz:** `y1-space-w1-quiz` - Shape invariance, close-shape comparison and visual clue reasoning. (15 questions; implemented)

#### Week 2: Shape Families

**Central concept:** Classify shapes and objects using shared features.
**Curriculum alignment:** AC9M1SP01
**Practised skills:** `space-l1-shape-classification`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Meet the Families (`y1-space-w2-l1`) | build | Group shapes by a given feature. | I can sort shapes into families by their features. | meet-the-families, family-check, family-mastery |
| 2. Make Your Own Rule (`y1-space-w2-l2`) | develop | Classify a mixed collection in a useful way. | I can work out the rule behind a group of shapes. | find-the-rule, rule-check, rule-mastery |
| 3. Two Ways to Sort (`y1-space-w2-l3`) | apply | Reclassify the same set and compare rules. | I can sort the same shapes in more than one way. | another-way, another-way-2, rule-recap |

**Vocabulary:** classify, family, rule, similar, different

**Common misconceptions**

- There is only one correct classification.
- Objects with different uses cannot share shape features.

**Weekly quiz:** `y1-space-w2-quiz` - Classification rules and flexible grouping. (15 questions; implemented)

#### Week 3: Shape Detectives

**Central concept:** Take pictures apart into their familiar shapes and count each kind.
**Curriculum alignment:** AC9M1SP01
**Practised skills:** `space-l1-shape-composition`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Shape Detectives (`y1-space-w3-l1`) | build | Find and count every familiar shape in a picture. | I can find and count the shapes hidden in a picture. | hunt-1, hunt-2, hunt-3 |
| 2. Hidden Shape Hunt (`y1-space-w3-l2`) | develop | Find every hidden shape in busier pictures. | I can find every shape hidden in a busier picture. | hunt-1, hunt-2, hunt-3 |
| 3. Master Detective (`y1-space-w3-l3`) | apply | Find every shape in the busiest pictures. | I can find every shape in the busiest pictures. | hunt-1, hunt-2, hunt-3 |

**Vocabulary:** find, count, shape, how many, hidden

**Common misconceptions**

- A shape stops being that shape inside a picture.
- You can stop before finding every shape.

**Weekly quiz:** `y1-space-w3-quiz` - Finding and counting familiar shapes hidden in pictures. (15 questions; implemented)

#### Week 4: Shapes in the World

**Central concept:** Recognise familiar shapes in everyday objects and compare their similarities and differences.
**Curriculum alignment:** AC9M1SP01
**Practised skills:** `space-l1-objects-and-views`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Shapes Around Us (`y1-space-w4-l1`) | build | Spot the familiar shapes in everyday objects. | I can spot the familiar shapes in everyday objects. | spot-1, spot-2, spot-3 |
| 2. Same or Different? (`y1-space-w4-l2`) | develop | Compare two objects and say what is the same or different. | I can compare two objects and say what is the same or different. | compare-1, compare-2, compare-3 |
| 3. Shape Match (`y1-space-w4-l3`) | apply | Pair up objects that share a shape. | I can pair up objects that share a shape. | match-1, match-2, match-3 |

**Vocabulary:** object, shape, same, different, match

**Common misconceptions**

- Everyday objects have no shape.
- Two different objects cannot share a shape.

**Weekly quiz:** `y1-space-w4-quiz` - Recognising shapes in objects and comparing similarities and differences. (15 questions; implemented)

#### Week 5: Shape Workshop

**Central concept:** Construct, repair and compare familiar shapes using points and line segments.
**Curriculum alignment:** AC9M1SP01
**Practised skills:** `space-l1-make-shapes`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Connect the Stars (`y1-space-w5-l1`) | build | Construct familiar shapes by joining points in order. | I can make familiar shapes by joining points. | construct-1, construct-2, construct-3 |
| 2. Shape Repair Crew (`y1-space-w5-l2`) | develop | Find and repair a missing side in an incomplete shape. | I can find and repair a missing side. | repair-1, repair-2, repair-3 |
| 3. Build and Compare (`y1-space-w5-l3`) | apply | Compare completed shape constructions and explain similarities and differences. | I can construct and compare familiar shapes. | compare-build-1, compare-build-2, compare-build-3 |

**Vocabulary:** construct, corner, side, repair, compare

**Common misconceptions**

- A shape does not need to be closed.
- Changing size or orientation creates a new shape.

**Weekly quiz:** `y1-space-w5-quiz` - Deliberate construction, repair and comparison of familiar shapes. (15 questions; implemented)

#### Week 6: Build a Route

**Central concept:** Create routes, then plan increasingly complex missions that follow spatial rules.
**Curriculum alignment:** AC9M1SP02
**Practised skills:** `space-l1-give-directions`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Build a Route (`y1-space-w6-l1`) | build | Choose any valid sequence of moves that reaches the goal. | I can build a route to reach a goal. | build-1, build-2, build-3 |
| 2. Mission Routes (`y1-space-w6-l2`) | develop | Plan routes on a 4 by 4 grid that follow one mission rule. | I can plan a route that follows a mission rule. | mission-1, mission-2, mission-3 |
| 3. Wide Grid Route Designer (`y1-space-w6-l3`) | apply | Plan longer routes across an 8 by 4 grid with multiple constraints. | I can plan a longer route that follows several mission rules. | design-1, design-2, design-3 |

**Vocabulary:** build, order, route, checkpoint, obstacle

**Common misconceptions**

- Only the shortest route can be correct.
- Reaching the goal is enough even when a mission rule was missed.

**Weekly quiz:** `y1-space-w6-quiz` - Creating routes, applying one constraint, then combining constraints across a wider grid. (15 questions; implemented)

#### Week 7: Test & Fix

**Central concept:** Test a route, find the broken step and improve it.
**Curriculum alignment:** AC9M1SP02
**Practised skills:** `space-l1-fix-routes`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Find the Error (`y1-space-w7-l1`) | build | Diagnose the wrong step in a route. | I can find the wrong step in a route. | debug-1, debug-2, debug-3 |
| 2. Fix the Route (`y1-space-w7-l2`) | develop | Finish a started route across an 8 by 4 grid. | I can finish a route so it reaches the goal. | fix-1, fix-2, fix-3 |
| 3. Test and Improve (`y1-space-w7-l3`) | apply | Run, repair and improve routes across an 8 by 4 grid. | I can test a route and improve it. | improve-1, improve-2, improve-3 |

**Vocabulary:** test, wrong, fix, improve, route

**Common misconceptions**

- A failed route must be thrown away rather than fixed.
- A route only ever has one thing wrong.

**Weekly quiz:** `y1-space-w7-quiz` - Testing, debugging and improving routes. (15 questions; implemented)

#### Week 8: Pathfinder Challenge

**Central concept:** Integrate classification, views and directions.
**Curriculum alignment:** AC9M1SP01, AC9M1SP02
**Practised skills:** `space-l1-pathfinder-reasoning`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Find the Shape Landmark (`y1-space-w8-l1`) | build | Use shape clues to identify route landmarks. | I can use shapes and views to find landmarks. | landmark-classify, landmark-view, landmark-match |
| 2. Plan Around Obstacles (`y1-space-w8-l2`) | develop | Create a valid pathway through a familiar space. | I can plan and repair a route. | plan-build, plan-repair, plan-follow |
| 3. Explain Your Path (`y1-space-w8-l3`) | apply | Compare routes and justify a solution. | I can give and explain a clear route. | explain-route, explain-move, explain-shape |

**Vocabulary:** landmark, obstacle, path, compare, explain

**Common misconceptions**

- The shortest-looking route always works.
- Different valid routes cannot share a destination.

**Weekly quiz:** none. Week 8 Lesson 3 unlocks `y1-space-post-01`.

## Starpath Level 2: Space Mapper

**Canonical level:** `level-2`
**Program ID:** `y2-space`
**Status:** implemented

Space Mappers recognise shape features using number of sides and spatial terms, then read two-dimensional maps and follow and give pathways across Starpath.

### Curriculum Alignment

- **AC9M2SP01:** recognise, compare and classify shapes, referencing the number of sides and using spatial terms such as opposite, parallel, curved and straight
- **AC9M2SP02:** locate positions in two-dimensional representations of a familiar space; move positions by following directions and pathways

**Achievement-standard connection:** Students compare and classify shapes using number of sides and spatial terms, locate positions in two-dimensional representations and follow and give directions and pathways.

**Prerequisite knowledge**

- Compare and classify familiar shapes.
- Give and follow ordered directions.

**Likely level misconceptions**

- A curved edge counts as a straight side.
- Turning a shape changes its number of sides.
- Places have no fixed position on a map.

**Progression rationale:** Weeks 1-4 sharpen shape features (straight/curved, number of sides, opposite/parallel, and comparing two shapes) using simple Year 2 language. Weeks 5-7 build two-dimensional map skills in a clear progression: reading a map to find named places (W5), identifying and describing positions on it (W6), then following and giving ordered routes (W7) - foregrounding the new Year-2 map-reading skill rather than repeating Year-1 direction-following. Week 8 combines shapes, maps and pathways in a Space Mapper mission before the Post-Test.

### Assessment Metadata

- Pre-test: `y2-space-pre-01` (20 questions; implemented)
- Post-test: `y2-space-post-01` (20 questions; unlocks after `y2-space-w8-l3`; implemented)

### Skill Taxonomy

| Skill ID | Student name | Teacher description | Week | Category | Prerequisites |
| --- | --- | --- | ---: | --- | --- |
| `space-l2-straight-curved` | Tell straight from curved | Identifies whether a familiar shape has straight sides or curved edges. | 1 | shape-and-object-reasoning | `space-l1-shape-features` |
| `space-l2-count-sides` | Count and classify sides | Classifies familiar shapes by counting the number of sides. | 2 | shape-and-object-reasoning | `space-l2-straight-curved` |
| `space-l2-parallel-opposite` | Find parallel and opposite sides | Recognises opposite sides and parallel sides on familiar shapes. | 3 | shape-and-object-reasoning | `space-l2-count-sides` |
| `space-l2-compare` | Compare two shapes | Compares two familiar shapes and identifies what is the same and what is different about their features. | 4 | shape-and-object-reasoning | `space-l2-parallel-opposite` |
| `space-l2-map-reading` | Read a star map | Locates a named place on a simple two-dimensional map, and names the place at a marked spot. | 5 | spatial-representation | `space-l2-compare` |
| `space-l2-positions` | Describe positions on a map | Describes which place is next to, above or below another, and combines two position clues to identify a single place on a two-dimensional map. | 6 | spatial-representation | `space-l2-map-reading` |
| `space-l2-navigation` | Plan and debug routes | Follows a pathway to a named place, plans a route that visits a checkpoint and avoids hazards, and finds the broken step in a faulty route on a two-dimensional map. | 7 | position-and-navigation | `space-l2-positions` |
| `space-l2-master-mapper` | Become a Master Mapper | Combines shape features, map reading and pathway following to complete a cumulative mission. | 8 | spatial-representation | `space-l2-compare`, `space-l2-navigation` |

### Eight-Week Sequence

#### Week 1: Straight and Curved

**Central concept:** Tell straight sides from curved edges.
**Curriculum alignment:** AC9M2SP01
**Practised skills:** `space-l2-straight-curved`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Straight or Curved? (`y2-space-w1-l1`) | build | Decide if a shape has straight sides or curved edges. | I can tell straight sides from curved edges. | straight-curved, edge-sort, edge-challenge |
| 2. Sort by Edge (`y2-space-w1-l2`) | develop | Group shapes by straight or curved edges. | I can find shapes with straight or curved edges. | straight-curved, edge-sort, edge-challenge |
| 3. Edge Challenge (`y2-space-w1-l3`) | apply | Mixed straight and curved review. | I can tell straight and curved apart. | straight-curved, edge-sort, edge-challenge |

**Vocabulary:** straight, curved, side, edge, shape

**Common misconceptions**

- A curved edge is a straight side.
- Turning a shape changes its edges.

**Weekly quiz:** `y2-space-w1-quiz` - Straight sides versus curved edges. (15 questions; implemented)

#### Week 2: Count the Sides

**Central concept:** Classify shapes by the number of sides.
**Curriculum alignment:** AC9M2SP01
**Practised skills:** `space-l2-count-sides`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Count the Sides (`y2-space-w2-l1`) | build | Count how many sides a shape has. | I can count the sides of a shape. | count-sides, sides-sort, sides-challenge |
| 2. Sides Sort (`y2-space-w2-l2`) | develop | Group shapes by their number of sides. | I can find a shape by its number of sides. | count-sides, sides-sort, sides-challenge |
| 3. Sides Challenge (`y2-space-w2-l3`) | apply | Mixed side-counting review. | I can classify shapes by their sides. | count-sides, sides-sort, sides-challenge |

**Vocabulary:** side, count, three, four, classify

**Common misconceptions**

- A turned shape has fewer sides.
- Bigger shapes have more sides.

**Weekly quiz:** `y2-space-w2-quiz` - Classifying shapes by number of sides. (15 questions; implemented)

#### Week 3: Parallel and Opposite

**Central concept:** Recognise opposite and parallel sides.
**Curriculum alignment:** AC9M2SP01
**Practised skills:** `space-l2-parallel-opposite`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Opposite Sides (`y2-space-w3-l1`) | build | Find the sides across from each other. | I can tell if a shape has parallel sides. | opposite-sides, parallel-tracks, parallel-challenge |
| 2. Parallel Tracks (`y2-space-w3-l2`) | develop | Recognise parallel sides like train tracks. | I can find shapes with parallel sides. | opposite-sides, parallel-tracks, parallel-challenge |
| 3. Parallel Challenge (`y2-space-w3-l3`) | apply | Mixed opposite and parallel review. | I can reason about parallel sides. | opposite-sides, parallel-tracks, parallel-challenge |

**Vocabulary:** opposite, parallel, side, across, tracks

**Common misconceptions**

- Parallel sides must be flat or horizontal.
- Opposite sides always touch.

**Weekly quiz:** `y2-space-w3-quiz` - Opposite and parallel sides. (15 questions; implemented)

#### Week 4: Compare Shapes

**Central concept:** Compare two shapes by their features and say what is the same and what is different.
**Curriculum alignment:** AC9M2SP01
**Practised skills:** `space-l2-compare`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. What Is the Same? (`y2-space-w4-l1`) | build | Find what is the same about two shapes. | I can say what is the same about two shapes. | same-feature, what-different, compare-challenge |
| 2. What Is Different? (`y2-space-w4-l2`) | develop | Find what is different about two shapes. | I can say what is different about two shapes. | same-feature, what-different, compare-challenge |
| 3. Compare Challenge (`y2-space-w4-l3`) | apply | Mixed same and different review. | I can compare two shapes by their features. | same-feature, what-different, compare-challenge |

**Vocabulary:** compare, same, different, feature, side

**Common misconceptions**

- Two different shapes cannot share a feature.
- Comparing only means finding differences.

**Weekly quiz:** `y2-space-w4-quiz` - Comparing two shapes by same and different features. (15 questions; implemented)

#### Week 5: Star Maps

**Central concept:** Read a two-dimensional map both ways: find a named place, and name the place at a spot.
**Curriculum alignment:** AC9M2SP02
**Practised skills:** `space-l2-map-reading`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Find the Place (`y2-space-w5-l1`) | build | Read a name and tap that place on the map. | I can find a named place on the star map. | find-a-place, what-is-here, map-reading-challenge |
| 2. What Is Here? (`y2-space-w5-l2`) | develop | Name the place at a marked spot. | I can name the place at a marked spot. | find-a-place, what-is-here, map-reading-challenge |
| 3. Map Reading Challenge (`y2-space-w5-l3`) | apply | Find places and name spots on your own. | I can find places and name spots on my own. | find-a-place, what-is-here, map-reading-challenge |

**Vocabulary:** map, place, find, label, above

**Common misconceptions**

- A map shows things from the side.
- Places have no fixed position on a map.

**Weekly quiz:** `y2-space-w5-quiz` - Reading a two-dimensional map: locating named places and naming marked spots. (15 questions; implemented)

#### Week 6: Positions on a Map

**Central concept:** Describe how places sit next to, above and below each other, then combine clues to pin down one place.
**Curriculum alignment:** AC9M2SP02
**Practised skills:** `space-l2-positions`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Next To and Beside (`y2-space-w6-l1`) | build | Find the place to the left or right of another. | I can find the place next to another, left or right. | next-to, above-below, position-detective |
| 2. Above and Below (`y2-space-w6-l2`) | develop | Find the place above or below another. | I can find the place above or below another. | next-to, above-below, position-detective |
| 3. Position Detective (`y2-space-w6-l3`) | apply | Combine two clues to find the one place that fits both. | I can combine two clues to find one place. | next-to, above-below, position-detective |

**Vocabulary:** position, next to, above, below, clue

**Common misconceptions**

- Position words need no reference place.
- One clue is always enough to find a place.

**Weekly quiz:** `y2-space-w6-quiz` - Describing positions and combining position clues to locate a place on a map. (15 questions; implemented)

#### Week 7: Pathways on a Map

**Central concept:** Follow a route, plan a route that obeys mission rules, then test a route and fix the broken step.
**Curriculum alignment:** AC9M2SP02
**Practised skills:** `space-l2-navigation`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Follow the Path (`y2-space-w7-l1`) | build | Follow directions to a place. | I can follow a path to a place on the map. | follow-path, plan-a-mission, test-and-fix |
| 2. Plan a Mission (`y2-space-w7-l2`) | develop | Plan a route that visits a checkpoint and dodges hazards. | I can plan a route that visits a checkpoint and avoids hazards. | follow-path, plan-a-mission, test-and-fix |
| 3. Test and Fix (`y2-space-w7-l3`) | apply | Find the step that breaks a route and fix it. | I can test a route and fix the step that breaks it. | follow-path, plan-a-mission, test-and-fix |

**Vocabulary:** path, route, plan, mission, fix

**Common misconceptions**

- Any path reaches any place.
- A route needs no order.

**Weekly quiz:** `y2-space-w7-quiz` - Following, planning under rules, and debugging ordered routes on a map. (15 questions; implemented)

#### Week 8: Master Mapper

**Central concept:** Combine shapes, maps and pathways.
**Curriculum alignment:** AC9M2SP01, AC9M2SP02
**Practised skills:** `space-l2-master-mapper`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Shape and Map (`y2-space-w8-l1`) | build | Combine shape features and map reading. | I can use shape and map skills together. | shape-and-map, pathway-master, master-mission |
| 2. Pathway Master (`y2-space-w8-l2`) | develop | Follow and give pathways. | I can read, follow and give pathways. | shape-and-map, pathway-master, master-mission |
| 3. Master Mission (`y2-space-w8-l3`) | apply | Complete the final Space Mapper mission. | I can combine shapes, maps and pathways. | shape-and-map, pathway-master, master-mission |

**Vocabulary:** shape, map, pathway, position, mission

**Common misconceptions**

- Shapes and maps are unrelated.
- Only one route can solve a mission.

**Weekly quiz:** none. Week 8 Lesson 3 unlocks `y2-space-post-01`.

## Starpath Level 3: Cosmic Navigator

**Canonical level:** `level-3`
**Program ID:** `y3-space`
**Status:** implemented

Students become Cosmic Navigators — making, comparing and classifying 3D objects, then moving from following maps to creating and navigating them.

### Curriculum Alignment

- **AC9M3SP01:** Make, compare and classify objects, identifying key features and explaining why those features make them suited to their uses.
- **AC9M3SP02:** Interpret and create two-dimensional representations of familiar environments, locating key landmarks and objects relative to each other.

**Achievement-standard connection:** Students make and compare objects using key features and interpret and create two-dimensional representations of familiar environments.

**Prerequisite knowledge**

- Recognise and compare familiar shapes by their features.
- Read a simple map and follow pathways.

**Likely level misconceptions**

- Objects with the same use must have the same form.
- A place can go anywhere on a map.
- Any path is as good as any other.

**Progression rationale:** Students make, compare and classify 3D objects using faces, surfaces, edges and vertices, then explain how features suit a purpose. They then move from interpreting maps to creating and navigating their own. Composite objects and multiple object views are reserved for Level 4.

### Assessment Metadata

- Pre-test: `y3-space-pre-01` (20 questions; planned)
- Post-test: `y3-space-post-01` (20 questions; unlocks after `y3-space-w8-l3`; implemented)

### Skill Taxonomy

| Skill ID | Student name | Teacher description | Week | Category | Prerequisites |
| --- | --- | --- | ---: | --- | --- |
| `space-l3-object-recognition` | Recognise 3D objects | Recognises cubes, spheres, cylinders, cones, rectangular prisms and pyramids using faces, surfaces, edges and vertices. | 1 | shape-and-object-reasoning | `space-l2-compare` |
| `space-l3-object-features` | Compare 3D objects | Compares and classifies 3D objects using the number and type of faces or surfaces, edges and vertices. | 2 | shape-and-object-reasoning | `space-l3-object-recognition` |
| `space-l3-object-design` | Build and choose objects for a purpose | Constructs models from familiar objects, chooses features suited to a stated purpose and explains why they are suitable. | 3 | construction-and-visualisation | `space-l3-object-features` |
| `space-l3-map-reading` | Read a space map | Interprets a two-dimensional map using a key, symbols and the relative positions of landmarks. | 4 | spatial-representation | `space-l2-navigation` |
| `space-l3-map-creation` | Create a space map | Creates a two-dimensional map by placing landmarks in correct positions relative to each other. | 5 | spatial-representation | `space-l3-map-reading` |
| `space-l3-navigation` | Navigate by landmarks | Uses landmarks on a map to follow directions, plan routes and complete navigation missions. | 6 | position-and-navigation | `space-l3-map-creation` |
| `space-l3-missions` | Complete cosmic missions | Combines object knowledge, map reading and navigation to complete multi-step explorer missions. | 7 | position-and-navigation | `space-l3-object-design`, `space-l3-navigation` |
| `space-l3-cosmic-navigator` | Become a Cosmic Navigator | Integrates object reasoning, map creation and navigation to complete a cumulative graduation mission. | 8 | spatial-representation | `space-l3-missions` |

### Eight-Week Sequence

#### Week 1: 3D Discoveries

**Central concept:** Recognise common three-dimensional objects and identify their key features.
**Curriculum alignment:** AC9M3SP01
**Practised skills:** `space-l3-object-recognition`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Meet the Space Objects (`y3-space-w1-l1`) | build | Recognise and name six 3D objects. | I can name six familiar 3D objects. | meet-the-objects, find-the-object, object-challenge |
| 2. Objects at Work (`y3-space-w1-l2`) | develop | Connect familiar objects with their geometric form. | I can find a named 3D object in a scene. | meet-the-objects, find-the-object, object-challenge |
| 3. 3D Object Challenge (`y3-space-w1-l3`) | apply | Use key feature clues to recognise objects independently. | I can identify objects using faces, surfaces, edges and vertices. | meet-the-objects, find-the-object, object-challenge |

**Vocabulary:** 3D object, face, curved surface, edge, vertex, pyramid

**Common misconceptions**

- Curved surfaces are flat faces.
- Every 3D object has vertices.

**Weekly quiz:** `y3-space-w1-quiz` - Recognition progressing from names and context to precise feature clues. (15 questions; implemented)

#### Week 2: Object Detectives

**Central concept:** Compare and classify 3D objects using key features.
**Curriculum alignment:** AC9M3SP01
**Practised skills:** `space-l3-object-features`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Which Object Is It? (`y3-space-w2-l1`) | build | Identify an object from precise feature clues. | I can identify an object from a precise feature clue. | which-object, compare-objects, object-sort |
| 2. Compare Space Objects (`y3-space-w2-l2`) | develop | Compare faces, surfaces, edges and vertices. | I can compare objects using their key features. | which-object, compare-objects, object-sort |
| 3. Space Object Sort (`y3-space-w2-l3`) | apply | Classify a complete set using one feature rule. | I can classify objects using one feature rule. | which-object, compare-objects, object-sort |

**Vocabulary:** face, surface, edge, vertex, classify

**Common misconceptions**

- A curved surface is a face.
- Objects in one group must look identical.

**Weekly quiz:** `y3-space-w2-quiz` - Comparing and classifying objects by precise geometric features. (15 questions; implemented)

#### Week 3: Building Starpath

**Central concept:** Construct models, choose objects whose features suit a purpose, and explain why.
**Curriculum alignment:** AC9M3SP01
**Practised skills:** `space-l3-object-design`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Build Starpath Models (`y3-space-w3-l1`) | build | Construct complete models from several 3D objects. | I can choose the right object for each part. | build-the-rover, choose-best-shape, space-engineering |
| 2. Choose the Best Shape (`y3-space-w3-l2`) | develop | Decode a design requirement and choose the object whose features fit. | I can choose the best object for a job and say why. | build-the-rover, choose-best-shape, space-engineering |
| 3. Space Engineering (`y3-space-w3-l3`) | apply | Justify design choices using feature-to-purpose reasons. | I can choose and justify objects for a design. | build-the-rover, choose-best-shape, space-engineering |

**Vocabulary:** purpose, suitable, because, stable, construct

**Common misconceptions**

- The best-looking object is the best.
- Anything that rolls makes a useful wheel.

**Weekly quiz:** `y3-space-w3-quiz` - Construction, requirement decoding and explicit feature-to-purpose justification. (15 questions; implemented)

#### Week 4: Reading Space Maps

**Central concept:** Interpret a top-view map using its symbols, key and landmarks.
**Curriculum alignment:** AC9M3SP02
**Practised skills:** `space-l3-map-reading`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Map Symbols (`y3-space-w4-l1`) | build | Read what a symbol stands for using the key. | I can use a key to explain what map symbols mean. | map-symbols, find-landmark, map-explorer |
| 2. Explorer's View (`y3-space-w4-l2`) | develop | Read directions from the explorer's point of view. | I can locate landmarks and describe what is near them. | map-symbols, find-landmark, map-explorer |
| 3. Map Explorer (`y3-space-w4-l3`) | apply | Read a map to answer questions about places. | I can interpret a map using symbols, positions and clues. | map-symbols, find-landmark, map-explorer |

**Vocabulary:** map, key, symbol, landmark, relative

**Common misconceptions**

- A map shows things from the side.
- A symbol means whatever it looks like.

**Weekly quiz:** `y3-space-w4-quiz` - Interpreting map symbols, keys and relative landmark positions. (15 questions; implemented)

#### Week 5: Creating Maps

**Central concept:** Create a top-view map by placing landmarks in the right positions.
**Curriculum alignment:** AC9M3SP02
**Practised skills:** `space-l3-map-creation`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Draw My Space Camp (`y3-space-w5-l1`) | build | Place landmarks to make a simple map. | I can place landmarks to show a described layout. | draw-camp, place-landmarks, map-builder |
| 2. Place the Landmarks (`y3-space-w5-l2`) | develop | Place landmarks relative to each other. | I can create a map from relative position clues. | draw-camp, place-landmarks, map-builder |
| 3. Map Builder (`y3-space-w5-l3`) | apply | Build a complete map others could read. | I can build a readable map that meets every condition. | draw-camp, place-landmarks, map-builder |

**Vocabulary:** create, place, position, relative, accurate

**Common misconceptions**

- A place can go anywhere on a map.
- A map only needs to make sense to me.

**Weekly quiz:** `y3-space-w5-quiz` - Creating a two-dimensional map with correct relative positions. (15 questions; implemented)

#### Week 6: Landmark Navigation

**Central concept:** Use a map and its landmarks to navigate to places.
**Curriculum alignment:** AC9M3SP02
**Practised skills:** `space-l3-navigation`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Which Way Now? (`y3-space-w6-l1`) | build | Track the rover's heading through turns. | I can follow a route between landmarks. | treasure-hunt, find-observatory, mission-control |
| 2. First Move (`y3-space-w6-l2`) | develop | Choose the first steer toward a landmark. | I can plan a route to a named landmark. | treasure-hunt, find-observatory, mission-control |
| 3. Drive the Rover (`y3-space-w6-l3`) | apply | Plan and drive a route by turning and moving forward. | I can locate, route and fix a navigation mission. | treasure-hunt, find-observatory, mission-control |

**Vocabulary:** heading, turn, forward, steer, route

**Common misconceptions**

- Left and right stay the same when the rover turns.
- Forward always goes the same way.

**Weekly quiz:** `y3-space-w6-quiz` - Steering a rover by its heading: turn left or right, then go forward to reach a landmark. (15 questions; implemented)

#### Week 7: Cosmic Missions

**Central concept:** Combine 3D-object reasoning with mapping and navigation.
**Curriculum alignment:** AC9M3SP01, AC9M3SP02
**Practised skills:** `space-l3-missions`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Explorer Challenge (`y3-space-w7-l1`) | build | Use object and map skills together. | I can choose an object and navigate to use it. | explorer-challenge, rescue-mission, navigator-challenge |
| 2. Rescue Mission (`y3-space-w7-l2`) | develop | Plan a mission using objects and a map. | I can choose equipment and plan a rescue route. | explorer-challenge, rescue-mission, navigator-challenge |
| 3. Navigator Challenge (`y3-space-w7-l3`) | apply | Complete a full explorer mission. | I can combine object, map and route reasoning. | explorer-challenge, rescue-mission, navigator-challenge |

**Vocabulary:** object, map, route, mission, plan

**Common misconceptions**

- Object skills and map skills are separate.
- One route always fits a mission.

**Weekly quiz:** `y3-space-w7-quiz` - Integrating object, map and navigation skills in missions. (15 questions; implemented)

#### Week 8: Cosmic Navigator Graduation

**Central concept:** Demonstrate mastery across both descriptors.
**Curriculum alignment:** AC9M3SP01, AC9M3SP02
**Practised skills:** `space-l3-cosmic-navigator`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. 3D Objects Review (`y3-space-w8-l1`) | build | Recognise, compare and choose objects. | I can recognise, classify, build and choose 3D objects. | objects-review, map-master, final-mission |
| 2. Map Master Challenge (`y3-space-w8-l2`) | develop | Read, create and navigate maps. | I can read, create and navigate maps. | objects-review, map-master, final-mission |
| 3. Final Navigation Mission (`y3-space-w8-l3`) | apply | Put every skill together. | I can complete a full Cosmic Navigator mission. | objects-review, map-master, final-mission |

**Vocabulary:** object, map, navigate, mission, master

**Common misconceptions**

- Objects and maps are unrelated.
- Only one route can solve a mission.

**Weekly quiz:** none. Week 8 Lesson 3 unlocks `y3-space-post-01`.

## Starpath Level 4: Composite Worlds and Symmetry Systems

**Canonical level:** `level-4`
**Program ID:** `y4-space`
**Status:** implemented

Students represent composite shapes and objects, create and interpret grid references, and reason about line and rotational symmetry.

### Curriculum Alignment

- **AC9M4SP01:** Represent and approximate composite shapes and objects using combinations of familiar shapes and objects.
- **AC9M4SP02:** Create and interpret grid reference systems, using grid references and directions to locate and describe positions and pathways.
- **AC9M4SP03:** Recognise line and rotational symmetry in shapes and create symmetrical patterns and pictures.

**Achievement-standard connection:** Students create and interpret grid references and identify line and rotational symmetry while representing composite shapes and objects.

**Prerequisite knowledge**

- Construct and compare three-dimensional objects.
- Interpret and create familiar maps.

**Likely level misconceptions**

- Composite figures have one decomposition.
- Grid references identify lines rather than cells.
- Rotational symmetry means any rotation.

**Progression rationale:** Construction becomes representational and approximate, maps become indexed grid systems, and visual invariance is formalised through two forms of symmetry.

### Assessment Metadata

- Pre-test: `y4-space-pre-01` (20 questions; implemented)
- Post-test: `y4-space-post-01` (20 questions; unlocks after `y4-space-w8-l3`; implemented)

### Skill Taxonomy

| Skill ID | Student name | Teacher description | Week | Category | Prerequisites |
| --- | --- | --- | ---: | --- | --- |
| `space-l4-composite-shapes` | Build composite shapes | Represents composite shapes using combinations of familiar shapes and compares decompositions. | 1 | construction-and-visualisation | `space-l2-multi-feature-classification` |
| `space-l4-composite-objects` | Represent composite objects | Builds and represents composite objects from familiar solids, including partially hidden components. | 2 | construction-and-visualisation | `space-l3-spatial-construction`, `space-l3-object-views` |
| `space-l4-spatial-approximation` | Approximate a complex form | Selects and combines familiar shapes or objects to make a useful approximation and explains limitations. | 3 | spatial-representation | `space-l4-composite-shapes`, `space-l4-composite-objects` |
| `space-l4-grid-references` | Use grid references | Creates and interprets a consistent labelled grid system to identify cells and features. | 4 | position-and-navigation | `space-l3-map-interpretation` |
| `space-l4-grid-navigation` | Navigate a grid | Uses references and directional sequences to locate, trace and compare pathways on a grid. | 5 | position-and-navigation | `space-l4-grid-references` |
| `space-l4-line-symmetry` | Find line symmetry | Identifies lines of symmetry and completes figures by matching corresponding positions and features. | 6 | symmetry-and-transformation | `space-l2-one-step-transformations` |
| `space-l4-rotational-symmetry` | Find rotational symmetry | Recognises rotational symmetry and describes matching positions within one full turn. | 7 | symmetry-and-transformation | `space-l4-line-symmetry` |
| `space-l4-symmetric-grid-design` | Design a symmetric grid world | Uses composite forms, grid references and symmetry constraints to create and explain a spatial design. | 8 | construction-and-visualisation | `space-l4-spatial-approximation`, `space-l4-grid-navigation`, `space-l4-rotational-symmetry` |

### Eight-Week Sequence

#### Week 1: Composite Shapes

**Central concept:** Compose, decompose and represent complex two-dimensional shapes.
**Curriculum alignment:** AC9M4SP01
**Practised skills:** `space-l4-composite-shapes`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Shapes Within Shapes (`y4-space-w1-l1`) | build | Identify familiar components in a composite. | I can identify useful familiar components in a composite shape. | analyse-components, open-composite-canvas, compare-decompositions |
| 2. Build the Outline (`y4-space-w1-l2`) | develop | Compose a target using selected shapes. | I can choose and arrange components to construct a target outline. | analyse-components, open-composite-canvas, compare-decompositions |
| 3. Different Builds, Same Shape (`y4-space-w1-l3`) | apply | Create and compare different representations of the same composite. | I can create different valid decompositions of the same shape. | analyse-components, open-composite-canvas, compare-decompositions |

**Vocabulary:** composite, component, outline, overlap, represent

**Common misconceptions**

- Components cannot overlap.
- A composite has one exact decomposition.

**Weekly quiz:** `y4-space-w1-quiz` - Composite construction and equivalent representations. (15 questions; implemented)

#### Week 2: Composite Objects

**Central concept:** Represent three-dimensional objects with combinations and simple views.
**Curriculum alignment:** AC9M4SP01
**Practised skills:** `space-l4-composite-objects`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Combine the Solids (`y4-space-w2-l1`) | build | Construct an object from specified components. | I can combine familiar solids to meet a design brief. | solid-assembly, multi-view-build, hidden-structure |
| 2. Build from a View (`y4-space-w2-l2`) | develop | Connect a composite object with front, side and top views. | I can build a composite object from more than one view. | solid-assembly, multi-view-build, hidden-structure |
| 3. Hidden Structure (`y4-space-w2-l3`) | apply | Infer components needed to support a visible structure. | I can infer hidden components using views and support rules. | solid-assembly, multi-view-build, hidden-structure |

**Vocabulary:** solid, layer, view, hidden, support

**Common misconceptions**

- Only visible components exist.
- A single view uniquely determines every object.

**Weekly quiz:** `y4-space-w2-quiz` - Composite objects, views and hidden structure. (15 questions; implemented)

#### Week 3: Approximate and Represent

**Central concept:** Choose familiar components to approximate real forms.
**Curriculum alignment:** AC9M4SP01
**Practised skills:** `space-l4-spatial-approximation`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Simplify the Form (`y4-space-w3-l1`) | build | Identify useful familiar components in a complex object. | I can preserve defining features when I simplify a form. | feature-simplifier, model-builder, model-evaluator |
| 2. Create the Model (`y4-space-w3-l2`) | develop | Build a representation that preserves key spatial features. | I can construct a useful approximation from a brief. | feature-simplifier, model-builder, model-evaluator |
| 3. Evaluate the Representation (`y4-space-w3-l3`) | apply | Judge and improve what an approximation communicates. | I can evaluate and improve a representation using spatial evidence. | feature-simplifier, model-builder, model-evaluator |

**Vocabulary:** approximate, model, feature, accurate, limitation

**Common misconceptions**

- Approximate means careless or incorrect.
- A more detailed model is always more useful.

**Weekly quiz:** `y4-space-w3-quiz` - Purposeful approximation and model evaluation. (15 questions; implemented)

#### Week 4: Grid Reference Systems

**Central concept:** Understand and create labelled grid reference systems.
**Curriculum alignment:** AC9M4SP02
**Practised skills:** `space-l4-grid-references`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Read the Grid (`y4-space-w4-l1`) | build | Use row and column labels in the agreed order. | I can read a grid reference in both directions. | read-grid, locate-feature, build-grid-system |
| 2. Locate the Feature (`y4-space-w4-l2`) | develop | Assign and interpret grid references. | I can use grid references to find, report and place map features. | read-grid, locate-feature, build-grid-system |
| 3. Build a Grid Key (`y4-space-w4-l3`) | apply | Create a consistent reference system for a map. | I can create and repair a consistent grid reference system. | read-grid, locate-feature, build-grid-system |

**Vocabulary:** grid, row, column, reference, cell

**Common misconceptions**

- Row and column order can change mid-map.
- A reference names a grid line rather than a cell.

**Weekly quiz:** `y4-space-w4-quiz` - Grid conventions and precise location. (15 questions; implemented)

#### Week 5: Pathways on Grids

**Central concept:** Describe and compare routes using grids, references and directions.
**Curriculum alignment:** AC9M4SP02
**Practised skills:** `space-l4-grid-navigation`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Reference to Reference (`y4-space-w5-l1`) | build | Trace a route between labelled cells. | I can trace movement between referenced cells. | trace-references, author-route, route-audit |
| 2. Write the Path (`y4-space-w5-l2`) | develop | Create directions using references and movement language. | I can author precise grid-referenced directions. | trace-references, author-route, route-audit |
| 3. Route Under Constraints (`y4-space-w5-l3`) | apply | Compare pathways that satisfy spatial constraints. | I can test and improve routes against constraints. | trace-references, author-route, route-audit |

**Vocabulary:** pathway, reference, direction, route, constraint

**Common misconceptions**

- A sequence of references automatically describes the moves between them.
- The fewest cells is always the best route.

**Weekly quiz:** `y4-space-w5-quiz` - Grid pathways, directions and route constraints. (15 questions; implemented)

#### Week 6: Line Symmetry

**Central concept:** Recognise and construct line-symmetric figures.
**Curriculum alignment:** AC9M4SP03
**Practised skills:** `space-l4-line-symmetry`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Mirror Match (`y4-space-w6-l1`) | build | Test whether two halves correspond across a line. | I can test corresponding features across a line of symmetry. | line-test, reflection-builder, line-design |
| 2. Complete the Reflection (`y4-space-w6-l2`) | develop | Construct the missing half on a grid. | I can complete vertical, horizontal and diagonal reflections. | line-test, reflection-builder, line-design |
| 3. Create a Symmetric Picture (`y4-space-w6-l3`) | apply | Create and audit an original line-symmetric design. | I can create and test an original line-symmetric picture. | line-test, reflection-builder, line-design |

**Vocabulary:** symmetry, line of symmetry, mirror, corresponding, equal distance

**Common misconceptions**

- Any line through the centre is a symmetry line.
- Matching colour alone proves symmetry.

**Weekly quiz:** `y4-space-w6-quiz` - Line symmetry, corresponding points and construction. (15 questions; implemented)

#### Week 7: Rotational Symmetry

**Central concept:** Recognise and create figures that match after rotation.
**Curriculum alignment:** AC9M4SP03
**Practised skills:** `space-l4-rotational-symmetry`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Turn and Test (`y4-space-w7-l1`) | build | Test a figure at marked rotations. | I can test a design after a stated rotation about a centre. | turn-test, turn-recorder, rotation-builder |
| 2. Record the Matches (`y4-space-w7-l2`) | develop | Test and record matching positions in a full turn. | I can test and record which rotations reproduce a design. | turn-test, turn-recorder, rotation-builder |
| 3. Create a Turning Pattern (`y4-space-w7-l3`) | apply | Construct and justify a rotationally symmetric design. | I can create, test and repair a rotationally symmetric pattern. | turn-test, turn-recorder, rotation-builder |

**Vocabulary:** rotational symmetry, centre, full turn, match, order

**Common misconceptions**

- A full turn is the only matching turn.
- Line symmetry guarantees rotational symmetry.

**Weekly quiz:** `y4-space-w7-quiz` - Rotational invariance and pattern construction. (15 questions; implemented)

#### Week 8: Symmetric Grid World

**Central concept:** Integrate composite representation, grids and symmetry.
**Curriculum alignment:** AC9M4SP01, AC9M4SP02, AC9M4SP03
**Practised skills:** `space-l4-symmetric-grid-design`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Decode the Design Brief (`y4-space-w8-l1`) | build | Identify composite, grid and symmetry constraints. | I can translate an integrated design brief into testable constraints. | decode-brief, build-world, audit-world |
| 2. Build the World (`y4-space-w8-l2`) | develop | Construct a referenced symmetrical grid design. | I can build a connected composite, grid and symmetry world. | decode-brief, build-world, audit-world |
| 3. Audit and Explain (`y4-space-w8-l3`) | apply | Check constraints and justify representational choices. | I can audit and repair a complete spatial design. | decode-brief, build-world, audit-world |

**Vocabulary:** composite, grid reference, symmetry, constraint, justify

**Common misconceptions**

- Meeting one constraint compensates for missing another.
- Visual balance always proves mathematical symmetry.

**Weekly quiz:** none. Week 8 Lesson 3 unlocks `y4-space-post-01`.

## Starpath Level 5: Nets, Coordinates and Transformations

**Canonical level:** `level-5`
**Program ID:** `y5-space`
**Status:** implemented

Students connect objects and nets, use grid coordinates, perform transformations and develop shape-classification algorithms.

### Curriculum Alignment

- **AC9M5SP01:** Connect objects to their nets and build objects from their nets using spatial and geometric reasoning.
- **AC9M5SP02:** Construct a grid coordinate system that uses coordinates to locate positions within a space; use coordinates and directional language to describe position and movement.
- **AC9M5SP03:** Describe and perform translations, reflections and rotations of shapes, using dynamic geometric software where appropriate; recognise what changes and what remains the same, and identify any symmetries.

**Achievement-standard connection:** Students connect objects with nets, use coordinates to locate and move, perform transformations and apply algorithms to classify shapes and objects.

**Prerequisite knowledge**

- Represent composite objects and views.
- Use labelled grids.
- Recognise line and rotational symmetry.

**Likely level misconceptions**

- Any arrangement of faces forms a valid net.
- Coordinates can be read in either order.
- Transformations change side lengths or angles.

**Progression rationale:** Students coordinate multiple representations of objects, formalise location with ordered coordinates, analyse transformations through invariants, and express classification reasoning algorithmically.

### Assessment Metadata

- Pre-test: `y5-space-pre-01` (20 questions; implemented)
- Post-test: `y5-space-post-01` (20 questions; unlocks after `y5-space-w8-l3`; implemented)

### Skill Taxonomy

| Skill ID | Student name | Teacher description | Week | Category | Prerequisites |
| --- | --- | --- | ---: | --- | --- |
| `space-l5-object-net-connections` | Connect objects and nets | Matches objects to possible nets by tracking faces, adjacency and folding relationships. | 1 | construction-and-visualisation | `space-l4-composite-objects` |
| `space-l5-net-construction` | Fold nets into objects | Uses spatial visualisation to construct objects from nets and identify face relationships. | 2 | construction-and-visualisation | `space-l5-object-net-connections` |
| `space-l5-net-design` | Design a valid net | Creates and tests nets, revising layouts using overlap and adjacency evidence. | 3 | construction-and-visualisation | `space-l5-net-construction` |
| `space-l5-grid-coordinates` | Use grid coordinates | Constructs axes and locates positions using consistently ordered coordinate pairs. | 4 | position-and-navigation | `space-l4-grid-references` |
| `space-l5-coordinate-navigation` | Navigate with coordinates | Uses coordinate changes and directional language to describe and plan movement on a grid. | 5 | position-and-navigation | `space-l5-grid-coordinates` |
| `space-l5-translations` | Translate a shape | Performs translations and describes movement while recognising invariant lengths, angles and orientation. | 6 | symmetry-and-transformation | `space-l5-coordinate-navigation` |
| `space-l5-reflections-rotations` | Reflect and rotate shapes | Performs reflections and rotations and explains invariant size, shape and corresponding distances. | 7 | symmetry-and-transformation | `space-l4-line-symmetry`, `space-l4-rotational-symmetry` |
| `space-l5-spatial-design` | Complete a spatial design | Integrates net visualisation, coordinate movement and transformations to create and justify a spatial design. | 8 | construction-and-visualisation | `space-l5-net-design`, `space-l5-coordinate-navigation`, `space-l5-reflections-rotations` |

### Eight-Week Sequence

#### Week 1: Objects and Nets

**Central concept:** Connect faces of objects with two-dimensional net layouts.
**Curriculum alignment:** AC9M5SP01
**Practised skills:** `space-l5-object-net-connections`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Unfold the Object (`y5-space-w1-l1`) | build | Relate object faces to a flattened arrangement. | I can fold a net and name the 3D solid it makes. | net-unfolder, fold-predictor, net-reasoning |
| 2. Which Net Folds? (`y5-space-w1-l2`) | develop | Predict whether a candidate net forms the target object. | I can predict whether a net folds into a cube. | net-unfolder, fold-predictor, net-reasoning |
| 3. Explain the Match (`y5-space-w1-l3`) | apply | Use face and adjacency evidence to justify a net. | I can explain why a net folds into a cube. | net-unfolder, fold-predictor, net-reasoning |

**Vocabulary:** net, face, fold, edge, adjacent

**Common misconceptions**

- The same number of faces guarantees a valid net.
- Faces that touch in a net always touch after folding.

**Weekly quiz:** `y5-space-w1-quiz` - Object-net correspondence and folding prediction. (15 questions; implemented)

#### Week 2: Construct from Nets

**Central concept:** Mentally and virtually fold nets to construct objects.
**Curriculum alignment:** AC9M5SP01
**Practised skills:** `space-l5-net-construction`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Parts of a Solid (`y5-space-w2-l1`) | build | Break a net into its faces and count them across different solids. | I can break a solid's net into its faces and count them. | face-tracker, fold-simulator, face-relations |
| 2. Track a Face (`y5-space-w2-l2`) | develop | Follow one labelled face through a virtual fold. | I can track a face through a fold and find its opposite. | face-tracker, fold-simulator, face-relations |
| 3. Opposite and Adjacent (`y5-space-w2-l3`) | apply | Determine face relationships after construction. | I can tell whether two faces end up opposite or adjacent. | face-tracker, fold-simulator, face-relations |

**Vocabulary:** fold, adjacent, opposite, orientation, construct

**Common misconceptions**

- A face keeps the same screen orientation after folding.
- Opposite faces are opposite in the flat net.

**Weekly quiz:** `y5-space-w2-quiz` - Mental folding and face relationships. (15 questions; implemented)

#### Week 3: Create and Test Nets

**Central concept:** Design, test and refine nets for familiar objects.
**Curriculum alignment:** AC9M5SP01
**Practised skills:** `space-l5-net-design`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Name the Solid (`y5-space-w3-l1`) | build | Fold different nets and name the 3D solid each makes. | I can fold different nets and name each 3D solid. | net-builder, fold-fault-finder, net-comparer |
| 2. Arrange the Faces (`y5-space-w3-l2`) | develop | Build a candidate net from required faces. | I can build a net that folds into a cube. | net-builder, fold-fault-finder, net-comparer |
| 3. Test the Fold (`y5-space-w3-l3`) | apply | Identify overlap, gaps or incorrect adjacency. | I can test a net for overlaps and gaps. | net-builder, fold-fault-finder, net-comparer |

**Vocabulary:** layout, overlap, gap, valid, revise

**Common misconceptions**

- Each object has one net.
- A connected arrangement always folds without overlap.

**Weekly quiz:** `y5-space-w3-quiz` - Net creation, validation and multiple solutions. (15 questions; implemented)

#### Week 4: Coordinate Systems

**Central concept:** Construct and interpret ordered grid coordinate systems.
**Curriculum alignment:** AC9M5SP02
**Practised skills:** `space-l5-grid-coordinates`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Build the Axes (`y5-space-w4-l1`) | build | Establish origin, axes, scale and coordinate order. | I can set up axes and read a coordinate across then up. | coordinate-system-builder, coordinate-plotter, coordinate-debugger |
| 2. Plot and Read (`y5-space-w4-l2`) | develop | Locate and identify positions from ordered pairs. | I can plot points and read their coordinates. | coordinate-system-builder, coordinate-plotter, coordinate-debugger |
| 3. Find the Coordinate Error (`y5-space-w4-l3`) | apply | Diagnose swapped or mis-scaled coordinates. | I can find and fix a swapped or mis-scaled coordinate. | coordinate-system-builder, coordinate-plotter, coordinate-debugger |

**Vocabulary:** coordinate, ordered pair, origin, axis, scale

**Common misconceptions**

- Coordinate order is interchangeable.
- Axes can use inconsistent intervals.

**Weekly quiz:** `y5-space-w4-quiz` - Coordinate conventions, plotting and error analysis. (15 questions; implemented)

#### Week 5: Coordinate Movement

**Central concept:** Describe and calculate movement between coordinate positions.
**Curriculum alignment:** AC9M5SP02
**Practised skills:** `space-l5-coordinate-navigation`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Move Along an Axis (`y5-space-w5-l1`) | build | Relate horizontal and vertical moves to coordinate changes. | I can move along an axis and say which coordinate changed. | coordinate-mover, coordinate-command-runner, coordinate-route-planner |
| 2. Follow Coordinate Commands (`y5-space-w5-l2`) | develop | Apply an ordered sequence of position changes. | I can follow and build coordinate command sequences. | coordinate-mover, coordinate-command-runner, coordinate-route-planner |
| 3. Plan an Efficient Route (`y5-space-w5-l3`) | apply | Compare coordinate pathways under constraints. | I can plan the shortest valid route to a goal. | coordinate-mover, coordinate-command-runner, coordinate-route-planner |

**Vocabulary:** horizontal, vertical, increase, decrease, movement

**Common misconceptions**

- Both coordinates change for every move.
- Direction words can replace coordinate amounts.

**Weekly quiz:** `y5-space-w5-quiz` - Coordinate changes, movement sequences and route planning. (15 questions; implemented)

#### Week 6: Translations

**Central concept:** Describe and perform translations with invariant features.
**Curriculum alignment:** AC9M5SP03
**Practised skills:** `space-l5-translations`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Slide Every Point (`y5-space-w6-l1`) | build | Apply a common horizontal and vertical movement. | I can translate a figure so every point moves the same. | point-translation-simulator, translation-describer, transform-validator |
| 2. Describe the Translation (`y5-space-w6-l2`) | develop | Express movement using directional or coordinate language. | I can describe a translation using across-and-up movement. | point-translation-simulator, translation-describer, transform-validator |
| 3. Check the Image (`y5-space-w6-l3`) | apply | Use invariants to evaluate a claimed translation. | I can check an image against the invariants of a translation. | point-translation-simulator, translation-describer, transform-validator |

**Vocabulary:** translation, image, horizontal, vertical, invariant

**Common misconceptions**

- Different points can move different amounts.
- Translation changes orientation.

**Weekly quiz:** `y5-space-w6-quiz` - Translations, movement vectors and invariants. (15 questions; implemented)

#### Week 7: Reflections and Rotations

**Central concept:** Perform and compare reflections and rotations.
**Curriculum alignment:** AC9M5SP03
**Practised skills:** `space-l5-reflections-rotations`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Reflect Across a Line (`y5-space-w7-l1`) | build | Place corresponding points at equal perpendicular distances. | I can reflect a figure across a mirror line. | reflection-builder, rotation-simulator, transformation-classifier |
| 2. Rotate About a Point (`y5-space-w7-l2`) | develop | Turn a figure around a stated centre and amount. | I can rotate a figure about a centre by a stated turn. | reflection-builder, rotation-simulator, transformation-classifier |
| 3. Compare the Transformations (`y5-space-w7-l3`) | apply | Identify action, changes and invariants from image pairs. | I can identify a translation, reflection or rotation. | reflection-builder, rotation-simulator, transformation-classifier |

**Vocabulary:** reflection, rotation, line, centre, corresponding

**Common misconceptions**

- Reflection is a horizontal slide.
- Rotation can use any centre without changing the image position.

**Weekly quiz:** `y5-space-w7-quiz` - Reflections, rotations and transformation comparison. (15 questions; implemented)

#### Week 8: Spatial Design Challenge

**Central concept:** Integrate nets, coordinates and transformations in a reasoned design.
**Curriculum alignment:** AC9M5SP01, AC9M5SP02, AC9M5SP03
**Practised skills:** `space-l5-spatial-design`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Interpret the Brief (`y5-space-w8-l1`) | build | Connect net, coordinate and transformation constraints. | I can read a brief's object, location and movement constraints. | design-constraint-decoder, coordinate-transform-builder, spatial-design-auditor |
| 2. Build and Transform (`y5-space-w8-l2`) | develop | Create a valid object representation and position its transformed images. | I can build an object, place it and transform it together. | design-constraint-decoder, coordinate-transform-builder, spatial-design-auditor |
| 3. Test and Defend (`y5-space-w8-l3`) | apply | Check invariants and justify each spatial decision. | I can test and defend every part of a spatial design. | design-constraint-decoder, coordinate-transform-builder, spatial-design-auditor |

**Vocabulary:** net, coordinate, transformation, invariant, justify

**Common misconceptions**

- Each representation can be solved independently.
- A visually plausible design needs no spatial evidence.

**Weekly quiz:** none. Week 8 Lesson 3 unlocks `y5-space-post-01`.

## Starpath Level 6: Cross-sections, Cartesian Space and Tessellations

**Canonical level:** `level-6`
**Program ID:** `y6-space`
**Status:** implemented

Students reason about parallel cross-sections, four-quadrant coordinates and combined transformations used in tessellations and geometric investigations.

### Curriculum Alignment

- **AC9M6SP01:** Compare the parallel cross-sections of objects and recognise their relationships to right prisms.
- **AC9M6SP02:** Locate points in the four quadrants of a Cartesian plane; describe changes to the coordinates when a point is moved to a different position in the plane.
- **AC9M6SP03:** Recognise and use combinations of transformations to create tessellations and other geometric patterns, using dynamic geometric software where appropriate.

**Achievement-standard connection:** Students compare cross-sections of objects, use four-quadrant Cartesian coordinates and apply combinations of transformations to create and analyse geometric patterns.

**Prerequisite knowledge**

- Connect and construct objects from nets.
- Use ordered grid coordinates.
- Perform translations, reflections and rotations.

**Likely level misconceptions**

- All parallel cross-sections are congruent.
- Negative coordinates mean negative distance.
- Any repeated shape tessellates without gaps.

**Progression rationale:** Spatial visualisation moves inside objects through cross-sections, coordinate reasoning expands to four quadrants, and transformations combine into generative patterns and tested conjectures.

### Assessment Metadata

- Pre-test: `y6-space-pre-01` (20 questions; implemented)
- Post-test: `y6-space-post-01` (20 questions; unlocks after `y6-space-w8-l3`; implemented)

### Skill Taxonomy

| Skill ID | Student name | Teacher description | Week | Category | Prerequisites |
| --- | --- | --- | ---: | --- | --- |
| `space-l6-parallel-cross-sections` | Visualise cross-sections | Predicts and compares two-dimensional cross-sections formed by parallel planes through objects. | 1 | construction-and-visualisation | `space-l5-net-construction` |
| `space-l6-prism-cross-sections` | Connect prisms and cross-sections | Uses parallel cross-sections to identify prism relationships and explain when section size or shape changes. | 2 | shape-and-object-reasoning | `space-l6-parallel-cross-sections` |
| `space-l6-four-quadrant-coordinates` | Plot in four quadrants | Locates and interprets points with positive, negative and zero coordinates on a Cartesian plane. | 3 | position-and-navigation | `space-l5-grid-coordinates` |
| `space-l6-coordinate-change` | Reason about coordinate change | Predicts and explains how ordered pairs change under horizontal, vertical and combined movement. | 4 | position-and-navigation | `space-l6-four-quadrant-coordinates`, `space-l5-coordinate-navigation` |
| `space-l6-combined-transformations` | Combine transformations | Performs and describes ordered combinations of translations, reflections and rotations. | 5 | symmetry-and-transformation | `space-l5-translations`, `space-l5-reflections-rotations` |
| `space-l6-tessellations` | Create a tessellation | Uses repeated transformations to create and justify tessellations without gaps or overlaps. | 6 | symmetry-and-transformation | `space-l6-combined-transformations` |
| `space-l6-transformation-reasoning` | Investigate transformation patterns | Systematically varies transformation combinations and uses evidence to explain resulting geometric patterns. | 7 | symmetry-and-transformation | `space-l5-spatial-design`, `space-l6-combined-transformations` |
| `space-l6-spatial-investigation` | Complete a spatial investigation | Integrates object visualisation, Cartesian reasoning and transformation evidence to solve and communicate a complex spatial problem. | 8 | spatial-representation | `space-l6-prism-cross-sections`, `space-l6-coordinate-change`, `space-l6-tessellations`, `space-l6-transformation-reasoning` |

### Eight-Week Sequence

#### Week 1: Cross-section Foundations

**Central concept:** Visualise and compare cross-sections made by parallel cuts.
**Curriculum alignment:** AC9M6SP01
**Practised skills:** `space-l6-parallel-cross-sections`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Slice and See (`y6-space-w1-l1`) | build | Connect a cut direction and position with a cross-section. | I can slice an object and name its cross-section. | cross-section-slicer, slice-sequence-viewer, cross-section-predictor |
| 2. Parallel Slice Sequence (`y6-space-w1-l2`) | develop | Compare sections from several parallel cuts. | I can compare parallel slices and see whether they stay the same. | cross-section-slicer, slice-sequence-viewer, cross-section-predictor |
| 3. Predict Before Cutting (`y6-space-w1-l3`) | apply | Use object structure to justify a predicted section. | I can predict a cross-section from an object's base. | cross-section-slicer, slice-sequence-viewer, cross-section-predictor |

**Vocabulary:** cross-section, plane, parallel, slice, predict

**Common misconceptions**

- A cross-section is always the same shape as a face.
- Parallel cuts always produce congruent sections.

**Weekly quiz:** `y6-space-w1-quiz` - Cross-section visualisation and parallel-cut comparison. (15 questions; implemented)

#### Week 2: Prisms and Changing Sections

**Central concept:** Relate constant and changing parallel cross-sections to object structure.
**Curriculum alignment:** AC9M6SP01
**Practised skills:** `space-l6-prism-cross-sections`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Prism or Not? (`y6-space-w2-l1`) | build | Compare parallel sections to identify right-prism behaviour. | I can use cross-sections to decide whether an object is a prism. | section-prism-classifier, section-change-grapher, object-inference |
| 2. Constant or Changing (`y6-space-w2-l2`) | develop | Track how sections vary through different objects. | I can classify cross-sections as constant or shrinking. | section-prism-classifier, section-change-grapher, object-inference |
| 3. Explain the Structure (`y6-space-w2-l3`) | apply | Infer object properties from a section sequence. | I can explain an object's structure from its cross-sections. | section-prism-classifier, section-change-grapher, object-inference |

**Vocabulary:** prism, congruent, constant, vary, structure

**Common misconceptions**

- Every object with one polygonal section is a prism.
- All non-prism sections change in the same way.

**Weekly quiz:** `y6-space-w2-quiz` - Prism relationships and structural inference. (15 questions; implemented)

#### Week 3: Four-Quadrant Coordinates

**Central concept:** Locate and interpret ordered pairs across four quadrants.
**Curriculum alignment:** AC9M6SP02
**Practised skills:** `space-l6-four-quadrant-coordinates`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Extend the Axes (`y6-space-w3-l1`) | build | Connect signed values with direction from the origin. | I can plot and read points with negative coordinates. | four-quadrant-builder, cartesian-plotter, coordinate-deduction |
| 2. Plot Every Quadrant (`y6-space-w3-l2`) | develop | Locate ordered pairs across four quadrants and axes. | I can plot ordered pairs in all four quadrants. | four-quadrant-builder, cartesian-plotter, coordinate-deduction |
| 3. Coordinate Reasoning (`y6-space-w3-l3`) | apply | Infer signs and positions without plotting every point. | I can name a point's quadrant from the signs of its coordinates. | four-quadrant-builder, cartesian-plotter, coordinate-deduction |

**Vocabulary:** Cartesian plane, quadrant, positive, negative, origin

**Common misconceptions**

- A negative coordinate is an impossible distance.
- Points on axes belong to a quadrant.

**Weekly quiz:** `y6-space-w3-quiz` - Four-quadrant conventions, signs and plotting. (15 questions; implemented)

#### Week 4: Coordinate Change

**Central concept:** Describe movement and transformation through coordinate change.
**Curriculum alignment:** AC9M6SP02
**Practised skills:** `space-l6-coordinate-change`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Change One Coordinate (`y6-space-w4-l1`) | build | Relate axis-aligned movement to one changing value. | I can say which coordinate changes when a point moves along an axis. | coordinate-change-simulator, axis-crossing-runner, movement-rule-inference |
| 2. Cross the Axes (`y6-space-w4-l2`) | develop | Track signs and values through multi-quadrant movement. | I can move a point across an axis and flip a coordinate's sign. | coordinate-change-simulator, axis-crossing-runner, movement-rule-inference |
| 3. Reverse the Movement (`y6-space-w4-l3`) | apply | Infer a movement rule from original and image points. | I can describe the move that takes a point to its image. | coordinate-change-simulator, axis-crossing-runner, movement-rule-inference |

**Vocabulary:** change, difference, direction, sign, rule

**Common misconceptions**

- Crossing an axis swaps coordinate order.
- A negative change always ends at a negative coordinate.

**Weekly quiz:** `y6-space-w4-quiz` - Coordinate differences, axis crossing and inverse reasoning. (15 questions; implemented)

#### Week 5: Combined Transformations

**Central concept:** Compose transformations and track cumulative effects.
**Curriculum alignment:** AC9M6SP03
**Practised skills:** `space-l6-combined-transformations`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Transform in Order (`y6-space-w5-l1`) | build | Apply two transformations in a stated sequence. | I can apply two transformations in order and find the result. | transform-chain-runner, order-comparison-lab, transform-sequence-inference |
| 2. Does Order Matter? (`y6-space-w5-l2`) | develop | Compare reversed transformation sequences. | I can decide whether the order of two transformations changes the result. | transform-chain-runner, order-comparison-lab, transform-sequence-inference |
| 3. Find the Transformation Chain (`y6-space-w5-l3`) | apply | Infer a sequence from original and final figures. | I can work out the sequence of transformations from an image. | transform-chain-runner, order-comparison-lab, transform-sequence-inference |

**Vocabulary:** composition, sequence, original, image, equivalent

**Common misconceptions**

- Transformation order never matters.
- Only the final position identifies the full sequence.

**Weekly quiz:** `y6-space-w5-quiz` - Transformation composition, order and inverse inference. (15 questions; implemented)

#### Week 6: Tessellation Design

**Central concept:** Create and analyse patterns with no gaps or overlaps.
**Curriculum alignment:** AC9M6SP03
**Practised skills:** `space-l6-tessellations`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Will It Tessellate? (`y6-space-w6-l1`) | build | Test repeated shapes for gaps and overlaps. | I can decide whether a shape tessellates. | tessellation-tester, pattern-transform-builder, tessellation-reasoning |
| 2. Transformation Pattern (`y6-space-w6-l2`) | develop | Generate a tessellation using an explicit transformation rule. | I can name the transformation rule that makes a tessellation. | tessellation-tester, pattern-transform-builder, tessellation-reasoning |
| 3. Explain the Fit (`y6-space-w6-l3`) | apply | Use spatial relationships to justify a design. | I can explain why tiles fit using angles at a corner. | tessellation-tester, pattern-transform-builder, tessellation-reasoning |

**Vocabulary:** tessellation, repeat, gap, overlap, pattern

**Common misconceptions**

- Any repeated shape tessellates.
- Decorative patterns are automatically tessellations.

**Weekly quiz:** `y6-space-w6-quiz` - Tessellation conditions and transformation-generated patterns. (15 questions; implemented)

#### Week 7: Transformation Investigations

**Central concept:** Investigate how transformation combinations generate and alter geometric patterns.
**Curriculum alignment:** AC9M6SP03
**Practised skills:** `space-l6-transformation-reasoning`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Notice the Pattern Rule (`y6-space-w7-l1`) | build | Connect repeated images with a transformation sequence. | I can notice the transformation rule in a pattern. | pattern-rule-detector, transform-experiment-lab, pattern-evidence-reasoning |
| 2. Vary One Transformation (`y6-space-w7-l2`) | develop | Compare patterns after changing one part of the sequence. | I can predict how changing a transformation changes a pattern. | pattern-rule-detector, transform-experiment-lab, pattern-evidence-reasoning |
| 3. Explain with Evidence (`y6-space-w7-l3`) | apply | Use original and image relationships to justify a pattern rule. | I can justify a tessellation with evidence. | pattern-rule-detector, transform-experiment-lab, pattern-evidence-reasoning |

**Vocabulary:** sequence, combination, pattern, evidence, result

**Common misconceptions**

- The same transformations always produce the same result in any order.
- A visual pattern needs no stated transformation rule.

**Weekly quiz:** `y6-space-w7-quiz` - Transformation combinations, geometric patterns and evidence. (15 questions; implemented)

#### Week 8: Orbital Design Investigation

**Central concept:** Integrate cross-sections, coordinates and transformations in a spatial investigation.
**Curriculum alignment:** AC9M6SP01, AC9M6SP02, AC9M6SP03
**Practised skills:** `space-l6-spatial-investigation`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Analyse the System (`y6-space-w8-l1`) | build | Interpret sections, coordinates and pattern constraints. | I can interpret an object, a coordinate and a pattern together. | multi-representation-analyser, spatial-model-lab, evidence-presentation |
| 2. Build and Test (`y6-space-w8-l2`) | develop | Create a solution and test its transformation rules. | I can build a model across object, coordinate and transformation. | multi-representation-analyser, spatial-model-lab, evidence-presentation |
| 3. Defend the Model (`y6-space-w8-l3`) | apply | Use multiple representations and evidence to justify conclusions. | I can defend a spatial model with evidence from every strand. | multi-representation-analyser, spatial-model-lab, evidence-presentation |

**Vocabulary:** model, constraint, coordinate, cross-section, evidence

**Common misconceptions**

- Each representation can be interpreted independently.
- A visually plausible solution needs no mathematical evidence.

**Weekly quiz:** none. Week 8 Lesson 3 unlocks `y6-space-post-01`.
