> REVERTED: The user requested the original realm appearance be restored. The visual changes described below are no longer active.

# Number Nexus level visual pass

The approved Counting District foreground is reused for the city-style Number Nexus levels, not as a universal realm theme.

- Levels 4–6 receive level-specific masonry, paving, window and energy colours; upper-level workshop rooflines grow taller. Level 3's district layout stays unchanged.
- City arrivals now have detailed foreground architecture across Levels 3–6. Buildings and parapets are outside the movement boundary, and the rear civic hall is moved behind the playable area. City layouts do not instantiate the district's three week pavilions.
- Ground and Levels 1–2 retain their single adventure portal and open layout. After user feedback, the proposed surrounding city buildings were removed. They receive a more readable portal frame and a single instanced paving batch instead.
- Ground retains its original Number Nexus city panorama, teal lighting and city adventure portal. The garden experiment was reverted at the user’s request; Number Nexus is a city at every level.
- No other realm's architecture or curriculum routes were changed.

## Review evidence

Safari local preview: Ground low quality, Level 6 city low quality, Level 4 Counting District high quality. Ground after removing buildings: 60 FPS, 52 draws, 7,572 triangles, 2 textures. Level 4 district observed 60 FPS, 85 draws, 35,590 triangles, 12 textures. These are local desktop observations, not sustained mobile-device benchmarks.

Navigation, level-mode, art-boundary, return-context and Counting District collision checks passed during the pass. TypeScript and targeted lint passed before the final early-level surface adjustment; final validation is recorded in the task response.

The four remaining Number Nexus district interiors now use the same detailed street and pavilion system. Other realms are outside this pass.

## Ground return-link correction

The garden review exposed an existing lesson-home Back button that bypassed the shared 3D return helper and dropped preview mode. `RealmLessonHome` now uses `goBackToProgram`, matching the active lesson shell. Its ordinary program fallback also retains teacher preview. No completion, progress or student-session logic changed.

## Remaining district interiors

Number Bridge, Calculation Core, Mastery Sector and Legend Tower now replace the grey grid/blockout environment across Levels 3–6. Their landmarks are a viaduct, energy works, academy and bronze-crowned tower respectively. All preserve Number Nexus city panoramas, level materials, warm windows and teal energy details. Ground–Level 2 stay on their guided city route.

Week IDs, coordinates, lesson routes and progression rules are unchanged. The pavilion renderer and collision boxes use the actual gate list, including Mastery's two weeks and Legend Tower's single week. District movement now stays within the detailed street, including the return beam at z=25.5, instead of allowing movement beyond the placeholder floor. Tests cover one-, two- and three-pavilion entrance approaches, wall blocking, camera clearance and the return avenue.

Local Safari review: Number Bridge Level 4 low, 60 FPS / 81 draws / 15,698 triangles; Calculation Core Level 5 low, 60 FPS / 78 draws / 15,178 triangles. These are local desktop observations, not device guarantees. TypeScript, targeted lint, art, level-mode, navigation and return-context checks passed.

Additional visual checks: Mastery Sector Level 3 high quality (60 FPS, 63 draws, 32,078 triangles), Legend Tower Level 6 low quality after reducing the landmark height so its crown fits the arrival view (60 FPS, 52 draws, 13,954 triangles). All four district previews show the correct week count and locked states for the initial student progression.
