# Starpath Curriculum Map

> Status: Planned for teacher review. This registry contains no playable lessons, quiz banks or assessment banks.

Starpath uses the canonical realm ID `space`. Every level has exactly 8 weeks and 3 lessons per week. Weeks 1-7 have a 15-question weekly quiz (5 questions per lesson); Week 8 has no quiz and unlocks the 20-question post-test after Lesson 3. Ground Level has no pre-test. Levels 1-6 use a 20-question pre-test.

## Pathway Rules

- 85-100%: level mastered; no required weeks.
- 50-84%: targeted pathway based on weak skill-to-week evidence.
- 0-49% or no pre-test result: full 8-week pathway.
- Starpath remains locked and non-persistent until dedicated `space` persistence and playable content exist.

## Curriculum Sources

- [Australian Curriculum v9 Mathematics: Space strand](https://v9.australiancurriculum.edu.au/curriculum-information/understand-this-learning-area/mathematics)
- [QCAA achievement standard and content description sequence](https://www.qcaa.qld.edu.au/downloads/aciqv9/mathematics/curriculum/ac9_maths_prep-yr10_as_cd_sequence_aspects.pdf)

## Starpath Ground Level: Shape and Space Explorers

**Canonical level:** `ground`
**Program ID:** `ground-space`
**Status:** planned

Students name, sort, create and find familiar shapes, then describe position and movement in familiar spaces.

### Curriculum Alignment

- **AC9MFSP01:** Sort, name and create familiar shapes; recognise and describe familiar shapes within objects in the environment, giving reasons.
- **AC9MFSP02:** Describe position and movement of self and objects in relation to other objects and locations within a familiar space.

**Achievement-standard connection:** Students describe familiar shapes and the position and location of themselves and objects relative to other objects and people in familiar spaces.

**Prerequisite knowledge**

- Everyday experience with objects, movement and simple location words.

**Likely level misconceptions**

- A shape changes name when rotated.
- Size or colour determines a shape.
- Position words have a fixed viewpoint.

**Progression rationale:** The sequence begins with concrete recognition and creation, then shifts to relational position and purposeful movement before combining both strands in a familiar-space mission.

### Assessment Metadata

- Pre-test: not required
- Post-test: `ground-space-post-01` (20 questions; unlocks after `ground-space-w8-l3`; planned)

### Skill Taxonomy

| Skill ID | Student name | Teacher description | Week | Category | Prerequisites |
| --- | --- | --- | ---: | --- | --- |
| `space-ground-shape-recognition` | Spot familiar shapes | Recognises and names familiar shapes despite changes in size, colour or orientation. | 1 | shape-and-object-reasoning | None |
| `space-ground-shape-sorting` | Sort shapes with a reason | Sorts familiar shapes by a chosen feature and explains the grouping rule. | 2 | shape-and-object-reasoning | `space-ground-shape-recognition` |
| `space-ground-shape-creation` | Make shapes | Creates familiar shapes and combines parts while retaining shape language. | 3 | construction-and-visualisation | `space-ground-shape-recognition` |
| `space-ground-shapes-in-objects` | Find shapes in objects | Identifies familiar shapes within environmental objects and gives a reason for the match. | 4 | spatial-representation | `space-ground-shape-recognition` |
| `space-ground-position-language` | Say where things are | Uses relational position words from a clear viewpoint. | 5 | position-and-navigation | None |
| `space-ground-location-relations` | Compare locations | Describes inside, outside, near and far relationships between objects and locations. | 6 | position-and-navigation | `space-ground-position-language` |
| `space-ground-movement-pathways` | Follow a path | Follows and communicates simple movement instructions in a familiar space. | 7 | position-and-navigation | `space-ground-location-relations` |
| `space-ground-spatial-mission` | Solve a shape and space mission | Integrates shape recognition, location language and movement to solve familiar spatial problems. | 8 | spatial-representation | `space-ground-shapes-in-objects`, `space-ground-movement-pathways` |

### Eight-Week Sequence

#### Week 1: Shape Spotters

**Central concept:** Recognise and name familiar shapes in varied orientations.
**Curriculum alignment:** AC9MFSP01
**Practised skills:** `space-ground-shape-recognition`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Meet the Shape Crew (`ground-space-w1-l1`) | build | Recognise circles, triangles, squares and rectangles. | We are learning to recognise circles, triangles, squares and rectangles. | shape-sort, rotation-match, scene-shape-hunt |
| 2. Turned Shapes (`ground-space-w1-l2`) | develop | Match familiar shapes shown in different sizes and orientations. | We are learning to match familiar shapes shown in different sizes and orientations. | shape-sort, rotation-match, scene-shape-hunt |
| 3. Shape Hunt (`ground-space-w1-l3`) | apply | Find and justify familiar shapes in a scene. | We are learning to find and justify familiar shapes in a scene. | shape-sort, rotation-match, scene-shape-hunt |

**Vocabulary:** circle, triangle, square, rectangle, shape

**Common misconceptions**

- A rotated square becomes a diamond.
- All four-sided shapes are squares.

**Weekly quiz:** `ground-space-w1-quiz` - Recognition, naming and orientation invariance. (15 questions; planned)

#### Week 2: Sorting Stations

**Central concept:** Sort and compare shapes using visible features and reasons.
**Curriculum alignment:** AC9MFSP01
**Practised skills:** `space-ground-shape-sorting`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Same and Different (`ground-space-w2-l1`) | build | Compare one visible feature at a time. | We are learning to compare one visible feature at a time. | feature-match, drag-sort, rule-detective |
| 2. Choose a Sorting Rule (`ground-space-w2-l2`) | develop | Sort a mixed set using shape features. | We are learning to sort a mixed set using shape features. | feature-match, drag-sort, rule-detective |
| 3. Mystery Sort (`ground-space-w2-l3`) | apply | Infer and explain another person's sorting rule. | We are learning to infer and explain another person's sorting rule. | feature-match, drag-sort, rule-detective |

**Vocabulary:** same, different, sort, group, reason

**Common misconceptions**

- Items can belong to only one possible group.
- Colour is always the most useful rule.

**Weekly quiz:** `ground-space-w2-quiz` - Comparison, sorting rules and explanations. (15 questions; planned)

#### Week 3: Shape Makers

**Central concept:** Create and compose familiar shapes from parts.
**Curriculum alignment:** AC9MFSP01
**Practised skills:** `space-ground-shape-creation`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Build One Shape (`ground-space-w3-l1`) | build | Construct familiar shapes from moveable parts. | We are learning to construct familiar shapes from moveable parts. | shape-builder, compose-puzzle, multiple-solution-builder |
| 2. Shapes from Shapes (`ground-space-w3-l2`) | develop | Combine smaller shapes to make a larger familiar shape. | We are learning to combine smaller shapes to make a larger familiar shape. | shape-builder, compose-puzzle, multiple-solution-builder |
| 3. More Than One Way (`ground-space-w3-l3`) | apply | Create the same target in different ways and compare solutions. | We are learning to create the same target in different ways and compare solutions. | shape-builder, compose-puzzle, multiple-solution-builder |

**Vocabulary:** make, part, whole, join, turn

**Common misconceptions**

- A target has only one valid construction.
- Parts stop being shapes when combined.

**Weekly quiz:** `ground-space-w3-quiz` - Creating, composing and explaining shapes. (15 questions; planned)

#### Week 4: Shapes Around Us

**Central concept:** Recognise and describe shapes within everyday objects.
**Curriculum alignment:** AC9MFSP01
**Practised skills:** `space-ground-shapes-in-objects`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Object Shape Hunt (`ground-space-w4-l1`) | build | Locate familiar shapes inside everyday objects. | We are learning to locate familiar shapes inside everyday objects. | image-hotspot, object-shape-match, picture-composer |
| 2. Which Shape Fits? (`ground-space-w4-l2`) | develop | Match object parts to shape representations. | We are learning to match object parts to shape representations. | image-hotspot, object-shape-match, picture-composer |
| 3. Design a Space Station (`ground-space-w4-l3`) | apply | Use familiar shapes to design and explain an object. | We are learning to use familiar shapes to design and explain an object. | image-hotspot, object-shape-match, picture-composer |

**Vocabulary:** object, inside, edge, round, corner

**Common misconceptions**

- An object must be exactly one shape.
- Only the outside outline can contain shapes.

**Weekly quiz:** `ground-space-w4-quiz` - Environmental recognition and reasoned description. (15 questions; planned)

#### Week 5: Where Is It?

**Central concept:** Describe location relative to people and objects.
**Curriculum alignment:** AC9MFSP02
**Practised skills:** `space-ground-position-language`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Position Words (`ground-space-w5-l1`) | build | Connect above, below, beside, in front and behind to scenes. | We are learning to connect above, below, beside, in front and behind to scenes. | position-match, drag-place, scene-description |
| 2. Place the Astronaut (`ground-space-w5-l2`) | develop | Position an object by following one relational instruction. | We are learning to position an object by following one relational instruction. | position-match, drag-place, scene-description |
| 3. Describe the Scene (`ground-space-w5-l3`) | apply | Choose precise words to communicate a location. | We are learning to choose precise words to communicate a location. | position-match, drag-place, scene-description |

**Vocabulary:** above, below, beside, in front, behind

**Common misconceptions**

- Left and right are the same from every viewpoint.
- Near and beside mean exactly the same thing.

**Weekly quiz:** `ground-space-w5-quiz` - Relational position vocabulary and communication. (15 questions; planned)

#### Week 6: Near, Far, Inside

**Central concept:** Compare proximity and containment in familiar spaces.
**Curriculum alignment:** AC9MFSP02
**Practised skills:** `space-ground-location-relations`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Inside or Outside (`ground-space-w6-l1`) | build | Identify containment relationships. | We are learning to identify containment relationships. | containment-sort, proximity-compare, location-reasoning |
| 2. Near or Far (`ground-space-w6-l2`) | develop | Compare relative proximity using a shared scene. | We are learning to compare relative proximity using a shared scene. | containment-sort, proximity-compare, location-reasoning |
| 3. Best Location (`ground-space-w6-l3`) | apply | Choose and justify a location from spatial clues. | We are learning to choose and justify a location from spatial clues. | containment-sort, proximity-compare, location-reasoning |

**Vocabulary:** inside, outside, near, far, between

**Common misconceptions**

- Near and far are absolute distances.
- An object cannot be between two others.

**Weekly quiz:** `ground-space-w6-quiz` - Containment, proximity and location reasoning. (15 questions; planned)

#### Week 7: Move Through Space

**Central concept:** Follow and describe simple movements and pathways.
**Curriculum alignment:** AC9MFSP02
**Practised skills:** `space-ground-movement-pathways`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Move One Step (`ground-space-w7-l1`) | build | Follow forward, backward and turn instructions. | We are learning to follow forward, backward and turn instructions. | movement-simulator, path-sequencer, direction-builder |
| 2. Pathway Pilot (`ground-space-w7-l2`) | develop | Sequence several moves to reach a location. | We are learning to sequence several moves to reach a location. | movement-simulator, path-sequencer, direction-builder |
| 3. Give the Directions (`ground-space-w7-l3`) | apply | Create directions for another character to follow. | We are learning to create directions for another character to follow. | movement-simulator, path-sequencer, direction-builder |

**Vocabulary:** forward, backward, turn, path, direction

**Common misconceptions**

- Turning changes location immediately.
- A route can omit the order of moves.

**Weekly quiz:** `ground-space-w7-quiz` - Movement language, ordered pathways and communication. (15 questions; planned)

#### Week 8: Shape and Space Mission

**Central concept:** Apply shape, position and movement reasoning together.
**Curriculum alignment:** AC9MFSP01, AC9MFSP02
**Practised skills:** `space-ground-spatial-mission`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Read the Space Map (`ground-space-w8-l1`) | build | Identify shapes and locations in a pictorial map. | We are learning to identify shapes and locations in a pictorial map. | picture-map-reader, route-planner, spatial-reasoning-choice |
| 2. Plan the Rescue (`ground-space-w8-l2`) | develop | Build a pathway from ordered spatial clues. | We are learning to build a pathway from ordered spatial clues. | picture-map-reader, route-planner, spatial-reasoning-choice |
| 3. Explain the Mission (`ground-space-w8-l3`) | apply | Solve and justify a combined shape-and-position problem. | We are learning to solve and justify a combined shape-and-position problem. | picture-map-reader, route-planner, spatial-reasoning-choice |

**Vocabulary:** map, location, pathway, shape, explain

**Common misconceptions**

- A map must look exactly like the real space.
- Only one route can be correct.

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

- Pre-test: `y1-space-pre-01` (20 questions; planned)
- Post-test: `y1-space-post-01` (20 questions; unlocks after `y1-space-w8-l3`; planned)

### Skill Taxonomy

| Skill ID | Student name | Teacher description | Week | Category | Prerequisites |
| --- | --- | --- | ---: | --- | --- |
| `space-l1-shape-features` | Compare shape features | Compares familiar shapes using sides, corners, curved surfaces and straight edges. | 1 | shape-and-object-reasoning | `space-ground-shape-recognition` |
| `space-l1-shape-classification` | Build shape families | Classifies familiar shapes and objects and explains the shared feature. | 2 | shape-and-object-reasoning | `space-l1-shape-features` |
| `space-l1-shape-composition` | Build shapes from parts | Composes and decomposes familiar shapes while describing constituent parts. | 3 | construction-and-visualisation | `space-l1-shape-classification` |
| `space-l1-objects-and-views` | Match objects and views | Recognises shape features in simple pictures and views of familiar objects. | 4 | spatial-representation | `space-l1-shape-features` |
| `space-l1-direction-language` | Use direction words | Uses forward, backward, left, right and turn language from a stated orientation. | 5 | position-and-navigation | `space-ground-movement-pathways` |
| `space-l1-follow-directions` | Follow a route | Follows multi-step directions from a specified start and orientation. | 6 | position-and-navigation | `space-l1-direction-language` |
| `space-l1-give-directions` | Give clear directions | Creates and checks ordered directions that move a person or object to a location. | 7 | position-and-navigation | `space-l1-follow-directions` |
| `space-l1-pathfinder-reasoning` | Solve a pathfinder challenge | Uses shape information and directions together to solve and explain spatial problems. | 8 | spatial-representation | `space-l1-objects-and-views`, `space-l1-give-directions` |

### Eight-Week Sequence

#### Week 1: Shape Features

**Central concept:** Compare familiar shapes using observable features.
**Curriculum alignment:** AC9M1SP01
**Practised skills:** `space-l1-shape-features`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Feature Detectives (`y1-space-w1-l1`) | build | Notice sides, corners, straight and curved boundaries. | We are learning to notice sides, corners, straight and curved boundaries. | feature-hotspot, compare-panel, odd-one-out |
| 2. Compare Two Shapes (`y1-space-w1-l2`) | develop | State a similarity and a difference. | We are learning to state a similarity and a difference. | feature-hotspot, compare-panel, odd-one-out |
| 3. Which One Belongs? (`y1-space-w1-l3`) | apply | Justify a choice using shape features. | We are learning to justify a choice using shape features. | feature-hotspot, compare-panel, odd-one-out |

**Vocabulary:** side, corner, straight, curved, feature

**Common misconceptions**

- Size is a defining feature.
- Curved shapes cannot have corners.

**Weekly quiz:** `y1-space-w1-quiz` - Observable features, similarities and differences. (15 questions; planned)

#### Week 2: Shape Families

**Central concept:** Classify shapes and objects using shared features.
**Curriculum alignment:** AC9M1SP01
**Practised skills:** `space-l1-shape-classification`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Meet the Families (`y1-space-w2-l1`) | build | Group shapes by a given feature. | We are learning to group shapes by a given feature. | guided-sort, open-sort, reclassify-challenge |
| 2. Make Your Own Rule (`y1-space-w2-l2`) | develop | Classify a mixed collection in a useful way. | We are learning to classify a mixed collection in a useful way. | guided-sort, open-sort, reclassify-challenge |
| 3. Two Ways to Sort (`y1-space-w2-l3`) | apply | Reclassify the same set and compare rules. | We are learning to reclassify the same set and compare rules. | guided-sort, open-sort, reclassify-challenge |

**Vocabulary:** classify, family, rule, similar, different

**Common misconceptions**

- There is only one correct classification.
- Objects with different uses cannot share shape features.

**Weekly quiz:** `y1-space-w2-quiz` - Classification rules and flexible grouping. (15 questions; planned)

#### Week 3: Build and Take Apart

**Central concept:** Make shapes and identify parts within composites.
**Curriculum alignment:** AC9M1SP01
**Practised skills:** `space-l1-shape-composition`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Build the Target (`y1-space-w3-l1`) | build | Compose a target from familiar shapes. | We are learning to compose a target from familiar shapes. | shape-composer, decompose-overlay, design-builder |
| 2. Find the Hidden Parts (`y1-space-w3-l2`) | develop | Decompose a composite into familiar shapes. | We are learning to decompose a composite into familiar shapes. | shape-composer, decompose-overlay, design-builder |
| 3. Design Two Ways (`y1-space-w3-l3`) | apply | Create and compare two valid constructions. | We are learning to create and compare two valid constructions. | shape-composer, decompose-overlay, design-builder |

**Vocabulary:** compose, decompose, part, whole, overlap

**Common misconceptions**

- Parts cannot overlap.
- A composite has only one decomposition.

**Weekly quiz:** `y1-space-w3-quiz` - Composition, decomposition and multiple solutions. (15 questions; planned)

#### Week 4: Objects and Views

**Central concept:** Connect familiar objects with simple shape representations.
**Curriculum alignment:** AC9M1SP01
**Practised skills:** `space-l1-objects-and-views`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Object or Picture? (`y1-space-w4-l1`) | build | Match familiar objects to simple representations. | We are learning to match familiar objects to simple representations. | object-picture-match, viewpoint-toggle, view-reasoning |
| 2. Look from Here (`y1-space-w4-l2`) | develop | Compare how one object appears from two viewpoints. | We are learning to compare how one object appears from two viewpoints. | object-picture-match, viewpoint-toggle, view-reasoning |
| 3. Choose the Best View (`y1-space-w4-l3`) | apply | Select and explain a useful representation. | We are learning to select and explain a useful representation. | object-picture-match, viewpoint-toggle, view-reasoning |

**Vocabulary:** object, picture, view, front, top

**Common misconceptions**

- An object looks identical from every viewpoint.
- A picture is the object itself.

**Weekly quiz:** `y1-space-w4-quiz` - Object-shape connections and simple viewpoints. (15 questions; planned)

#### Week 5: Direction Words

**Central concept:** Use precise movement and turn language.
**Curriculum alignment:** AC9M1SP02
**Practised skills:** `space-l1-direction-language`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Face and Move (`y1-space-w5-l1`) | build | Connect orientation with forward and backward. | We are learning to connect orientation with forward and backward. | orientation-mover, turn-simulator, movement-describer |
| 2. Left and Right Turns (`y1-space-w5-l2`) | develop | Follow turns from a visible viewpoint. | We are learning to follow turns from a visible viewpoint. | orientation-mover, turn-simulator, movement-describer |
| 3. Say the Move (`y1-space-w5-l3`) | apply | Describe a demonstrated movement precisely. | We are learning to describe a demonstrated movement precisely. | orientation-mover, turn-simulator, movement-describer |

**Vocabulary:** forward, backward, left, right, turn

**Common misconceptions**

- Left and right are fixed on the screen.
- A turn and a step are the same action.

**Weekly quiz:** `y1-space-w5-quiz` - Orientation-aware directional language. (15 questions; planned)

#### Week 6: Follow the Route

**Central concept:** Follow ordered directions to reach locations.
**Curriculum alignment:** AC9M1SP02
**Practised skills:** `space-l1-follow-directions`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Start Here (`y1-space-w6-l1`) | build | Identify start, destination and facing direction. | We are learning to identify start, destination and facing direction. | start-state-match, route-runner, route-debugger |
| 2. Mission Route (`y1-space-w6-l2`) | develop | Follow a sequence of moves in order. | We are learning to follow a sequence of moves in order. | start-state-match, route-runner, route-debugger |
| 3. Find the Error (`y1-space-w6-l3`) | apply | Diagnose an incorrect route and repair it. | We are learning to diagnose an incorrect route and repair it. | start-state-match, route-runner, route-debugger |

**Vocabulary:** start, finish, order, route, step

**Common misconceptions**

- Directions can be followed in any order.
- The destination alone determines the route.

**Weekly quiz:** `y1-space-w6-quiz` - Following and debugging ordered directions. (15 questions; planned)

#### Week 7: Give the Route

**Central concept:** Create unambiguous directions for others.
**Curriculum alignment:** AC9M1SP02
**Practised skills:** `space-l1-give-directions`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Build a Route (`y1-space-w7-l1`) | build | Choose moves that connect a start and destination. | We are learning to choose moves that connect a start and destination. | route-builder, direction-sequencer, route-test-lab |
| 2. Directions for a Friend (`y1-space-w7-l2`) | develop | Record an ordered route another character can follow. | We are learning to record an ordered route another character can follow. | route-builder, direction-sequencer, route-test-lab |
| 3. Test and Improve (`y1-space-w7-l3`) | apply | Run, revise and explain a route. | We are learning to run, revise and explain a route. | route-builder, direction-sequencer, route-test-lab |

**Vocabulary:** instruction, sequence, destination, check, improve

**Common misconceptions**

- The route is clear without a start or facing direction.
- A failed route must be discarded rather than revised.

**Weekly quiz:** `y1-space-w7-quiz` - Creating, testing and communicating routes. (15 questions; planned)

#### Week 8: Pathfinder Challenge

**Central concept:** Integrate classification, views and directions.
**Curriculum alignment:** AC9M1SP01, AC9M1SP02
**Practised skills:** `space-l1-pathfinder-reasoning`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Find the Shape Landmark (`y1-space-w8-l1`) | build | Use shape clues to identify route landmarks. | We are learning to use shape clues to identify route landmarks. | landmark-clue-match, obstacle-route-planner, route-compare |
| 2. Plan Around Obstacles (`y1-space-w8-l2`) | develop | Create a valid pathway through a familiar space. | We are learning to create a valid pathway through a familiar space. | landmark-clue-match, obstacle-route-planner, route-compare |
| 3. Explain Your Path (`y1-space-w8-l3`) | apply | Compare routes and justify a solution. | We are learning to compare routes and justify a solution. | landmark-clue-match, obstacle-route-planner, route-compare |

**Vocabulary:** landmark, obstacle, path, compare, explain

**Common misconceptions**

- The shortest-looking route always works.
- Different valid routes cannot share a destination.

**Weekly quiz:** none. Week 8 Lesson 3 unlocks `y1-space-post-01`.

## Starpath Level 2: Shape Systems and Map Missions

**Canonical level:** `level-2`
**Program ID:** `y2-space`
**Status:** planned

Students classify regular and irregular shapes and objects, use two-dimensional representations, and reason about one-step transformations.

### Curriculum Alignment

- **AC9M2SP01:** Recognise, compare and classify shapes, referencing the number of sides and using spatial terms such as opposite, parallel, curved and straight.
- **AC9M2SP02:** Locate and identify positions of features in two-dimensional representations and move position by following directions and pathways.

**Achievement-standard connection:** Students compare and classify shapes using formal spatial terms, locate features in two-dimensional representations and follow directions and pathways.

**Prerequisite knowledge**

- Compare and classify familiar shapes.
- Give and follow ordered directions.

**Likely level misconceptions**

- Regular means common.
- Parallel lines must be horizontal.
- A transformation changes size or shape.

**Progression rationale:** Feature language becomes more precise, maps become representational rather than pictorial, and movement reasoning extends from paths to transformations.

### Assessment Metadata

- Pre-test: `y2-space-pre-01` (20 questions; planned)
- Post-test: `y2-space-post-01` (20 questions; unlocks after `y2-space-w8-l3`; planned)

### Skill Taxonomy

| Skill ID | Student name | Teacher description | Week | Category | Prerequisites |
| --- | --- | --- | ---: | --- | --- |
| `space-l2-regular-irregular-shapes` | Compare regular and irregular shapes | Recognises and compares regular and irregular shapes using visible properties rather than orientation. | 1 | shape-and-object-reasoning | `space-l1-shape-classification` |
| `space-l2-shape-properties` | Describe shape properties | Uses sides, curves, vertices and parallel relationships to describe and distinguish shapes. | 2 | shape-and-object-reasoning | `space-l2-regular-irregular-shapes` |
| `space-l2-multi-feature-classification` | Classify with several clues | Classifies shapes and objects using more than one property and tests borderline examples. | 3 | shape-and-object-reasoning | `space-l2-shape-properties` |
| `space-l2-map-representations` | Read a simple map | Connects features and relative positions in a familiar space with a two-dimensional representation. | 4 | spatial-representation | `space-l1-objects-and-views` |
| `space-l2-relative-map-position` | Locate features on a map | Identifies map features using relative position and landmark language. | 5 | position-and-navigation | `space-l2-map-representations` |
| `space-l2-map-pathways` | Navigate a map pathway | Follows, records and compares pathways on a simple two-dimensional representation. | 6 | position-and-navigation | `space-l2-relative-map-position` |
| `space-l2-route-reasoning` | Compare map routes | Creates and checks pathways, comparing routes against stated location and movement constraints. | 7 | position-and-navigation | `space-l2-map-pathways` |
| `space-l2-spatial-systems` | Solve a spatial systems mission | Integrates shape properties, map locations and pathways to solve and explain spatial problems. | 8 | spatial-representation | `space-l2-multi-feature-classification`, `space-l2-route-reasoning` |

### Eight-Week Sequence

#### Week 1: Regular and Irregular

**Central concept:** Recognise regular and irregular shapes in varied orientations.
**Curriculum alignment:** AC9M2SP01
**Practised skills:** `space-l2-regular-irregular-shapes`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. What Makes It Regular? (`y2-space-w1-l1`) | build | Compare equal and unequal side or angle appearances. | We are learning to compare equal and unequal side or angle appearances. | regularity-sort, orientation-classifier, classification-reasoning |
| 2. Turn and Compare (`y2-space-w1-l2`) | develop | Classify examples shown in varied orientations. | We are learning to classify examples shown in varied orientations. | regularity-sort, orientation-classifier, classification-reasoning |
| 3. Defend the Group (`y2-space-w1-l3`) | apply | Explain why a shape belongs in a chosen group. | We are learning to explain why a shape belongs in a chosen group. | regularity-sort, orientation-classifier, classification-reasoning |

**Vocabulary:** regular, irregular, equal, property, orientation

**Common misconceptions**

- Regular means upright.
- All familiar shapes are regular.

**Weekly quiz:** `y2-space-w1-quiz` - Regularity, orientation and justified classification. (15 questions; planned)

#### Week 2: Sides and Boundaries

**Central concept:** Describe shapes with straight, curved and parallel boundaries.
**Curriculum alignment:** AC9M2SP01
**Practised skills:** `space-l2-shape-properties`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Boundary Lab (`y2-space-w2-l1`) | build | Identify straight and curved boundaries and vertices. | We are learning to identify straight and curved boundaries and vertices. | boundary-highlighter, parallel-detector, property-riddle |
| 2. Parallel Trackers (`y2-space-w2-l2`) | develop | Recognise parallel sides in different orientations. | We are learning to recognise parallel sides in different orientations. | boundary-highlighter, parallel-detector, property-riddle |
| 3. Property Riddles (`y2-space-w2-l3`) | apply | Identify a shape from a set of property clues. | We are learning to identify a shape from a set of property clues. | boundary-highlighter, parallel-detector, property-riddle |

**Vocabulary:** boundary, vertex, straight, curved, parallel

**Common misconceptions**

- Parallel lines must be vertical.
- Curved boundaries count as straight sides.

**Weekly quiz:** `y2-space-w2-quiz` - Precise shape properties and spatial terms. (15 questions; planned)

#### Week 3: Classification Rules

**Central concept:** Build and test multi-feature classification rules.
**Curriculum alignment:** AC9M2SP01
**Practised skills:** `space-l2-multi-feature-classification`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Two-Clue Sort (`y2-space-w3-l1`) | build | Classify using two stated properties. | We are learning to classify using two stated properties. | multi-rule-sort, decision-machine, counterexample-tester |
| 2. Sorting Machine (`y2-space-w3-l2`) | develop | Create a decision rule for a mixed set. | We are learning to create a decision rule for a mixed set. | multi-rule-sort, decision-machine, counterexample-tester |
| 3. Challenge the Rule (`y2-space-w3-l3`) | apply | Test exceptions and refine a classification. | We are learning to test exceptions and refine a classification. | multi-rule-sort, decision-machine, counterexample-tester |

**Vocabulary:** property, rule, belongs, exception, classify

**Common misconceptions**

- One matching feature is always enough.
- A counterexample proves all classification is impossible.

**Weekly quiz:** `y2-space-w3-quiz` - Multi-property classification and counterexamples. (15 questions; planned)

#### Week 4: Map Representations

**Central concept:** Connect familiar spaces with two-dimensional representations.
**Curriculum alignment:** AC9M2SP02
**Practised skills:** `space-l2-map-representations`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Space to Map (`y2-space-w4-l1`) | build | Match a familiar scene to a top-view representation. | We are learning to match a familiar scene to a top-view representation. | scene-map-match, symbol-key-match, representation-compare |
| 2. Map Symbols (`y2-space-w4-l2`) | develop | Interpret symbols for key features and landmarks. | We are learning to interpret symbols for key features and landmarks. | scene-map-match, symbol-key-match, representation-compare |
| 3. Which Map Works? (`y2-space-w4-l3`) | apply | Select and explain an accurate representation. | We are learning to select and explain an accurate representation. | scene-map-match, symbol-key-match, representation-compare |

**Vocabulary:** map, symbol, key, feature, top view

**Common misconceptions**

- A map must be a realistic picture.
- Symbols must have the same size as features.

**Weekly quiz:** `y2-space-w4-quiz` - Two-dimensional representation, symbols and relative position. (15 questions; planned)

#### Week 5: Locate the Feature

**Central concept:** Use relative positions to locate map features.
**Curriculum alignment:** AC9M2SP02
**Practised skills:** `space-l2-relative-map-position`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Landmark Language (`y2-space-w5-l1`) | build | Describe features relative to a shared landmark. | We are learning to describe features relative to a shared landmark. | landmark-match, map-symbol-placement, location-deduction |
| 2. Place the Features (`y2-space-w5-l2`) | develop | Position symbols from relational clues. | We are learning to position symbols from relational clues. | landmark-match, map-symbol-placement, location-deduction |
| 3. Mystery Location (`y2-space-w5-l3`) | apply | Combine several clues to identify one location. | We are learning to combine several clues to identify one location. | landmark-match, map-symbol-placement, location-deduction |

**Vocabulary:** landmark, relative, between, opposite, next to

**Common misconceptions**

- One clue always identifies a unique location.
- Relative position does not depend on a reference.

**Weekly quiz:** `y2-space-w5-quiz` - Landmarks, relative position and location deduction. (15 questions; planned)

#### Week 6: Pathways on Maps

**Central concept:** Follow and compare pathways on two-dimensional maps.
**Curriculum alignment:** AC9M2SP02
**Practised skills:** `space-l2-map-pathways`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Trace the Path (`y2-space-w6-l1`) | build | Follow a route using map directions. | We are learning to follow a route using map directions. | map-route-runner, path-compare, map-direction-builder |
| 2. Choose a Pathway (`y2-space-w6-l2`) | develop | Compare valid pathways around obstacles. | We are learning to compare valid pathways around obstacles. | map-route-runner, path-compare, map-direction-builder |
| 3. Write the Route (`y2-space-w6-l3`) | apply | Record and check directions for a map pathway. | We are learning to record and check directions for a map pathway. | map-route-runner, path-compare, map-direction-builder |

**Vocabulary:** pathway, route, landmark, direction, obstacle

**Common misconceptions**

- A visually direct path can cross obstacles.
- A route needs no ordered directions.

**Weekly quiz:** `y2-space-w6-quiz` - Map navigation, pathway comparison and communication. (15 questions; planned)

#### Week 7: Create and Compare Routes

**Central concept:** Create, test and compare pathways on two-dimensional representations.
**Curriculum alignment:** AC9M2SP02
**Practised skills:** `space-l2-route-reasoning`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Create the Path (`y2-space-w7-l1`) | build | Build an ordered pathway between two map positions. | We are learning to build an ordered pathway between two map positions. | map-route-builder, direction-debugger, route-constraint-compare |
| 2. Test the Directions (`y2-space-w7-l2`) | develop | Follow another route and identify ambiguous or missing steps. | We are learning to follow another route and identify ambiguous or missing steps. | map-route-builder, direction-debugger, route-constraint-compare |
| 3. Compare Two Routes (`y2-space-w7-l3`) | apply | Choose and justify a route for a stated constraint. | We are learning to choose and justify a route for a stated constraint. | map-route-builder, direction-debugger, route-constraint-compare |

**Vocabulary:** pathway, direction, position, constraint, compare

**Common misconceptions**

- A route is clear without a start position.
- The shortest route is always the most suitable.

**Weekly quiz:** `y2-space-w7-quiz` - Creating, testing and comparing map pathways. (15 questions; planned)

#### Week 8: Shape and Map Mission

**Central concept:** Apply shape classification, map location and pathway reasoning together.
**Curriculum alignment:** AC9M2SP01, AC9M2SP02
**Practised skills:** `space-l2-spatial-systems`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Decode the Map (`y2-space-w8-l1`) | build | Use property clues to locate shape landmarks. | We are learning to use property clues to locate shape landmarks. | map-code-decoder, constraint-route-planner, spatial-solution-compare |
| 2. Plan the Cargo Route (`y2-space-w8-l2`) | develop | Build a pathway that satisfies map constraints. | We are learning to build a pathway that satisfies map constraints. | map-code-decoder, constraint-route-planner, spatial-solution-compare |
| 3. Justify the Solution (`y2-space-w8-l3`) | apply | Compare solutions and explain spatial decisions. | We are learning to compare solutions and explain spatial decisions. | map-code-decoder, constraint-route-planner, spatial-solution-compare |

**Vocabulary:** property, representation, pathway, location, justify

**Common misconceptions**

- Shape clues and map clues are unrelated.
- Only one pathway can solve a spatial task.

**Weekly quiz:** none. Week 8 Lesson 3 unlocks `y2-space-post-01`.

## Starpath Level 3: Object Design and Mapmaking

**Canonical level:** `level-3`
**Program ID:** `y3-space`
**Status:** planned

Students compare and classify objects for purpose and interpret and create two-dimensional representations of familiar environments.

### Curriculum Alignment

- **AC9M3SP01:** Make, compare and classify objects, identifying key features and explaining why those features make them suited to their uses.
- **AC9M3SP02:** Interpret and create two-dimensional representations of familiar environments, locating key landmarks and objects relative to each other.

**Achievement-standard connection:** Students make and compare objects using key features and interpret and create two-dimensional representations of familiar environments.

**Prerequisite knowledge**

- Classify shapes and objects using several properties.
- Read simple maps and follow pathways.

**Likely level misconceptions**

- Objects with the same use must have the same form.
- A map has one correct scale or orientation.
- A useful view must show every feature.

**Progression rationale:** Students move from describing features to reasoning about function, then from reading simple maps to selecting, creating and evaluating representations.

### Assessment Metadata

- Pre-test: `y3-space-pre-01` (20 questions; planned)
- Post-test: `y3-space-post-01` (20 questions; unlocks after `y3-space-w8-l3`; planned)

### Skill Taxonomy

| Skill ID | Student name | Teacher description | Week | Category | Prerequisites |
| --- | --- | --- | ---: | --- | --- |
| `space-l3-object-features` | Describe object features | Identifies faces, edges, vertices and surfaces and uses them to compare objects. | 1 | shape-and-object-reasoning | `space-l2-shape-properties` |
| `space-l3-object-purpose` | Match objects to their purpose | Explains why structural features make an object suited or unsuited to a purpose. | 2 | shape-and-object-reasoning | `space-l3-object-features` |
| `space-l3-spatial-construction` | Build and improve an object | Constructs and revises objects to satisfy stated spatial and functional criteria. | 3 | construction-and-visualisation | `space-l3-object-purpose` |
| `space-l3-object-views` | Connect objects and views | Interprets and selects front, side and top views that communicate object features. | 4 | spatial-representation | `space-l3-object-features` |
| `space-l3-map-interpretation` | Interpret a familiar map | Interprets a two-dimensional representation using its key, orientation and relative landmark positions. | 5 | spatial-representation | `space-l2-map-representations` |
| `space-l3-map-creation` | Create a useful map | Creates a two-dimensional representation with selected features, landmarks, relative positions and a key. | 6 | spatial-representation | `space-l3-map-interpretation` |
| `space-l3-landmark-navigation` | Navigate with landmarks | Uses relative landmark positions to create, follow and compare routes on a map. | 7 | position-and-navigation | `space-l3-map-creation` |
| `space-l3-spatial-design` | Design and represent a space | Integrates suitable object features and a coherent two-dimensional representation to communicate a spatial design. | 8 | construction-and-visualisation | `space-l3-spatial-construction`, `space-l3-object-views`, `space-l3-landmark-navigation` |

### Eight-Week Sequence

#### Week 1: Object Features

**Central concept:** Identify and compare structural features of three-dimensional objects.
**Curriculum alignment:** AC9M3SP01
**Practised skills:** `space-l3-object-features`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Explore the Object (`y3-space-w1-l1`) | build | Identify faces, edges, vertices and curved surfaces. | We are learning to identify faces, edges, vertices and curved surfaces. | object-inspector, object-compare, feature-riddle |
| 2. Compare Objects (`y3-space-w1-l2`) | develop | Compare shared and different structural features. | We are learning to compare shared and different structural features. | object-inspector, object-compare, feature-riddle |
| 3. Object Riddles (`y3-space-w1-l3`) | apply | Identify and justify an object from feature clues. | We are learning to identify and justify an object from feature clues. | object-inspector, object-compare, feature-riddle |

**Vocabulary:** face, edge, vertex, surface, object

**Common misconceptions**

- A face means only the front.
- Curved surfaces contain straight edges.

**Weekly quiz:** `y3-space-w1-quiz` - Three-dimensional object features and comparison. (15 questions; planned)

#### Week 2: Classify for Purpose

**Central concept:** Connect object features to uses and constraints.
**Curriculum alignment:** AC9M3SP01
**Practised skills:** `space-l3-object-purpose`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Feature and Function (`y3-space-w2-l1`) | build | Match structural features with practical effects. | We are learning to match structural features with practical effects. | feature-function-match, design-choice, design-argument |
| 2. Best Object for the Job (`y3-space-w2-l2`) | develop | Choose an object for a stated use. | We are learning to choose an object for a stated use. | feature-function-match, design-choice, design-argument |
| 3. Defend the Design (`y3-space-w2-l3`) | apply | Justify a choice and reject a less suitable alternative. | We are learning to justify a choice and reject a less suitable alternative. | feature-function-match, design-choice, design-argument |

**Vocabulary:** purpose, suitable, stable, roll, stack

**Common misconceptions**

- Appearance alone determines suitability.
- There is always one universally best object.

**Weekly quiz:** `y3-space-w2-quiz` - Feature-function relationships and design reasoning. (15 questions; planned)

#### Week 3: Build and Improve

**Central concept:** Construct objects and refine designs against spatial criteria.
**Curriculum alignment:** AC9M3SP01
**Practised skills:** `space-l3-spatial-construction`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Build from Solids (`y3-space-w3-l1`) | build | Combine objects to meet one design criterion. | We are learning to combine objects to meet one design criterion. | solid-object-builder, virtual-design-test, constraint-redesign |
| 2. Test the Structure (`y3-space-w3-l2`) | develop | Evaluate stability, rolling or stacking behaviour. | We are learning to evaluate stability, rolling or stacking behaviour. | solid-object-builder, virtual-design-test, constraint-redesign |
| 3. Improve the Design (`y3-space-w3-l3`) | apply | Revise and explain a construction against criteria. | We are learning to revise and explain a construction against criteria. | solid-object-builder, virtual-design-test, constraint-redesign |

**Vocabulary:** construct, combine, criterion, test, revise

**Common misconceptions**

- A first design cannot be changed.
- Adding more pieces always improves a structure.

**Weekly quiz:** `y3-space-w3-quiz` - Spatial construction, testing and iterative design. (15 questions; planned)

#### Week 4: Views of Objects

**Central concept:** Represent three-dimensional objects in useful two-dimensional views.
**Curriculum alignment:** AC9M3SP01, AC9M3SP02
**Practised skills:** `space-l3-object-views`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Front, Side, Top (`y3-space-w4-l1`) | build | Match an object to views from stated viewpoints. | We are learning to match an object to views from stated viewpoints. | view-matcher, hidden-feature-reasoning, view-selection |
| 2. Hidden Features (`y3-space-w4-l2`) | develop | Reason about features visible or hidden in a view. | We are learning to reason about features visible or hidden in a view. | view-matcher, hidden-feature-reasoning, view-selection |
| 3. Choose a Useful View (`y3-space-w4-l3`) | apply | Select and justify a representation for a purpose. | We are learning to select and justify a representation for a purpose. | view-matcher, hidden-feature-reasoning, view-selection |

**Vocabulary:** front view, side view, top view, visible, hidden

**Common misconceptions**

- Every view shows all features.
- Rotating an object changes its structure.

**Weekly quiz:** `y3-space-w4-quiz` - Object views, visibility and representational purpose. (15 questions; planned)

#### Week 5: Read Familiar Maps

**Central concept:** Interpret symbols, landmarks and relative locations in maps.
**Curriculum alignment:** AC9M3SP02
**Practised skills:** `space-l3-map-interpretation`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Read the Key (`y3-space-w5-l1`) | build | Interpret symbols and map conventions. | We are learning to interpret symbols and map conventions. | map-key-decoder, relative-location-builder, map-claim-checker |
| 2. Landmarks in Relation (`y3-space-w5-l2`) | develop | Describe locations relative to multiple landmarks. | We are learning to describe locations relative to multiple landmarks. | map-key-decoder, relative-location-builder, map-claim-checker |
| 3. Map Evidence (`y3-space-w5-l3`) | apply | Use map evidence to evaluate location claims. | We are learning to use map evidence to evaluate location claims. | map-key-decoder, relative-location-builder, map-claim-checker |

**Vocabulary:** key, symbol, landmark, relative, orientation

**Common misconceptions**

- A map symbol has a fixed universal meaning.
- Map orientation never changes.

**Weekly quiz:** `y3-space-w5-quiz` - Map conventions, relative location and evidence. (15 questions; planned)

#### Week 6: Create a Map

**Central concept:** Create a coherent two-dimensional representation of a familiar environment.
**Curriculum alignment:** AC9M3SP02
**Practised skills:** `space-l3-map-creation`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Select the Features (`y3-space-w6-l1`) | build | Choose important features for a map purpose. | We are learning to choose important features for a map purpose. | feature-selector, map-maker, map-usability-test |
| 2. Place and Symbolise (`y3-space-w6-l2`) | develop | Position landmarks and create a consistent key. | We are learning to position landmarks and create a consistent key. | feature-selector, map-maker, map-usability-test |
| 3. Check the Map (`y3-space-w6-l3`) | apply | Test whether another user can interpret the representation. | We are learning to test whether another user can interpret the representation. | feature-selector, map-maker, map-usability-test |

**Vocabulary:** represent, feature, landmark, key, accurate

**Common misconceptions**

- A useful map includes every real detail.
- Decorative accuracy matters more than relative position.

**Weekly quiz:** `y3-space-w6-quiz` - Purposeful map creation and usability. (15 questions; planned)

#### Week 7: Routes and Landmarks

**Central concept:** Use created maps to communicate and compare routes.
**Curriculum alignment:** AC9M3SP02
**Practised skills:** `space-l3-landmark-navigation`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Route from Landmarks (`y3-space-w7-l1`) | build | Follow directions anchored to map features. | We are learning to follow directions anchored to map features. | landmark-route-runner, multi-route-builder, route-constraint-choice |
| 2. Create Two Routes (`y3-space-w7-l2`) | develop | Plan alternative pathways between locations. | We are learning to plan alternative pathways between locations. | landmark-route-runner, multi-route-builder, route-constraint-choice |
| 3. Which Route Fits? (`y3-space-w7-l3`) | apply | Choose and justify a route for stated constraints. | We are learning to choose and justify a route for stated constraints. | landmark-route-runner, multi-route-builder, route-constraint-choice |

**Vocabulary:** route, landmark, relative, direct, constraint

**Common misconceptions**

- Shortest distance is always the best route.
- Landmark directions need no sequence.

**Weekly quiz:** `y3-space-w7-quiz` - Landmark navigation and route comparison. (15 questions; planned)

#### Week 8: Design a Star Base

**Central concept:** Integrate object design, views and mapmaking.
**Curriculum alignment:** AC9M3SP01, AC9M3SP02
**Practised skills:** `space-l3-spatial-design`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Choose the Structures (`y3-space-w8-l1`) | build | Select objects whose features suit base functions. | We are learning to select objects whose features suit base functions. | constraint-object-selector, environment-map-builder, design-presentation |
| 2. Map the Base (`y3-space-w8-l2`) | develop | Create a representation with landmarks and routes. | We are learning to create a representation with landmarks and routes. | constraint-object-selector, environment-map-builder, design-presentation |
| 3. Present the Design (`y3-space-w8-l3`) | apply | Use views and map evidence to justify decisions. | We are learning to use views and map evidence to justify decisions. | constraint-object-selector, environment-map-builder, design-presentation |

**Vocabulary:** design, structure, representation, route, justify

**Common misconceptions**

- Object design and map design can be considered separately.
- One representation communicates every purpose equally well.

**Weekly quiz:** none. Week 8 Lesson 3 unlocks `y3-space-post-01`.

## Starpath Level 4: Composite Worlds and Symmetry Systems

**Canonical level:** `level-4`
**Program ID:** `y4-space`
**Status:** planned

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

- Pre-test: `y4-space-pre-01` (20 questions; planned)
- Post-test: `y4-space-post-01` (20 questions; unlocks after `y4-space-w8-l3`; planned)

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
| 1. Shapes Within Shapes (`y4-space-w1-l1`) | build | Identify familiar components in a composite. | We are learning to identify familiar components in a composite. | composite-highlighter, shape-composer, decomposition-compare |
| 2. Build the Outline (`y4-space-w1-l2`) | develop | Compose a target using selected shapes. | We are learning to compose a target using selected shapes. | composite-highlighter, shape-composer, decomposition-compare |
| 3. Compare Decompositions (`y4-space-w1-l3`) | apply | Explain two representations of the same composite. | We are learning to explain two representations of the same composite. | composite-highlighter, shape-composer, decomposition-compare |

**Vocabulary:** composite, component, outline, overlap, represent

**Common misconceptions**

- Components cannot overlap.
- A composite has one exact decomposition.

**Weekly quiz:** `y4-space-w1-quiz` - Composite construction and equivalent representations. (15 questions; planned)

#### Week 2: Composite Objects

**Central concept:** Represent three-dimensional objects with combinations and simple views.
**Curriculum alignment:** AC9M4SP01
**Practised skills:** `space-l4-composite-objects`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Combine the Solids (`y4-space-w2-l1`) | build | Construct an object from specified components. | We are learning to construct an object from specified components. | solid-composer, build-view-match, hidden-block-inference |
| 2. Match Build and View (`y4-space-w2-l2`) | develop | Connect a composite object with a two-dimensional view. | We are learning to connect a composite object with a two-dimensional view. | solid-composer, build-view-match, hidden-block-inference |
| 3. Hidden Block Reasoning (`y4-space-w2-l3`) | apply | Infer components needed to support a visible structure. | We are learning to infer components needed to support a visible structure. | solid-composer, build-view-match, hidden-block-inference |

**Vocabulary:** solid, layer, view, hidden, support

**Common misconceptions**

- Only visible components exist.
- A single view uniquely determines every object.

**Weekly quiz:** `y4-space-w2-quiz` - Composite objects, views and hidden structure. (15 questions; planned)

#### Week 3: Approximate and Represent

**Central concept:** Choose familiar components to approximate real forms.
**Curriculum alignment:** AC9M4SP01
**Practised skills:** `space-l4-spatial-approximation`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Simplify the Form (`y4-space-w3-l1`) | build | Identify useful familiar components in a complex object. | We are learning to identify useful familiar components in a complex object. | form-simplifier, approximation-builder, model-evaluator |
| 2. Create an Approximation (`y4-space-w3-l2`) | develop | Build a representation that preserves key spatial features. | We are learning to build a representation that preserves key spatial features. | form-simplifier, approximation-builder, model-evaluator |
| 3. Evaluate the Model (`y4-space-w3-l3`) | apply | Explain what the approximation captures and omits. | We are learning to explain what the approximation captures and omits. | form-simplifier, approximation-builder, model-evaluator |

**Vocabulary:** approximate, model, feature, accurate, limitation

**Common misconceptions**

- Approximate means careless or incorrect.
- A more detailed model is always more useful.

**Weekly quiz:** `y4-space-w3-quiz` - Purposeful approximation and model evaluation. (15 questions; planned)

#### Week 4: Grid Reference Systems

**Central concept:** Understand and create labelled grid reference systems.
**Curriculum alignment:** AC9M4SP02
**Practised skills:** `space-l4-grid-references`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Read the Grid (`y4-space-w4-l1`) | build | Use row and column labels in the agreed order. | We are learning to use row and column labels in the agreed order. | grid-reference-reader, grid-locator, grid-system-builder |
| 2. Locate the Feature (`y4-space-w4-l2`) | develop | Assign and interpret grid references. | We are learning to assign and interpret grid references. | grid-reference-reader, grid-locator, grid-system-builder |
| 3. Build a Grid Key (`y4-space-w4-l3`) | apply | Create a consistent reference system for a map. | We are learning to create a consistent reference system for a map. | grid-reference-reader, grid-locator, grid-system-builder |

**Vocabulary:** grid, row, column, reference, cell

**Common misconceptions**

- Row and column order can change mid-map.
- A reference names a grid line rather than a cell.

**Weekly quiz:** `y4-space-w4-quiz` - Grid conventions and precise location. (15 questions; planned)

#### Week 5: Pathways on Grids

**Central concept:** Describe and compare routes using grids, references and directions.
**Curriculum alignment:** AC9M4SP02
**Practised skills:** `space-l4-grid-navigation`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Reference to Reference (`y4-space-w5-l1`) | build | Trace a route between labelled cells. | We are learning to trace a route between labelled cells. | grid-route-runner, grid-direction-builder, constrained-route-planner |
| 2. Write the Path (`y4-space-w5-l2`) | develop | Create directions using references and movement language. | We are learning to create directions using references and movement language. | grid-route-runner, grid-direction-builder, constrained-route-planner |
| 3. Route Under Constraints (`y4-space-w5-l3`) | apply | Compare pathways that satisfy spatial constraints. | We are learning to compare pathways that satisfy spatial constraints. | grid-route-runner, grid-direction-builder, constrained-route-planner |

**Vocabulary:** pathway, reference, direction, route, constraint

**Common misconceptions**

- A sequence of references automatically describes the moves between them.
- The fewest cells is always the best route.

**Weekly quiz:** `y4-space-w5-quiz` - Grid pathways, directions and route constraints. (15 questions; planned)

#### Week 6: Line Symmetry

**Central concept:** Recognise and construct line-symmetric figures.
**Curriculum alignment:** AC9M4SP03
**Practised skills:** `space-l4-line-symmetry`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Mirror Match (`y4-space-w6-l1`) | build | Test whether two halves correspond across a line. | We are learning to test whether two halves correspond across a line. | symmetry-test, mirror-grid-builder, symmetry-line-counter |
| 2. Complete the Reflection (`y4-space-w6-l2`) | develop | Construct the missing half on a grid. | We are learning to construct the missing half on a grid. | symmetry-test, mirror-grid-builder, symmetry-line-counter |
| 3. How Many Lines? (`y4-space-w6-l3`) | apply | Compare possible symmetry lines and justify counts. | We are learning to compare possible symmetry lines and justify counts. | symmetry-test, mirror-grid-builder, symmetry-line-counter |

**Vocabulary:** symmetry, line of symmetry, mirror, corresponding, equal distance

**Common misconceptions**

- Any line through the centre is a symmetry line.
- Matching colour alone proves symmetry.

**Weekly quiz:** `y4-space-w6-quiz` - Line symmetry, corresponding points and construction. (15 questions; planned)

#### Week 7: Rotational Symmetry

**Central concept:** Recognise and create figures that match after rotation.
**Curriculum alignment:** AC9M4SP03
**Practised skills:** `space-l4-rotational-symmetry`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Turn and Match (`y4-space-w7-l1`) | build | Test a figure at marked rotations. | We are learning to test a figure at marked rotations. | rotation-tester, rotational-order-counter, radial-pattern-builder |
| 2. Count the Matches (`y4-space-w7-l2`) | develop | Determine the number of matching positions in a full turn. | We are learning to determine the number of matching positions in a full turn. | rotation-tester, rotational-order-counter, radial-pattern-builder |
| 3. Create a Turning Pattern (`y4-space-w7-l3`) | apply | Construct and justify a rotationally symmetric design. | We are learning to construct and justify a rotationally symmetric design. | rotation-tester, rotational-order-counter, radial-pattern-builder |

**Vocabulary:** rotational symmetry, centre, full turn, match, order

**Common misconceptions**

- A full turn is the only matching turn.
- Line symmetry guarantees rotational symmetry.

**Weekly quiz:** `y4-space-w7-quiz` - Rotational invariance and pattern construction. (15 questions; planned)

#### Week 8: Symmetric Grid World

**Central concept:** Integrate composite representation, grids and symmetry.
**Curriculum alignment:** AC9M4SP01, AC9M4SP02, AC9M4SP03
**Practised skills:** `space-l4-symmetric-grid-design`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Decode the Design Brief (`y4-space-w8-l1`) | build | Identify composite, grid and symmetry constraints. | We are learning to identify composite, grid and symmetry constraints. | constraint-decoder, symmetric-map-builder, design-auditor |
| 2. Build the World (`y4-space-w8-l2`) | develop | Construct a referenced symmetrical grid design. | We are learning to construct a referenced symmetrical grid design. | constraint-decoder, symmetric-map-builder, design-auditor |
| 3. Audit and Explain (`y4-space-w8-l3`) | apply | Check constraints and justify representational choices. | We are learning to check constraints and justify representational choices. | constraint-decoder, symmetric-map-builder, design-auditor |

**Vocabulary:** composite, grid reference, symmetry, constraint, justify

**Common misconceptions**

- Meeting one constraint compensates for missing another.
- Visual balance always proves mathematical symmetry.

**Weekly quiz:** none. Week 8 Lesson 3 unlocks `y4-space-post-01`.

## Starpath Level 5: Nets, Coordinates and Transformations

**Canonical level:** `level-5`
**Program ID:** `y5-space`
**Status:** planned

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

- Pre-test: `y5-space-pre-01` (20 questions; planned)
- Post-test: `y5-space-post-01` (20 questions; unlocks after `y5-space-w8-l3`; planned)

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
| 1. Unfold the Object (`y5-space-w1-l1`) | build | Relate object faces to a flattened arrangement. | We are learning to relate object faces to a flattened arrangement. | virtual-unfolder, net-validity-predictor, net-evidence-reasoning |
| 2. Which Net Folds? (`y5-space-w1-l2`) | develop | Predict whether a candidate net forms the target object. | We are learning to predict whether a candidate net forms the target object. | virtual-unfolder, net-validity-predictor, net-evidence-reasoning |
| 3. Explain the Match (`y5-space-w1-l3`) | apply | Use face and adjacency evidence to justify a net. | We are learning to use face and adjacency evidence to justify a net. | virtual-unfolder, net-validity-predictor, net-evidence-reasoning |

**Vocabulary:** net, face, fold, edge, adjacent

**Common misconceptions**

- The same number of faces guarantees a valid net.
- Faces that touch in a net always touch after folding.

**Weekly quiz:** `y5-space-w1-quiz` - Object-net correspondence and folding prediction. (15 questions; planned)

#### Week 2: Construct from Nets

**Central concept:** Mentally and virtually fold nets to construct objects.
**Curriculum alignment:** AC9M5SP01
**Practised skills:** `space-l5-net-construction`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Track a Face (`y5-space-w2-l1`) | build | Follow one labelled face through a virtual fold. | We are learning to follow one labelled face through a virtual fold. | face-tracker, net-fold-simulator, folded-relation-challenge |
| 2. Fold the Net (`y5-space-w2-l2`) | develop | Sequence folds to form an object. | We are learning to sequence folds to form an object. | face-tracker, net-fold-simulator, folded-relation-challenge |
| 3. Opposite and Adjacent (`y5-space-w2-l3`) | apply | Determine face relationships after construction. | We are learning to determine face relationships after construction. | face-tracker, net-fold-simulator, folded-relation-challenge |

**Vocabulary:** fold, adjacent, opposite, orientation, construct

**Common misconceptions**

- A face keeps the same screen orientation after folding.
- Opposite faces are opposite in the flat net.

**Weekly quiz:** `y5-space-w2-quiz` - Mental folding and face relationships. (15 questions; planned)

#### Week 3: Create and Test Nets

**Central concept:** Design, test and refine nets for familiar objects.
**Curriculum alignment:** AC9M5SP01
**Practised skills:** `space-l5-net-design`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Arrange the Faces (`y5-space-w3-l1`) | build | Build a candidate net from required faces. | We are learning to build a candidate net from required faces. | net-builder, fold-test-lab, net-compare |
| 2. Test the Fold (`y5-space-w3-l2`) | develop | Identify overlap, gaps or incorrect adjacency. | We are learning to identify overlap, gaps or incorrect adjacency. | net-builder, fold-test-lab, net-compare |
| 3. Compare Valid Nets (`y5-space-w3-l3`) | apply | Explain how different nets can form the same object. | We are learning to explain how different nets can form the same object. | net-builder, fold-test-lab, net-compare |

**Vocabulary:** layout, overlap, gap, valid, revise

**Common misconceptions**

- Each object has one net.
- A connected arrangement always folds without overlap.

**Weekly quiz:** `y5-space-w3-quiz` - Net creation, validation and multiple solutions. (15 questions; planned)

#### Week 4: Coordinate Systems

**Central concept:** Construct and interpret ordered grid coordinate systems.
**Curriculum alignment:** AC9M5SP02
**Practised skills:** `space-l5-grid-coordinates`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Build the Axes (`y5-space-w4-l1`) | build | Establish origin, axes, scale and coordinate order. | We are learning to establish origin, axes, scale and coordinate order. | coordinate-system-builder, coordinate-plotter, coordinate-debugger |
| 2. Plot and Read (`y5-space-w4-l2`) | develop | Locate and identify positions from ordered pairs. | We are learning to locate and identify positions from ordered pairs. | coordinate-system-builder, coordinate-plotter, coordinate-debugger |
| 3. Find the Coordinate Error (`y5-space-w4-l3`) | apply | Diagnose swapped or mis-scaled coordinates. | We are learning to diagnose swapped or mis-scaled coordinates. | coordinate-system-builder, coordinate-plotter, coordinate-debugger |

**Vocabulary:** coordinate, ordered pair, origin, axis, scale

**Common misconceptions**

- Coordinate order is interchangeable.
- Axes can use inconsistent intervals.

**Weekly quiz:** `y5-space-w4-quiz` - Coordinate conventions, plotting and error analysis. (15 questions; planned)

#### Week 5: Coordinate Movement

**Central concept:** Describe and calculate movement between coordinate positions.
**Curriculum alignment:** AC9M5SP02
**Practised skills:** `space-l5-coordinate-navigation`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Move Along an Axis (`y5-space-w5-l1`) | build | Relate horizontal and vertical moves to coordinate changes. | We are learning to relate horizontal and vertical moves to coordinate changes. | coordinate-mover, coordinate-command-runner, coordinate-route-planner |
| 2. Follow Coordinate Commands (`y5-space-w5-l2`) | develop | Apply an ordered sequence of position changes. | We are learning to apply an ordered sequence of position changes. | coordinate-mover, coordinate-command-runner, coordinate-route-planner |
| 3. Plan an Efficient Route (`y5-space-w5-l3`) | apply | Compare coordinate pathways under constraints. | We are learning to compare coordinate pathways under constraints. | coordinate-mover, coordinate-command-runner, coordinate-route-planner |

**Vocabulary:** horizontal, vertical, increase, decrease, movement

**Common misconceptions**

- Both coordinates change for every move.
- Direction words can replace coordinate amounts.

**Weekly quiz:** `y5-space-w5-quiz` - Coordinate changes, movement sequences and route planning. (15 questions; planned)

#### Week 6: Translations

**Central concept:** Describe and perform translations with invariant features.
**Curriculum alignment:** AC9M5SP03
**Practised skills:** `space-l5-translations`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Slide Every Point (`y5-space-w6-l1`) | build | Apply a common horizontal and vertical movement. | We are learning to apply a common horizontal and vertical movement. | point-translation-simulator, translation-describer, transform-validator |
| 2. Describe the Translation (`y5-space-w6-l2`) | develop | Express movement using directional or coordinate language. | We are learning to express movement using directional or coordinate language. | point-translation-simulator, translation-describer, transform-validator |
| 3. Check the Image (`y5-space-w6-l3`) | apply | Use invariants to evaluate a claimed translation. | We are learning to use invariants to evaluate a claimed translation. | point-translation-simulator, translation-describer, transform-validator |

**Vocabulary:** translation, image, horizontal, vertical, invariant

**Common misconceptions**

- Different points can move different amounts.
- Translation changes orientation.

**Weekly quiz:** `y5-space-w6-quiz` - Translations, movement vectors and invariants. (15 questions; planned)

#### Week 7: Reflections and Rotations

**Central concept:** Perform and compare reflections and rotations.
**Curriculum alignment:** AC9M5SP03
**Practised skills:** `space-l5-reflections-rotations`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Reflect Across a Line (`y5-space-w7-l1`) | build | Place corresponding points at equal perpendicular distances. | We are learning to place corresponding points at equal perpendicular distances. | reflection-builder, rotation-simulator, transformation-classifier |
| 2. Rotate About a Point (`y5-space-w7-l2`) | develop | Turn a figure around a stated centre and amount. | We are learning to turn a figure around a stated centre and amount. | reflection-builder, rotation-simulator, transformation-classifier |
| 3. Compare the Transformations (`y5-space-w7-l3`) | apply | Identify action, changes and invariants from image pairs. | We are learning to identify action, changes and invariants from image pairs. | reflection-builder, rotation-simulator, transformation-classifier |

**Vocabulary:** reflection, rotation, line, centre, corresponding

**Common misconceptions**

- Reflection is a horizontal slide.
- Rotation can use any centre without changing the image position.

**Weekly quiz:** `y5-space-w7-quiz` - Reflections, rotations and transformation comparison. (15 questions; planned)

#### Week 8: Spatial Design Challenge

**Central concept:** Integrate nets, coordinates and transformations in a reasoned design.
**Curriculum alignment:** AC9M5SP01, AC9M5SP02, AC9M5SP03
**Practised skills:** `space-l5-spatial-design`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Interpret the Brief (`y5-space-w8-l1`) | build | Connect net, coordinate and transformation constraints. | We are learning to connect net, coordinate and transformation constraints. | design-constraint-decoder, coordinate-transform-builder, spatial-design-auditor |
| 2. Build and Transform (`y5-space-w8-l2`) | develop | Create a valid object representation and position its transformed images. | We are learning to create a valid object representation and position its transformed images. | design-constraint-decoder, coordinate-transform-builder, spatial-design-auditor |
| 3. Test and Defend (`y5-space-w8-l3`) | apply | Check invariants and justify each spatial decision. | We are learning to check invariants and justify each spatial decision. | design-constraint-decoder, coordinate-transform-builder, spatial-design-auditor |

**Vocabulary:** net, coordinate, transformation, invariant, justify

**Common misconceptions**

- Each representation can be solved independently.
- A visually plausible design needs no spatial evidence.

**Weekly quiz:** none. Week 8 Lesson 3 unlocks `y5-space-post-01`.

## Starpath Level 6: Cross-sections, Cartesian Space and Tessellations

**Canonical level:** `level-6`
**Program ID:** `y6-space`
**Status:** planned

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

- Pre-test: `y6-space-pre-01` (20 questions; planned)
- Post-test: `y6-space-post-01` (20 questions; unlocks after `y6-space-w8-l3`; planned)

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
| 1. Slice and See (`y6-space-w1-l1`) | build | Connect a cut direction and position with a cross-section. | We are learning to connect a cut direction and position with a cross-section. | cross-section-slicer, slice-sequence-viewer, cross-section-predictor |
| 2. Parallel Slice Sequence (`y6-space-w1-l2`) | develop | Compare sections from several parallel cuts. | We are learning to compare sections from several parallel cuts. | cross-section-slicer, slice-sequence-viewer, cross-section-predictor |
| 3. Predict Before Cutting (`y6-space-w1-l3`) | apply | Use object structure to justify a predicted section. | We are learning to use object structure to justify a predicted section. | cross-section-slicer, slice-sequence-viewer, cross-section-predictor |

**Vocabulary:** cross-section, plane, parallel, slice, predict

**Common misconceptions**

- A cross-section is always the same shape as a face.
- Parallel cuts always produce congruent sections.

**Weekly quiz:** `y6-space-w1-quiz` - Cross-section visualisation and parallel-cut comparison. (15 questions; planned)

#### Week 2: Prisms and Changing Sections

**Central concept:** Relate constant and changing parallel cross-sections to object structure.
**Curriculum alignment:** AC9M6SP01
**Practised skills:** `space-l6-prism-cross-sections`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Prism or Not? (`y6-space-w2-l1`) | build | Compare parallel sections to identify right-prism behaviour. | We are learning to compare parallel sections to identify right-prism behaviour. | section-prism-classifier, section-change-grapher, object-inference |
| 2. Constant or Changing (`y6-space-w2-l2`) | develop | Track how sections vary through different objects. | We are learning to track how sections vary through different objects. | section-prism-classifier, section-change-grapher, object-inference |
| 3. Explain the Structure (`y6-space-w2-l3`) | apply | Infer object properties from a section sequence. | We are learning to infer object properties from a section sequence. | section-prism-classifier, section-change-grapher, object-inference |

**Vocabulary:** prism, congruent, constant, vary, structure

**Common misconceptions**

- Every object with one polygonal section is a prism.
- All non-prism sections change in the same way.

**Weekly quiz:** `y6-space-w2-quiz` - Prism relationships and structural inference. (15 questions; planned)

#### Week 3: Four-Quadrant Coordinates

**Central concept:** Locate and interpret ordered pairs across four quadrants.
**Curriculum alignment:** AC9M6SP02
**Practised skills:** `space-l6-four-quadrant-coordinates`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Extend the Axes (`y6-space-w3-l1`) | build | Connect signed values with direction from the origin. | We are learning to connect signed values with direction from the origin. | four-quadrant-builder, cartesian-plotter, coordinate-deduction |
| 2. Plot Every Quadrant (`y6-space-w3-l2`) | develop | Locate ordered pairs across four quadrants and axes. | We are learning to locate ordered pairs across four quadrants and axes. | four-quadrant-builder, cartesian-plotter, coordinate-deduction |
| 3. Coordinate Reasoning (`y6-space-w3-l3`) | apply | Infer signs and positions without plotting every point. | We are learning to infer signs and positions without plotting every point. | four-quadrant-builder, cartesian-plotter, coordinate-deduction |

**Vocabulary:** Cartesian plane, quadrant, positive, negative, origin

**Common misconceptions**

- A negative coordinate is an impossible distance.
- Points on axes belong to a quadrant.

**Weekly quiz:** `y6-space-w3-quiz` - Four-quadrant conventions, signs and plotting. (15 questions; planned)

#### Week 4: Coordinate Change

**Central concept:** Describe movement and transformation through coordinate change.
**Curriculum alignment:** AC9M6SP02
**Practised skills:** `space-l6-coordinate-change`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Change One Coordinate (`y6-space-w4-l1`) | build | Relate axis-aligned movement to one changing value. | We are learning to relate axis-aligned movement to one changing value. | coordinate-change-simulator, axis-crossing-runner, movement-rule-inference |
| 2. Cross the Axes (`y6-space-w4-l2`) | develop | Track signs and values through multi-quadrant movement. | We are learning to track signs and values through multi-quadrant movement. | coordinate-change-simulator, axis-crossing-runner, movement-rule-inference |
| 3. Reverse the Movement (`y6-space-w4-l3`) | apply | Infer a movement rule from original and image points. | We are learning to infer a movement rule from original and image points. | coordinate-change-simulator, axis-crossing-runner, movement-rule-inference |

**Vocabulary:** change, difference, direction, sign, rule

**Common misconceptions**

- Crossing an axis swaps coordinate order.
- A negative change always ends at a negative coordinate.

**Weekly quiz:** `y6-space-w4-quiz` - Coordinate differences, axis crossing and inverse reasoning. (15 questions; planned)

#### Week 5: Combined Transformations

**Central concept:** Compose transformations and track cumulative effects.
**Curriculum alignment:** AC9M6SP03
**Practised skills:** `space-l6-combined-transformations`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Transform in Order (`y6-space-w5-l1`) | build | Apply two transformations in a stated sequence. | We are learning to apply two transformations in a stated sequence. | transform-chain-runner, order-comparison-lab, transform-sequence-inference |
| 2. Does Order Matter? (`y6-space-w5-l2`) | develop | Compare reversed transformation sequences. | We are learning to compare reversed transformation sequences. | transform-chain-runner, order-comparison-lab, transform-sequence-inference |
| 3. Find the Transformation Chain (`y6-space-w5-l3`) | apply | Infer a sequence from original and final figures. | We are learning to infer a sequence from original and final figures. | transform-chain-runner, order-comparison-lab, transform-sequence-inference |

**Vocabulary:** composition, sequence, original, image, equivalent

**Common misconceptions**

- Transformation order never matters.
- Only the final position identifies the full sequence.

**Weekly quiz:** `y6-space-w5-quiz` - Transformation composition, order and inverse inference. (15 questions; planned)

#### Week 6: Tessellation Design

**Central concept:** Create and analyse patterns with no gaps or overlaps.
**Curriculum alignment:** AC9M6SP03
**Practised skills:** `space-l6-tessellations`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Will It Tessellate? (`y6-space-w6-l1`) | build | Test repeated shapes for gaps and overlaps. | We are learning to test repeated shapes for gaps and overlaps. | tessellation-tester, pattern-transform-builder, tessellation-reasoning |
| 2. Transformation Pattern (`y6-space-w6-l2`) | develop | Generate a tessellation using an explicit transformation rule. | We are learning to generate a tessellation using an explicit transformation rule. | tessellation-tester, pattern-transform-builder, tessellation-reasoning |
| 3. Explain the Fit (`y6-space-w6-l3`) | apply | Use spatial relationships to justify a design. | We are learning to use spatial relationships to justify a design. | tessellation-tester, pattern-transform-builder, tessellation-reasoning |

**Vocabulary:** tessellation, repeat, gap, overlap, pattern

**Common misconceptions**

- Any repeated shape tessellates.
- Decorative patterns are automatically tessellations.

**Weekly quiz:** `y6-space-w6-quiz` - Tessellation conditions and transformation-generated patterns. (15 questions; planned)

#### Week 7: Transformation Investigations

**Central concept:** Investigate how transformation combinations generate and alter geometric patterns.
**Curriculum alignment:** AC9M6SP03
**Practised skills:** `space-l6-transformation-reasoning`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Notice the Pattern Rule (`y6-space-w7-l1`) | build | Connect repeated images with a transformation sequence. | We are learning to connect repeated images with a transformation sequence. | pattern-rule-detector, transform-experiment-lab, pattern-evidence-reasoning |
| 2. Vary One Transformation (`y6-space-w7-l2`) | develop | Compare patterns after changing one part of the sequence. | We are learning to compare patterns after changing one part of the sequence. | pattern-rule-detector, transform-experiment-lab, pattern-evidence-reasoning |
| 3. Explain with Evidence (`y6-space-w7-l3`) | apply | Use original and image relationships to justify a pattern rule. | We are learning to use original and image relationships to justify a pattern rule. | pattern-rule-detector, transform-experiment-lab, pattern-evidence-reasoning |

**Vocabulary:** sequence, combination, pattern, evidence, result

**Common misconceptions**

- The same transformations always produce the same result in any order.
- A visual pattern needs no stated transformation rule.

**Weekly quiz:** `y6-space-w7-quiz` - Transformation combinations, geometric patterns and evidence. (15 questions; planned)

#### Week 8: Orbital Design Investigation

**Central concept:** Integrate cross-sections, coordinates and transformations in a spatial investigation.
**Curriculum alignment:** AC9M6SP01, AC9M6SP02, AC9M6SP03
**Practised skills:** `space-l6-spatial-investigation`

| Lesson | Role | Focus | Learning intention | Activity mechanic families |
| --- | --- | --- | --- | --- |
| 1. Analyse the System (`y6-space-w8-l1`) | build | Interpret sections, coordinates and pattern constraints. | We are learning to interpret sections, coordinates and pattern constraints. | multi-representation-analyser, spatial-model-lab, evidence-presentation |
| 2. Build and Test (`y6-space-w8-l2`) | develop | Create a solution and test its transformation rules. | We are learning to create a solution and test its transformation rules. | multi-representation-analyser, spatial-model-lab, evidence-presentation |
| 3. Defend the Model (`y6-space-w8-l3`) | apply | Use multiple representations and evidence to justify conclusions. | We are learning to use multiple representations and evidence to justify conclusions. | multi-representation-analyser, spatial-model-lab, evidence-presentation |

**Vocabulary:** model, constraint, coordinate, cross-section, evidence

**Common misconceptions**

- Each representation can be interpreted independently.
- A visually plausible solution needs no mathematical evidence.

**Weekly quiz:** none. Week 8 Lesson 3 unlocks `y6-space-post-01`.
