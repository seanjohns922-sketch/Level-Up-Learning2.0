# Starpath Level 4 Build Plan

## Status

- Curriculum: Australian Curriculum Version 9.0, Year 4 Space
- Program: `y4-space`
- Scope: 8 weeks, 24 lessons, 7 weekly quizzes and a Week 8 mastery sequence
- Build status: approved curriculum spine; implementation blueprint
- Assessment status: the independent Level 4 Pre-Test and Post-Test remain part of the later Starpath assessment rebuild

## Curriculum authority

- **AC9M4SP01:** Represent and approximate composite shapes and objects in the environment, using combinations of familiar shapes and objects.
- **AC9M4SP02:** Create and interpret grid reference systems using grid references and directions to locate and describe positions and pathways.
- **AC9M4SP03:** Recognise line and rotational symmetry of shapes and create symmetrical patterns and pictures, using dynamic geometric software where appropriate.

The Year 4 achievement standard requires students to represent and approximate shapes and objects, create and interpret grid references, identify line and rotational symmetry in plane shapes, and create symmetrical patterns.

## Learning progression

**represent -> construct -> approximate -> reference -> author pathways -> reflect -> rotate -> integrate**

Level 4 must feel different from Level 3. Level 3 students classify objects, assemble predetermined models, create landmark maps and steer a rover. Level 4 students make spatial decisions: they choose and arrange components, accept that more than one construction can be valid, create reference systems, author instructions for another navigator, test transformations and revise designs against constraints.

## Experience rules

1. Recognition may introduce a concept, but it cannot be the dominant evidence of weekly mastery.
2. Composite and symmetry weeks must require construction, testing and revision.
3. Open construction means the child chooses components and positions. Recoloured fixed sockets do not qualify.
4. Open construction remains mathematically bounded: grids, legal rotations, component inventories and explicit constraints make validation deterministic.
5. A wrong submission identifies the failed condition without revealing the completed answer.
6. Every lesson contains one short teaching segment, three rotating curriculum activities and one reflection through the existing Starpath lesson shell.
7. Difficulty changes the spatial demand, not merely the number of distractors.
8. Weekly quiz items use an independent bank with new contexts, wording, layouts and visual scaffolding.
9. Grid references identify cells. Axes, origins and ordered coordinate pairs are reserved for Level 5.
10. Explanations must be evidenced through a decision, construction, correction or matched reason. A canned explanation-only multiple-choice item is not sufficient evidence.

## Mechanic contracts

### 1. Grid Reference Map

**Purpose:** Extend the Level 3 map canvas with labelled rows and columns.

**Student actions:** read a reference, tap a cell, assign a reference, label a blank grid, place landmarks and inspect routes.

**Validation:** resolve every cell to one canonical letter-number reference; reject reversed order, line intersections and inconsistent labels.

**Difficulty controls:** grid size, visible labels, number of landmarks, reference-to-place versus place-to-reference direction, and route constraints.

**Reuse:** `StarpathMapCard`, `StarpathMapCreateCard`, map landmarks and existing route visuals.

### 2. Grid Route Author

**Purpose:** Make expressive navigation, not route following, the Year 4 lift.

**Student actions:** select a start and destination, add directional moves, insert referenced checkpoints, run the route, locate the first fault and revise it.

**Validation:** simulate the authored commands; verify destination, required checkpoints, boundaries, obstacles and route-order constraints.

**Difficulty controls:** route length, turns, optional routes, ordered checkpoints, blocked cells and ambiguous instructions.

**Non-example:** choosing one of three prewritten routes for the whole lesson.

### 3. Composite Canvas

**Purpose:** Support genuine composition and more than one valid representation.

**Student actions:** choose pieces, place them on a bounded canvas, rotate where legal, remove, replace, compare and submit.

**Two-dimensional validation:** compare occupied target regions or explicit design constraints rather than exact piece coordinates. A target may have several stored or generated decompositions.

**Three-dimensional validation:** use an isometric cube lattice or constrained solid placements. Validate component counts, occupied positions, support, silhouette and stated front/side/top views.

**Difficulty controls:** component inventory, irrelevant pieces, legal overlap, allowed rotations, hidden cubes, number of constraints and whether the target or only the brief is visible.

**Non-example:** matching a supplied piece to one glowing socket.

### 4. Model Comparison Lab

**Purpose:** Assess approximation and evaluation without collapsing into recognition.

**Student actions:** compare two models against a purpose, identify the decisive feature, repair a flawed model and explain the effect through a linked reason.

**Validation:** require a two-stage response: make or select the spatial decision, then connect it to a valid reason. Higher tasks require a direct edit before submission.

**Difficulty controls:** number of preserved features, competing strengths, irrelevant detail, missing features and purpose-specific criteria.

### 5. Symmetry Studio

**Purpose:** Provide one shared workspace for line and rotational symmetry.

**Student actions:** place and remove tiles, draw or select a symmetry line, reflect components, choose a centre, rotate a design, test matches and revise a pattern.

**Line validation:** compare every occupied cell or feature with its reflected partner across a vertical, horizontal or diagonal line and preserve colour or symbol where relevant.

**Rotation validation:** transform every occupied position around the stated centre for the required quarter-turn or half-turn and compare the transformed design with the original.

**Difficulty controls:** line orientation, line position, incomplete side, distractor features, centre location, turn amount, pattern density and whether the student completes or creates the design.

**Preview priority:** diagonal reflection and rotation about non-default centres require dedicated validator and mobile interaction passes.

## Eight-week lesson blueprint

## Week 1: Composite Shapes

**Descriptor:** AC9M4SP01  
**Weekly outcome:** Construct and compare complex two-dimensional environmental shapes using familiar components.

### Lesson 1: Shapes Within Shapes

**Learning intention:** Identify familiar components that can represent a complex shape.

**Mission:** Analyse damaged station logos and vehicle outlines so they can be rebuilt.

**Activity rotation:**

1. **Component Scan:** mark all familiar shapes that could form a complex outline, including rotated components.
2. **Useful or Decorative:** sort candidate components by whether they preserve an important feature of the target.
3. **Outline Repair:** add the missing component to complete a recognisable environmental shape.

**Mastery evidence:** identifies components by geometry rather than colour, orientation or decoration.

### Lesson 2: Build the Outline

**Learning intention:** Choose and arrange familiar shapes to construct a target outline.

**Mission:** Rebuild communication badges and spacecraft silhouettes from a component inventory.

**Activity rotation:**

1. **Target Build:** cover a target region using available pieces.
2. **Limited Supply:** build the target while respecting component-count constraints.
3. **Brief Build:** construct from written and visual conditions without a complete ghost outline.

**Mastery evidence:** independently selects, rotates and positions components; no fixed sockets.

### Lesson 3: Different Builds, Same Shape

**Learning intention:** Compare and create different valid decompositions of the same composite shape.

**Mission:** Prove that two repair crews can produce the same external design in different ways.

**Activity rotation:**

1. **Build It Another Way:** create a second valid decomposition after viewing the first.
2. **Same Boundary Check:** decide whether two constructions represent the same outer shape and demonstrate the mismatch when they do not.
3. **Efficient Build:** satisfy a purpose-specific condition such as fewest pieces or a required component.

**Mastery evidence:** understands that the same composite boundary can have multiple valid decompositions.

**Week 1 quiz:** 15 independent items; 5 per lesson. At least 8 items require construction, correction or spatial comparison.

## Week 2: Composite Objects

**Descriptor:** AC9M4SP01  
**Weekly outcome:** Construct composite objects and reason between a model and its visible or hidden structure.

### Lesson 1: Combine the Solids

**Learning intention:** Combine familiar objects to make a more complex environmental object.

**Mission:** Assemble functional orbital equipment from cubes, prisms, cylinders, cones and spheres.

**Activity rotation:**

1. **Open Assembly:** choose and place solids to satisfy a two- or three-condition brief.
2. **Component Budget:** construct with a limited inventory and at least one irrelevant solid.
3. **Test the Object:** revise a model that rolls, tips or fails a stated design condition.

**Mastery evidence:** component choice and arrangement both contribute to the valid solution.

### Lesson 2: Build from a View

**Learning intention:** Connect a composite object with its front, side and top views.

**Mission:** Reconstruct cargo modules from remote camera scans.

**Activity rotation:**

1. **View to Build:** create a cube structure that matches one stated view.
2. **Two-View Constraint:** build a structure satisfying both front and side views.
3. **Camera Check:** rotate or inspect a completed structure and identify which view verifies the build.

**Mastery evidence:** uses more than one view when one view alone is insufficient.

### Lesson 3: Hidden Structure

**Learning intention:** Infer components that must exist even when they are not visible.

**Mission:** Make elevated station structures physically possible before launch.

**Activity rotation:**

1. **What Is Hidden?:** add cubes required behind or beneath visible cubes.
2. **Could This Stand?:** diagnose unsupported or impossible structures.
3. **Smallest Valid Build:** construct the fewest-cube object that matches supplied views and support rules.

**Mastery evidence:** infers hidden structure from support and multiple-view evidence, not visual guessing.

**Week 2 quiz:** 15 independent items; 5 per lesson. Include at least 3 hidden-structure items and 3 two-view items.

## Week 3: Approximate and Represent

**Descriptor:** AC9M4SP01  
**Weekly outcome:** Create useful approximations and evaluate them against purpose rather than decorative similarity.

### Lesson 1: Simplify the Form

**Learning intention:** Select familiar components that preserve the defining features of a complex form.

**Mission:** Convert detailed survey images into clear symbols for a mission display.

**Activity rotation:**

1. **Feature Keeper:** mark the features that must survive simplification.
2. **Remove the Noise:** remove decorative pieces without losing the identity or purpose of the representation.
3. **Choose the Components:** assemble a component set before constructing the model.

**Mastery evidence:** distinguishes defining spatial features from irrelevant detail.

### Lesson 2: Create the Model

**Learning intention:** Construct an approximation that communicates a real object clearly.

**Mission:** Design map icons, mission logos and simplified models for the Starpath base.

**Activity rotation:**

1. **Icon Maker:** create a recognisable symbol with a limited shape palette.
2. **Model from a Brief:** preserve specified features such as wide base, pointed top or paired panels.
3. **Audience Test:** revise a model after a simulated user confuses it with another object.

**Mastery evidence:** the model meets explicit communication conditions and is not judged by one pixel-perfect answer.

### Lesson 3: Evaluate the Representation

**Learning intention:** Judge, explain and improve how well an approximation serves its purpose.

**Mission:** Audit competing designs before they are installed across the station.

**Activity rotation:**

1. **Better for the Job:** compare two plausible models, choose using stated criteria, then connect the decisive reason.
2. **Find the Lost Feature:** identify what a flawed model fails to communicate.
3. **Improve and Prove:** edit the weaker model and verify that the failed criterion now passes.

**Mastery evidence:** every reasoning task includes a spatial decision or revision before the explanation.

**Week 3 quiz:** 15 independent items; 5 per lesson. Include at least 5 two-stage judgment items and 3 model-repair items.

## Week 4: Grid Reference Systems

**Descriptor:** AC9M4SP02  
**Weekly outcome:** Read, create and validate cell-based grid reference systems.

### Lesson 1: Read the Grid

**Learning intention:** Use row and column labels in a consistent order to identify cells.

**Mission:** Decode a newly overlaid sector grid on an orbital map.

**Activity rotation:**

1. **Reference to Cell:** locate references such as B3 on varied grids.
2. **Cell to Reference:** generate the reference for a marked feature.
3. **Reference Debug:** correct reversed, line-based or inconsistently ordered references.

**Mastery evidence:** moves fluently in both directions between cell and reference.

### Lesson 2: Locate the Feature

**Learning intention:** Use grid references to communicate precise landmark locations.

**Mission:** Coordinate rescue supplies across crowded station and festival maps.

**Activity rotation:**

1. **Find the Landmark:** locate a named feature from its reference.
2. **Report the Position:** assign references to landmarks in a busy scene.
3. **Overlay Advantage:** compare location descriptions before and after a grid is added and repair the ambiguous message.

**Mastery evidence:** uses references because they remove ambiguity, not merely because labels are visible.

### Lesson 3: Build the Grid System

**Learning intention:** Create a labelled grid system another navigator can interpret.

**Mission:** Add a reliable sector system to a map that currently has landmarks but no references.

**Activity rotation:**

1. **Label the Grid:** assign consistent row and column labels.
2. **Place and Report:** place mission features, then publish their references.
3. **Navigator Test:** diagnose and repair a grid with missing, duplicated or inconsistent labels.

**Mastery evidence:** creates a complete, unambiguous system and tests it from another user's perspective.

**Week 4 quiz:** 15 independent items; 5 per lesson. No axes, origins, signed values or ordered pairs.

## Week 5: Pathways on Grids

**Descriptor:** AC9M4SP02  
**Weekly outcome:** Author, test and revise precise pathways using directions and grid references.

### Lesson 1: Reference to Reference

**Learning intention:** Trace and describe movement between referenced locations.

**Mission:** Move cargo between station sectors while keeping track of referenced locations.

**Activity rotation:**

1. **Trace the Dispatch:** follow directions and report visited references.
2. **Missing Reference:** complete a route log by identifying an unstated checkpoint.
3. **Route Replay:** compare a written route with the path actually travelled and locate the first disagreement.

**Mastery evidence:** coordinates direction, distance and referenced position throughout a route.

### Lesson 2: Write the Path

**Learning intention:** Create precise grid-referenced directions another navigator can follow.

**Mission:** Author rover instructions for a partner who cannot see the planned path.

**Activity rotation:**

1. **Command Builder:** create a route from start to destination using direction and distance commands.
2. **Checkpoint Instructions:** include specified grid references in the correct order.
3. **Partner Run:** run the authored route on a clean map and revise any ambiguity or error.

**Mastery evidence:** authors complete directions; selecting a prewritten route is not sufficient.

### Lesson 3: Route Under Constraints

**Learning intention:** Compare, debug and improve pathways against stated constraints.

**Mission:** Plan safe routes around closed sectors while visiting mission checkpoints.

**Activity rotation:**

1. **Constraint Planner:** author any route satisfying destination, obstacle and checkpoint rules.
2. **First Fault:** find and repair the earliest command that makes a supplied route invalid.
3. **Which Route Fits?:** compare valid routes against a purpose such as fewest turns, required visit or safe zone; justify using route evidence.

**Mastery evidence:** validates the whole route and distinguishes shortest from most suitable.

**Week 5 quiz:** 15 independent items; 5 per lesson. At least 7 items require authored, completed or repaired directions.

## Week 6: Line Symmetry

**Descriptor:** AC9M4SP03  
**Weekly outcome:** Test, complete and create designs with vertical, horizontal and diagonal line symmetry.

### Lesson 1: Mirror Match

**Learning intention:** Test whether corresponding features match across a proposed line of symmetry.

**Mission:** Verify station emblems before they are transmitted to both sides of the fleet.

**Activity rotation:**

1. **Fold Test:** inspect paired features across a stated line.
2. **Line Investigator:** test several candidate lines and retain every valid one.
3. **Symmetry Fault:** identify the first unmatched position and move or remove the faulty feature.

**Mastery evidence:** uses corresponding position and equal distance, not overall visual balance.

### Lesson 2: Complete the Reflection

**Learning intention:** Construct the missing part of a line-symmetric design.

**Mission:** Restore damaged solar-panel mosaics from their surviving halves.

**Activity rotation:**

1. **Vertical Restore:** reflect tiles across a vertical line.
2. **Horizontal Restore:** reflect a multi-feature design across a horizontal line.
3. **Diagonal Restore:** place corresponding tiles across a diagonal line and test the result.

**Mastery evidence:** places every reflected feature in its exact corresponding position.

### Lesson 3: Create a Symmetric Picture

**Learning intention:** Create and justify an original line-symmetric pattern or picture.

**Mission:** Design a fleet insignia that passes a specified symmetry brief.

**Activity rotation:**

1. **One-Line Design:** create a picture with a required line orientation.
2. **Two-Line Challenge:** create a design satisfying two stated symmetry lines.
3. **Design Audit:** exchange the line position or add a constraint, then revise the design so every condition remains true.

**Mastery evidence:** creates rather than copies and passes transformation-based validation.

**Week 6 quiz:** 15 independent items; 5 per lesson. Include construction across vertical, horizontal and diagonal lines.

## Week 7: Rotational Symmetry

**Descriptor:** AC9M4SP03  
**Weekly outcome:** Test shapes under rotation and create patterns that match during a full turn.

### Lesson 1: Turn and Test

**Learning intention:** Determine whether a shape matches itself after a stated rotation about a centre.

**Mission:** Test docking symbols that must remain recognisable as a station turns.

**Activity rotation:**

1. **Half-Turn Test:** rotate a design 180 degrees and compare it with the original.
2. **Quarter-Turn Test:** test 90-degree turns about a clearly marked centre.
3. **False Match Debug:** identify why a near-symmetric design fails after rotation and repair it.

**Mastery evidence:** tracks both the centre and turn amount; a full turn alone is not accepted as evidence.

### Lesson 2: Record the Matches

**Learning intention:** Test and record which rotations produce the same image.

**Mission:** Calibrate rotating navigation markers for different station sectors.

**Activity rotation:**

1. **Turn Recorder:** physically test quarter, half and three-quarter turns and record the matches.
2. **Centre Matters:** compare the same design rotated around different stated centres.
3. **Predict then Test:** predict a match, run the rotation and correct the prediction using visual evidence.

**Mastery evidence:** records matching turns from tested transformations. Formal rotational-order vocabulary is optional enrichment.

### Lesson 3: Create a Turning Pattern

**Learning intention:** Construct and justify a rotationally symmetric digital pattern.

**Mission:** Create a rotating star-gate design from one repeated motif.

**Activity rotation:**

1. **Repeat the Motif:** place transformed copies around a centre to complete a pattern.
2. **Pattern Creator:** build an original pattern that matches after a required turn.
3. **Symmetry Audit:** test every stated turn, locate a failing feature and revise the pattern.

**Mastery evidence:** creates, tests and revises a pattern; tessellation-style visuals may be used without introducing the Year 6 theory of transformation combinations.

**Week 7 quiz:** 15 independent items; 5 per lesson. Include at least 5 construction or repair items and multiple stated centres.

## Week 8: Symmetric Grid World

**Descriptors:** AC9M4SP01, AC9M4SP02 and AC9M4SP03  
**Weekly outcome:** Apply all three descriptors in one connected spatial design mission.

### Lesson 1: Decode the Design Brief

**Learning intention:** Translate a multi-part brief into testable composite, location and symmetry constraints.

**Mission:** Prepare the official plan for a new orbital research base.

**Activity rotation:**

1. **Constraint Sort:** connect each requirement to the object, grid or symmetry evidence needed.
2. **Conflict Finder:** identify two design choices that cannot both satisfy the brief and repair one.
3. **Build Order:** sequence the construction, placement, route and symmetry checks so later work remains valid.

**Mastery evidence:** coordinates requirements rather than solving three isolated mini-problems.

### Lesson 2: Build the World

**Learning intention:** Construct a referenced world that satisfies composite and symmetry conditions.

**Mission:** Build the base, place its structures in referenced sectors and create its required symmetric signal system.

**Activity rotation within one persistent design:**

1. **Construct:** make the required composite structures from available components.
2. **Position:** place structures and checkpoints on a labelled grid.
3. **Connect:** author a valid route and complete the symmetric beacon or emblem.

**Mastery evidence:** one saved design state is used across all three activities; passing one condition cannot compensate for failing another.

### Lesson 3: Audit and Explain

**Learning intention:** Test a complete spatial design and justify revisions with evidence.

**Mission:** Conduct the launch-readiness audit before the base becomes operational.

**Activity rotation:**

1. **Object Audit:** test composition, approximation and required views.
2. **Navigation Audit:** run references and authored pathways from a clean starting state.
3. **Symmetry Audit:** perform the required reflection or rotation, repair failures and submit the complete world.

**Mastery evidence:** independently locates and repairs failures across a connected design.

**Week 8:** no weekly quiz and no attempt to unlock Week 9. Lesson 3 completion exposes the Level 4 Post-Test when that independent assessment bank is implemented.

## Weekly quiz blueprint

Every quiz contains exactly 15 valid questions in a 5-5-5 allocation across that week's lessons and retains the canonical 80% pass threshold.

| Quiz | Lesson 1 allocation | Lesson 2 allocation | Lesson 3 allocation | Required expressive evidence |
| --- | ---: | ---: | ---: | --- |
| Week 1 | 5 | 5 | 5 | alternate decomposition, correction or constrained construction |
| Week 2 | 5 | 5 | 5 | multi-view or hidden-structure inference |
| Week 3 | 5 | 5 | 5 | two-stage judgment or model repair |
| Week 4 | 5 | 5 | 5 | reference generation and system debugging |
| Week 5 | 5 | 5 | 5 | authored, completed or repaired directions |
| Week 6 | 5 | 5 | 5 | reflected construction across varied line orientations |
| Week 7 | 5 | 5 | 5 | rotation testing, construction or repair |

Quiz banks may assess the same learning intentions as lessons, but must not reuse lesson prompts, layouts, answer sets, landmark arrangements, target designs or exact interaction sequences.

## Risk-ordered implementation sequence

Implementation order is intentionally different from teaching order.

### Slice 1: Grid references

1. Extend map task types with row and column labels.
2. Build read, locate, label and debug modes.
3. Add Grid Route Author and command simulation.
4. Preview Weeks 4-5 on desktop and mobile before lesson wiring.

**Exit gate:** references resolve consistently in both directions; authored routes survive replay and invalid routes identify the first failed condition.

### Slice 2: Composite construction

1. Build the open two-dimensional Composite Canvas.
2. Prove multiple valid decompositions for each target family.
3. Add isometric cube or constrained-solid construction.
4. Build deterministic front, side and top projections.
5. Add Model Comparison Lab and repair interactions.
6. Preview Weeks 1-3 before lesson wiring.

**Exit gate:** no mastery lesson depends on fixed sockets; valid alternative constructions pass; invalid overlap, support and view conditions fail correctly.

### Slice 3: Symmetry Studio

1. Build vertical and horizontal reflection validation.
2. Add diagonal reflection and preview touch targeting.
3. Add half-turn and quarter-turn transforms around stated centres.
4. Add pattern creation, test and repair modes.
5. Preview Weeks 6-7 before lesson wiring.

**Exit gate:** validators are covered by generated cases and inverse checks; mobile placement remains precise; visual matches and mathematical matches agree.

### Slice 4: Integration and content wiring

1. Wire all 21 Weeks 1-7 lessons and their independent quizzes.
2. Build the persistent Week 8 world state.
3. Wire all three Week 8 lessons without a weekly quiz.
4. Register Level 4 lesson content and implemented flags only after each route passes validation.

## Preview gates

Each new mechanic must be previewed before curriculum content is bulk-authored.

- Desktop: 1440 x 900
- Tablet: 1024 x 768
- Mobile: 390 x 844
- Longest prompt and label variants
- Correct, wrong, reset, retry and completed states
- Keyboard focus and accessible labels
- Read-aloud content that describes the mathematical task without reading the answer
- No clipped palette, obscured grid labels, shifting board dimensions or overlapping controls
- At least one easy, medium and hard generated task inspected manually

The following receive an additional focused preview pass:

- alternative composite decompositions
- two-view and hidden-cube validation
- diagonal reflections
- quarter-turn rotations
- rotation around a non-default centre
- Week 8 persistent state across all three activities

## Automated validation

Before Level 4 is marked implemented:

1. TypeScript and ESLint pass.
2. Every lesson route builds a teaching task and three valid rotating activity generators.
3. Generated composite tasks have at least one solution and every declared alternative validates.
4. Generated view tasks agree with the canonical model projections.
5. Every grid reference maps to exactly one cell and every generated pathway is replayable.
6. Every symmetry task passes its intended transform and fails controlled near-miss mutations.
7. Seven quizzes build exactly 15 questions with a 5-5-5 lesson split.
8. Quiz prompts, layouts and item identities are independent from lesson tasks.
9. Quiz pass threshold remains 80% and canonical saving and progression are unchanged.
10. Week 7 advances to Week 8; Week 8 does not attempt to unlock Week 9.
11. Level 4 Post-Test visibility is gated after `y4-space-w8-l3`, without building or reusing assessment questions in this phase.

## Definition of done

Level 4 is complete only when a student can:

- construct more than one valid representation of a composite shape;
- build and reason about composite objects from multiple views, including hidden structure;
- create and improve a purposeful approximation;
- create and interpret a labelled grid reference system;
- author and debug directions that another navigator can follow;
- test and create line-symmetric designs, including diagonal symmetry;
- test stated rotations and create a rotationally symmetric pattern; and
- combine all three descriptors in one persistent, validated Week 8 world.

Completion is demonstrated through construction, testing, correction and transfer, not through recognition alone.

## External review questions

Before implementation begins, the reviewer should challenge these decisions directly:

1. Does every lesson demand Year 4 spatial reasoning, or is any activity only a Level 3 interaction with new labels?
2. Are the Composite Canvas constraints open enough to allow genuine choice while remaining deterministic and solvable?
3. Do the view and hidden-structure tasks stay within AC9M4SP01 rather than becoming an unsupported technical detour?
4. Does Week 3 collect genuine evaluation evidence through comparison and repair rather than explanation-shaped multiple choice?
5. Is authoring directions the dominant Week 5 skill, with route following retained only as its prerequisite?
6. Do line and rotational symmetry tasks require a transformation test, construction or repair?
7. Are diagonal reflection, quarter-turn rotation and centre handling specified precisely enough to implement without visual approximations?
8. Does Week 8 preserve one connected student design across composite, grid, route and symmetry checks?
9. Are weekly quiz interactions sufficiently independent from lesson activities while still measuring the same learning intentions?
10. Is any planned content leaking Level 5 coordinates or Level 6 transformation-combination theory?
