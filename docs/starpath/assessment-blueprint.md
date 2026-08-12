# Starpath Assessment Blueprint

Status: **Conditionally approved - assessment generation remains blocked**

The purpose of a Level Up Learning assessment is not to measure whether a student remembers the lesson. It is to determine whether the student can independently transfer, apply and reason with the curriculum after learning has occurred.

This blueprint defines Starpath assessment content only. The assessment engine, routing, saving, progression, replay, reporting, rewards, placement and database schema remain frozen. No assessment questions are approved for generation until the relevant level passes its curriculum, weekly-quiz and independent-bank audits.

## Curriculum Source and Ownership

- Source of truth: *Australian Curriculum: Mathematics - Curriculum content F-6, Version 9.0*, supplied project PDF `mathematics-curriculum-content-f-6-v9 (4).pdf`.
- Starpath owns the complete Space strand from Foundation to Year 6.
- Ground has one post-test. Levels 1-6 each have one pre-test and one post-test.
- Every form contains exactly 20 questions and retains the existing 85% threshold.

## Independent Item Rules

- Lesson Bank, Weekly Quiz Bank and Assessment Bank are separate.
- Forms may assess the same descriptor but must not reuse lesson or quiz wording, values, contexts, distractors, payloads, route layouts, maps, models or visual scaffolds.
- Constructed or manipulated responses include drawing, placing, sorting, building, routing, transforming and independently recording a spatial explanation.
- Multiple choice is limited to misconception diagnosis, conceptual comparison, interpretation and evaluation.
- Visuals contain only information required by the task. Keys, labels, marked features and read-aloud must not disclose the answer or strategy.
- Foundation tasks are visual first, use minimal language, and provide neutral read-aloud for every instruction and selectable response.

## Release Sequence

1. Verify curriculum and lesson metadata against the supplied ACv9 PDF.
2. Verify every weekly quiz independently assesses that week's three lessons.
3. Approve the level blueprint and item archetypes.
4. Author an independent assessment bank with canonical metadata.
5. Run automated validation and educator review.
6. Pilot, calibrate and explicitly promote the bank to production.

## Foundation

### Form Design

| Form | Questions | Pass | Accessible | Moderate | Challenging | Recall | Understand | Apply | Reason | Transfer | Constructed minimum | Selected maximum |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| posttest | 20 | 85% | 8 | 8 | 4 | 2 | 6 | 7 | 4 | 1 | 10 | 10 |

### AC9MFSP01

**Descriptor:** Sort, name and create familiar shapes; recognise and describe familiar shapes within objects in the environment, giving reasons.

**Learning Intentions**

- Recognise, name, sort and create familiar shapes.
- Find familiar shapes within environmental objects and give a simple reason.

**Success Criteria**

- I can create or sort familiar shapes using visible features.
- I can identify a shape in an object and show why it matches.

**Question Allocation:** Pre-Test 0; Post-Test 10

**Difficulty Mix:** Items must span the form-level difficulty bands and must not repeat one familiar procedure or visual arrangement.

**Reasoning Mix:** Selected items diagnose misconceptions; manipulated items require the student to construct, place, move, transform or explain spatial evidence independently.

**Misconceptions**

- `shape-orientation-invariance`: Shape orientation invariance - Treats a turned or flipped familiar shape as a different shape.
- `shape-colour-size`: Colour or size defines shape - Classifies a shape by colour or size instead of its spatial features.
- `shape-in-object`: Shape within an object - Does not recognise a familiar shape when it appears as one component of an environmental object.
- `classification-single-rule`: Only one classification rule - Assumes a collection can be sorted in only one valid way.

**Curriculum Mapping:** **mapped-unverified**; weeks 1, 2, 3, 7, 8. Mapped to Starpath Weeks 1, 2, 3, 7, 8; full lesson and weekly-quiz coverage must pass before independent-bank authoring.

**Question Blueprint**

- Pre-Test: Not applicable for Foundation.
- Post-Test: Construct a picture meeting two shape conditions.
- Post-Test: Find a shape in a new object and give a visual reason.
- Post-Test: Repair a flawed shape classification.

### AC9MFSP02

**Descriptor:** Describe position and movement of self and objects in relation to other objects and locations within a familiar space.

**Learning Intentions**

- Describe an object's position relative to a named reference.
- Place and move objects using familiar positional and directional language.

**Success Criteria**

- I can place an object where a direction says.
- I can describe where an object is and how it moved.

**Question Allocation:** Pre-Test 0; Post-Test 10

**Difficulty Mix:** Items must span the form-level difficulty bands and must not repeat one familiar procedure or visual arrangement.

**Reasoning Mix:** Selected items diagnose misconceptions; manipulated items require the student to construct, place, move, transform or explain spatial evidence independently.

**Misconceptions**

- `position-without-reference`: Position without a reference - Uses a position word without identifying the object or location it is relative to.
- `viewpoint-left-right`: Viewpoint and left-right - Assumes left and right remain fixed when the viewpoint changes.
- `route-start-order`: Route start and order - Follows or gives correct-looking moves without preserving the starting point and instruction order.

**Curriculum Mapping:** **mapped-unverified**; weeks 4, 5, 6, 7, 8. Mapped to Starpath Weeks 4, 5, 6, 7, 8; full lesson and weekly-quiz coverage must pass before independent-bank authoring.

**Question Blueprint**

- Pre-Test: Not applicable for Foundation.
- Post-Test: Build a small scene from positional instructions.
- Post-Test: Record a position using a word or oral choice after constructing it.
- Post-Test: Carry out and check an ordered movement sequence.

## Year 1

### Form Design

| Form | Questions | Pass | Accessible | Moderate | Challenging | Recall | Understand | Apply | Reason | Transfer | Constructed minimum | Selected maximum |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| pretest | 20 | 85% | 10 | 8 | 2 | 4 | 7 | 6 | 3 | 0 | 12 | 8 |
| posttest | 20 | 85% | 7 | 8 | 5 | 2 | 6 | 7 | 4 | 1 | 12 | 8 |

### AC9M1SP01

**Descriptor:** Make, compare and classify familiar shapes; recognise familiar shapes and objects in the environment, identifying similarities and differences.

**Learning Intentions**

- Make, compare and classify familiar shapes and environmental objects.
- Identify similarities and differences that remain after size, colour or orientation changes.

**Success Criteria**

- I can construct a closed familiar shape.
- I can classify the same collection in more than one valid way and explain the rule.

**Question Allocation:** Pre-Test 12; Post-Test 12

**Difficulty Mix:** Items must span the form-level difficulty bands and must not repeat one familiar procedure or visual arrangement.

**Reasoning Mix:** Selected items diagnose misconceptions; manipulated items require the student to construct, place, move, transform or explain spatial evidence independently.

**Misconceptions**

- `shape-orientation-invariance`: Shape orientation invariance - Treats a turned or flipped familiar shape as a different shape.
- `shape-colour-size`: Colour or size defines shape - Classifies a shape by colour or size instead of its spatial features.
- `shape-feature-count`: Shape feature counting - Miscounts sides, corners or curved boundaries when naming or classifying a shape.
- `shape-in-object`: Shape within an object - Does not recognise a familiar shape when it appears as one component of an environmental object.
- `classification-single-rule`: Only one classification rule - Assumes a collection can be sorted in only one valid way.

**Curriculum Mapping:** **mapped-unverified**; weeks 1, 2, 3, 4, 5, 8. Mapped to Starpath Weeks 1, 2, 3, 4, 5, 8; full lesson and weekly-quiz coverage must pass before independent-bank authoring.

**Question Blueprint**

- Pre-Test: Construct or repair a familiar shape.
- Pre-Test: Sort objects by a stated feature.
- Post-Test: Create two valid classifications for one collection.
- Post-Test: Build a shape and identify a similarity and difference.
- Post-Test: Diagnose a classification that relies on colour rather than shape.

### AC9M1SP02

**Descriptor:** Give and follow directions to move people and objects to different locations within a space.

**Learning Intentions**

- Give and follow ordered directions within a space.
- Create, test and repair routes from a stated starting position.

**Success Criteria**

- I can author directions another person could follow.
- I can find and repair a route step while preserving the destination and constraints.

**Question Allocation:** Pre-Test 8; Post-Test 8

**Difficulty Mix:** Items must span the form-level difficulty bands and must not repeat one familiar procedure or visual arrangement.

**Reasoning Mix:** Selected items diagnose misconceptions; manipulated items require the student to construct, place, move, transform or explain spatial evidence independently.

**Misconceptions**

- `viewpoint-left-right`: Viewpoint and left-right - Assumes left and right remain fixed when the viewpoint changes.
- `route-start-order`: Route start and order - Follows or gives correct-looking moves without preserving the starting point and instruction order.
- `route-destination-only`: Destination-only route - Treats reaching the destination as sufficient when a route misses required checkpoints or constraints.

**Curriculum Mapping:** **mapped-unverified**; weeks 6, 7, 8. Mapped to Starpath Weeks 6, 7, 8; full lesson and weekly-quiz coverage must pass before independent-bank authoring.

**Question Blueprint**

- Pre-Test: Follow a short route from a marked start.
- Pre-Test: Add a missing instruction to reach a goal.
- Post-Test: Construct a route satisfying a checkpoint condition.
- Post-Test: Repair one incorrect move and explain the change.
- Post-Test: Write or record a complete route for another navigator.

## Year 2

### Form Design

| Form | Questions | Pass | Accessible | Moderate | Challenging | Recall | Understand | Apply | Reason | Transfer | Constructed minimum | Selected maximum |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| pretest | 20 | 85% | 8 | 9 | 3 | 3 | 6 | 7 | 4 | 0 | 14 | 6 |
| posttest | 20 | 85% | 6 | 9 | 5 | 2 | 5 | 7 | 5 | 1 | 14 | 6 |

### AC9M2SP01

**Descriptor:** Recognise, compare and classify shapes, referencing the number of sides and using spatial terms such as opposite, parallel, curved and straight.

**Learning Intentions**

- Recognise, compare and classify shapes using sides and spatial terms.
- Use straight, curved, opposite and parallel accurately.

**Success Criteria**

- I can classify unfamiliar orientations using their boundaries.
- I can compare two shapes with correct feature language.

**Question Allocation:** Pre-Test 10; Post-Test 10

**Difficulty Mix:** Items must span the form-level difficulty bands and must not repeat one familiar procedure or visual arrangement.

**Reasoning Mix:** Selected items diagnose misconceptions; manipulated items require the student to construct, place, move, transform or explain spatial evidence independently.

**Misconceptions**

- `shape-orientation-invariance`: Shape orientation invariance - Treats a turned or flipped familiar shape as a different shape.
- `shape-feature-count`: Shape feature counting - Miscounts sides, corners or curved boundaries when naming or classifying a shape.
- `classification-single-rule`: Only one classification rule - Assumes a collection can be sorted in only one valid way.
- `straight-curved-boundary`: Straight and curved boundaries - Treats a curved boundary as a straight side or ignores mixed boundary types.
- `parallel-opposite-confusion`: Parallel and opposite confusion - Interchanges parallel sides with opposite sides or assumes every opposite pair is parallel.

**Curriculum Mapping:** **mapped-unverified**; weeks 1, 2, 3, 4, 8. Mapped to Starpath Weeks 1, 2, 3, 4, 8; full lesson and weekly-quiz coverage must pass before independent-bank authoring.

**Question Blueprint**

- Pre-Test: Mark straight and curved boundaries on a shape.
- Pre-Test: Sort shapes by side and edge properties.
- Post-Test: Construct a shape meeting stated side conditions.
- Post-Test: Compare two unfamiliar shapes and record a valid reason.
- Post-Test: Diagnose an incorrect parallel or opposite claim.

### AC9M2SP02

**Descriptor:** Locate and identify positions of features in two-dimensional representations and move position by following directions and pathways.

**Learning Intentions**

- Locate features in two-dimensional representations of familiar spaces.
- Follow and give pathways using map evidence.

**Success Criteria**

- I can locate a feature from a map and describe its position.
- I can construct or record a pathway that another person can follow.

**Question Allocation:** Pre-Test 10; Post-Test 10

**Difficulty Mix:** Items must span the form-level difficulty bands and must not repeat one familiar procedure or visual arrangement.

**Reasoning Mix:** Selected items diagnose misconceptions; manipulated items require the student to construct, place, move, transform or explain spatial evidence independently.

**Misconceptions**

- `viewpoint-left-right`: Viewpoint and left-right - Assumes left and right remain fixed when the viewpoint changes.
- `route-start-order`: Route start and order - Follows or gives correct-looking moves without preserving the starting point and instruction order.
- `route-destination-only`: Destination-only route - Treats reaching the destination as sufficient when a route misses required checkpoints or constraints.
- `map-symbol-representation`: Map symbol representation - Treats a map symbol as the real object or cannot connect symbols and landmarks through a key.
- `map-viewpoint`: Map viewpoint - Interprets a top-view representation as though it were a front-view scene.
- `map-relative-location`: Relative landmark location - Locates a landmark without preserving its stated relationship to another landmark.

**Curriculum Mapping:** **mapped-unverified**; weeks 5, 6, 7, 8. Mapped to Starpath Weeks 5, 6, 7, 8; full lesson and weekly-quiz coverage must pass before independent-bank authoring.

**Question Blueprint**

- Pre-Test: Locate a named feature using an unfamiliar map key.
- Pre-Test: Follow a pathway and place the endpoint.
- Post-Test: Author a route between two landmarks.
- Post-Test: Place a missing landmark from two clues.
- Post-Test: Diagnose a route that reaches the goal but breaks a condition.

## Year 3

### Form Design

| Form | Questions | Pass | Accessible | Moderate | Challenging | Recall | Understand | Apply | Reason | Transfer | Constructed minimum | Selected maximum |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| pretest | 20 | 85% | 7 | 9 | 4 | 2 | 6 | 7 | 4 | 1 | 16 | 4 |
| posttest | 20 | 85% | 5 | 9 | 6 | 1 | 5 | 7 | 5 | 2 | 16 | 4 |

### AC9M3SP01

**Descriptor:** Make, compare and classify objects, identifying key features and explaining why those features make them suited to their uses.

**Learning Intentions**

- Make, compare and classify objects by key spatial features.
- Connect faces, edges and vertices with suitability for use.

**Success Criteria**

- I can build or classify an object from feature constraints.
- I can justify why an object's features suit a purpose.

**Question Allocation:** Pre-Test 8; Post-Test 8

**Difficulty Mix:** Items must span the form-level difficulty bands and must not repeat one familiar procedure or visual arrangement.

**Reasoning Mix:** Selected items diagnose misconceptions; manipulated items require the student to construct, place, move, transform or explain spatial evidence independently.

**Misconceptions**

- `object-feature-vocabulary`: Object feature vocabulary - Confuses faces, edges and vertices or counts features that are hidden or shared incorrectly.
- `object-use-without-features`: Object use without features - Chooses an object for a use without connecting the decision to spatial features.
- `object-view-consistency`: Object view consistency - Treats front, side and top views as unrelated objects or exposes features that should be hidden.

**Curriculum Mapping:** **mapped-unverified**; weeks 1, 2, 3, 7, 8. Mapped to Starpath Weeks 1, 2, 3, 7, 8; full lesson and weekly-quiz coverage must pass before independent-bank authoring.

**Question Blueprint**

- Pre-Test: Build or select an object from feature information.
- Pre-Test: Compare two objects using faces, edges and vertices.
- Post-Test: Construct an object meeting several feature constraints.
- Post-Test: Choose an object for a purpose and record the spatial reason.
- Post-Test: Infer a hidden feature from consistent views.

### AC9M3SP02

**Descriptor:** Interpret and create two-dimensional representations of familiar environments, locating key landmarks and objects relative to each other.

**Learning Intentions**

- Interpret and create two-dimensional representations of familiar environments.
- Locate landmarks relative to one another and make a readable map.

**Success Criteria**

- I can use a key to interpret an unfamiliar map.
- I can create a map satisfying relative-location clues and use it to navigate.

**Question Allocation:** Pre-Test 12; Post-Test 12

**Difficulty Mix:** Items must span the form-level difficulty bands and must not repeat one familiar procedure or visual arrangement.

**Reasoning Mix:** Selected items diagnose misconceptions; manipulated items require the student to construct, place, move, transform or explain spatial evidence independently.

**Misconceptions**

- `map-symbol-representation`: Map symbol representation - Treats a map symbol as the real object or cannot connect symbols and landmarks through a key.
- `map-viewpoint`: Map viewpoint - Interprets a top-view representation as though it were a front-view scene.
- `map-relative-location`: Relative landmark location - Locates a landmark without preserving its stated relationship to another landmark.
- `route-start-order`: Route start and order - Follows or gives correct-looking moves without preserving the starting point and instruction order.

**Curriculum Mapping:** **mapped-unverified**; weeks 4, 5, 6, 7, 8. Mapped to Starpath Weeks 4, 5, 6, 7, 8; full lesson and weekly-quiz coverage must pass before independent-bank authoring.

**Question Blueprint**

- Pre-Test: Interpret a map key and locate related landmarks.
- Pre-Test: Place landmarks from simple relative clues.
- Post-Test: Create a readable map from several constraints.
- Post-Test: Navigate between landmarks using the completed representation.
- Post-Test: Diagnose and repair a map that violates one clue.

## Year 4

### Form Design

| Form | Questions | Pass | Accessible | Moderate | Challenging | Recall | Understand | Apply | Reason | Transfer | Constructed minimum | Selected maximum |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| pretest | 20 | 85% | 6 | 10 | 4 | 2 | 5 | 7 | 5 | 1 | 17 | 3 |
| posttest | 20 | 85% | 4 | 9 | 7 | 1 | 4 | 7 | 6 | 2 | 17 | 3 |

### AC9M4SP01

**Descriptor:** Represent and approximate composite shapes and objects using combinations of familiar shapes and objects.

**Learning Intentions**

- Represent and approximate composite shapes and objects using familiar components.
- Compare alternative decompositions and infer hidden structure.

**Success Criteria**

- I can create a composite representation from constraints.
- I can explain what an approximation includes, omits or cannot prove.

**Question Allocation:** Pre-Test 7; Post-Test 7

**Difficulty Mix:** Items must span the form-level difficulty bands and must not repeat one familiar procedure or visual arrangement.

**Reasoning Mix:** Selected items diagnose misconceptions; manipulated items require the student to construct, place, move, transform or explain spatial evidence independently.

**Misconceptions**

- `object-view-consistency`: Object view consistency - Treats front, side and top views as unrelated objects or exposes features that should be hidden.
- `composite-decomposition`: Composite decomposition - Assumes a composite form has only one decomposition or overlooks hidden component shapes and objects.
- `approximation-as-exact`: Approximation as exact - Treats an approximate representation as exact or adds detail that the model cannot justify.

**Curriculum Mapping:** **mapped-unverified**; weeks 1, 2, 3, 8. Mapped to Starpath Weeks 1, 2, 3, 8; full lesson and weekly-quiz coverage must pass before independent-bank authoring.

**Question Blueprint**

- Pre-Test: Compose a target form from familiar components.
- Pre-Test: Identify a missing or hidden component from views.
- Post-Test: Create two valid decompositions of one form.
- Post-Test: Improve a flawed approximation and justify the change.
- Post-Test: Coordinate front, side and top evidence.

### AC9M4SP02

**Descriptor:** Create and interpret grid reference systems, using grid references and directions to locate and describe positions and pathways.

**Learning Intentions**

- Create and interpret grid reference systems.
- Use grid references and directions to locate and describe pathways.

**Success Criteria**

- I can construct and label a valid grid reference system.
- I can author an unambiguous grid-referenced pathway.

**Question Allocation:** Pre-Test 6; Post-Test 6

**Difficulty Mix:** Items must span the form-level difficulty bands and must not repeat one familiar procedure or visual arrangement.

**Reasoning Mix:** Selected items diagnose misconceptions; manipulated items require the student to construct, place, move, transform or explain spatial evidence independently.

**Misconceptions**

- `grid-reference-coordinate-order`: Grid reference and coordinate order - Reverses a grid reference or treats Year 4 grid references as Cartesian ordered pairs.
- `grid-path-reference`: Grid pathway references - Names cells correctly but cannot use references and directions together to describe a pathway.
- `route-destination-only`: Destination-only route - Treats reaching the destination as sufficient when a route misses required checkpoints or constraints.

**Curriculum Mapping:** **mapped-unverified**; weeks 4, 5, 8. Mapped to Starpath Weeks 4, 5, 8; full lesson and weekly-quiz coverage must pass before independent-bank authoring.

**Question Blueprint**

- Pre-Test: Locate cells and landmarks from grid references.
- Pre-Test: Complete a pathway using references and directions.
- Post-Test: Create a grid and place landmarks from references.
- Post-Test: Write a pathway for another navigator.
- Post-Test: Repair a route containing a reference error.

### AC9M4SP03

**Descriptor:** Recognise line and rotational symmetry in shapes and create symmetrical patterns and pictures.

**Learning Intentions**

- Recognise and test line and rotational symmetry.
- Create symmetrical patterns and pictures.

**Success Criteria**

- I can construct and test a reflection across a stated line.
- I can create rotational symmetry and identify its matching turns.

**Question Allocation:** Pre-Test 7; Post-Test 7

**Difficulty Mix:** Items must span the form-level difficulty bands and must not repeat one familiar procedure or visual arrangement.

**Reasoning Mix:** Selected items diagnose misconceptions; manipulated items require the student to construct, place, move, transform or explain spatial evidence independently.

**Misconceptions**

- `line-symmetry-visual-balance`: Visual balance versus line symmetry - Accepts a visually balanced design without testing whether corresponding points mirror across the line.
- `rotational-line-symmetry`: Rotational and line symmetry - Assumes line symmetry guarantees rotational symmetry or tests only a full turn.
- `transformation-reference`: Transformation reference - Performs a reflection or rotation without preserving the stated mirror line, centre or angle.

**Curriculum Mapping:** **mapped-unverified**; weeks 6, 7, 8. Mapped to Starpath Weeks 6, 7, 8; full lesson and weekly-quiz coverage must pass before independent-bank authoring.

**Question Blueprint**

- Pre-Test: Complete a reflected half across a stated line.
- Pre-Test: Test a figure at marked rotations.
- Post-Test: Construct line symmetry including a diagonal line.
- Post-Test: Create a rotationally symmetric pattern and record matching turns.
- Post-Test: Diagnose a visually balanced but non-symmetric design.

## Year 5

### Form Design

| Form | Questions | Pass | Accessible | Moderate | Challenging | Recall | Understand | Apply | Reason | Transfer | Constructed minimum | Selected maximum |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| pretest | 20 | 85% | 5 | 10 | 5 | 1 | 5 | 7 | 5 | 2 | 18 | 2 |
| posttest | 20 | 85% | 3 | 9 | 8 | 1 | 3 | 6 | 7 | 3 | 18 | 2 |

### AC9M5SP01

**Descriptor:** Connect objects to their nets and build objects from their nets using spatial and geometric reasoning.

**Learning Intentions**

- Connect objects to nets and build objects from nets.
- Use face adjacency and orientation to test and refine nets.

**Success Criteria**

- I can construct a valid net and predict how it folds.
- I can justify face relationships after folding.

**Question Allocation:** Pre-Test 7; Post-Test 7

**Difficulty Mix:** Items must span the form-level difficulty bands and must not repeat one familiar procedure or visual arrangement.

**Reasoning Mix:** Selected items diagnose misconceptions; manipulated items require the student to construct, place, move, transform or explain spatial evidence independently.

**Misconceptions**

- `net-face-count`: Face count guarantees a net - Assumes any connected arrangement with the right number of faces forms the object.
- `net-adjacency-fold`: Net adjacency after folding - Assumes faces touching in the flat net always touch after folding or misidentifies opposite faces.
- `object-view-consistency`: Object view consistency - Treats front, side and top views as unrelated objects or exposes features that should be hidden.

**Curriculum Mapping:** **mapped-unverified**; weeks 1, 2, 3, 8. Mapped to Starpath Weeks 1, 2, 3, 8; full lesson and weekly-quiz coverage must pass before independent-bank authoring.

**Question Blueprint**

- Pre-Test: Match an object and net using face evidence.
- Pre-Test: Track a labelled face through a fold.
- Post-Test: Create and test a valid net.
- Post-Test: Repair an overlapping or incorrectly adjacent net.
- Post-Test: Compare two valid nets for the same object.

### AC9M5SP02

**Descriptor:** Construct a grid coordinate system that uses coordinates to locate positions within a space; use coordinates and directional language to describe position and movement.

**Learning Intentions**

- Construct and use a grid coordinate system.
- Describe position and movement with coordinates and directional language.

**Success Criteria**

- I can establish axes, origin, scale and coordinate order.
- I can plot, move and describe points consistently.

**Question Allocation:** Pre-Test 6; Post-Test 6

**Difficulty Mix:** Items must span the form-level difficulty bands and must not repeat one familiar procedure or visual arrangement.

**Reasoning Mix:** Selected items diagnose misconceptions; manipulated items require the student to construct, place, move, transform or explain spatial evidence independently.

**Misconceptions**

- `coordinate-order-scale`: Coordinate order and scale - Reverses coordinate order, omits the origin or uses inconsistent axis intervals.
- `coordinate-movement-change`: Coordinate movement change - Changes both coordinates for an axis-aligned move or ignores signed movement across an axis.
- `route-destination-only`: Destination-only route - Treats reaching the destination as sufficient when a route misses required checkpoints or constraints.

**Curriculum Mapping:** **mapped-unverified**; weeks 4, 5, 8. Mapped to Starpath Weeks 4, 5, 8; full lesson and weekly-quiz coverage must pass before independent-bank authoring.

**Question Blueprint**

- Pre-Test: Build axes and plot stated coordinates.
- Pre-Test: Describe one coordinate movement.
- Post-Test: Construct a coordinate system for supplied data.
- Post-Test: Plan and record a constrained coordinate route.
- Post-Test: Diagnose swapped coordinates or inconsistent scale.

### AC9M5SP03

**Descriptor:** Describe and perform translations, reflections and rotations of shapes, using dynamic geometric software where appropriate; recognise what changes and what remains the same, and identify any symmetries.

**Learning Intentions**

- Describe and perform translations, reflections and rotations.
- Recognise invariant features and resulting symmetries.

**Success Criteria**

- I can construct an image under a stated transformation.
- I can explain what changed and what remained invariant.

**Question Allocation:** Pre-Test 7; Post-Test 7

**Difficulty Mix:** Items must span the form-level difficulty bands and must not repeat one familiar procedure or visual arrangement.

**Reasoning Mix:** Selected items diagnose misconceptions; manipulated items require the student to construct, place, move, transform or explain spatial evidence independently.

**Misconceptions**

- `transformation-invariants`: Transformation invariants - Assumes a translation, reflection or rotation changes side lengths, angles or overall size.
- `transformation-reference`: Transformation reference - Performs a reflection or rotation without preserving the stated mirror line, centre or angle.
- `coordinate-movement-change`: Coordinate movement change - Changes both coordinates for an axis-aligned move or ignores signed movement across an axis.

**Curriculum Mapping:** **mapped-unverified**; weeks 6, 7, 8. Mapped to Starpath Weeks 6, 7, 8; full lesson and weekly-quiz coverage must pass before independent-bank authoring.

**Question Blueprint**

- Pre-Test: Perform one stated transformation.
- Pre-Test: Identify invariants from an original and image.
- Post-Test: Construct a reflection or rotation using its reference.
- Post-Test: Compare transformations and justify the classification.
- Post-Test: Repair an image that violates one invariant.

## Year 6

### Form Design

| Form | Questions | Pass | Accessible | Moderate | Challenging | Recall | Understand | Apply | Reason | Transfer | Constructed minimum | Selected maximum |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| pretest | 20 | 85% | 4 | 10 | 6 | 1 | 4 | 6 | 6 | 3 | 19 | 1 |
| posttest | 20 | 85% | 2 | 8 | 10 | 0 | 3 | 6 | 7 | 4 | 19 | 1 |

### AC9M6SP01

**Descriptor:** Compare the parallel cross-sections of objects and recognise their relationships to right prisms.

**Learning Intentions**

- Compare parallel cross-sections of objects.
- Use section behaviour to recognise relationships to right prisms.

**Success Criteria**

- I can predict and construct a cross-section from a stated cut.
- I can use a sequence of sections to justify whether an object behaves like a right prism.

**Question Allocation:** Pre-Test 6; Post-Test 6

**Difficulty Mix:** Items must span the form-level difficulty bands and must not repeat one familiar procedure or visual arrangement.

**Reasoning Mix:** Selected items diagnose misconceptions; manipulated items require the student to construct, place, move, transform or explain spatial evidence independently.

**Misconceptions**

- `cross-section-face`: Cross-section versus face - Assumes every cross-section must match an existing face of the object.
- `parallel-sections-congruent`: Parallel sections are always congruent - Assumes all parallel cuts through any object produce congruent cross-sections.

**Curriculum Mapping:** **mapped-unverified**; weeks 1, 2, 8. Mapped to Starpath Weeks 1, 2, 8; full lesson and weekly-quiz coverage must pass before independent-bank authoring.

**Question Blueprint**

- Pre-Test: Predict a section from cut direction and position.
- Pre-Test: Compare a short sequence of parallel sections.
- Post-Test: Construct sections for an unfamiliar object.
- Post-Test: Infer object structure from changing sections.
- Post-Test: Diagnose the claim that all parallel sections are congruent.

### AC9M6SP02

**Descriptor:** Locate points in the four quadrants of a Cartesian plane; describe changes to the coordinates when a point is moved to a different position in the plane.

**Learning Intentions**

- Locate points in all four quadrants of a Cartesian plane.
- Describe coordinate changes when points move.

**Success Criteria**

- I can plot and record signed ordered pairs, including axis points.
- I can infer and reverse a coordinate movement rule.

**Question Allocation:** Pre-Test 6; Post-Test 6

**Difficulty Mix:** Items must span the form-level difficulty bands and must not repeat one familiar procedure or visual arrangement.

**Reasoning Mix:** Selected items diagnose misconceptions; manipulated items require the student to construct, place, move, transform or explain spatial evidence independently.

**Misconceptions**

- `coordinate-order-scale`: Coordinate order and scale - Reverses coordinate order, omits the origin or uses inconsistent axis intervals.
- `coordinate-movement-change`: Coordinate movement change - Changes both coordinates for an axis-aligned move or ignores signed movement across an axis.
- `quadrant-sign`: Quadrant signs and axes - Ignores coordinate signs or assigns a point on an axis to a quadrant.

**Curriculum Mapping:** **mapped-unverified**; weeks 3, 4, 8. Mapped to Starpath Weeks 3, 4, 8; full lesson and weekly-quiz coverage must pass before independent-bank authoring.

**Question Blueprint**

- Pre-Test: Plot points across four quadrants.
- Pre-Test: Describe an axis-aligned coordinate change.
- Post-Test: Construct a multi-quadrant path from constraints.
- Post-Test: Infer a movement rule from original and image points.
- Post-Test: Diagnose sign, axis or coordinate-order errors.

### AC9M6SP03

**Descriptor:** Recognise and use combinations of transformations to create tessellations and other geometric patterns, using dynamic geometric software where appropriate.

**Learning Intentions**

- Use ordered combinations of transformations.
- Create and justify tessellations and geometric patterns.

**Success Criteria**

- I can construct a transformation chain in order.
- I can create a tessellation with no gaps or overlaps and describe its transformations.

**Question Allocation:** Pre-Test 8; Post-Test 8

**Difficulty Mix:** Items must span the form-level difficulty bands and must not repeat one familiar procedure or visual arrangement.

**Reasoning Mix:** Selected items diagnose misconceptions; manipulated items require the student to construct, place, move, transform or explain spatial evidence independently.

**Misconceptions**

- `transformation-invariants`: Transformation invariants - Assumes a translation, reflection or rotation changes side lengths, angles or overall size.
- `transformation-reference`: Transformation reference - Performs a reflection or rotation without preserving the stated mirror line, centre or angle.
- `transformation-order`: Transformation order - Assumes changing the order of combined transformations cannot change the result.
- `tessellation-gap-overlap`: Tessellation gaps and overlaps - Treats any repeated decorative pattern as a tessellation without checking gaps and overlaps.

**Curriculum Mapping:** **mapped-unverified**; weeks 5, 6, 7, 8. Mapped to Starpath Weeks 5, 6, 7, 8; full lesson and weekly-quiz coverage must pass before independent-bank authoring.

**Question Blueprint**

- Pre-Test: Apply a two-step transformation chain.
- Pre-Test: Test whether a pattern tessellates.
- Post-Test: Create and describe a tessellation from a transformation rule.
- Post-Test: Compare reversed transformation sequences.
- Post-Test: Repair a pattern with a gap, overlap or broken invariant.

## Current Production Blocker

The former Ground Starpath lesson-reuse post-test is retained as a retired legacy implementation and is not reachable through production resolution. Ground Starpath Post-Test Version 1.0 uses the approved independent 20-item Assessment Bank.

All Starpath levels remain release-blocked until the required audits and independent item reviews are complete.
