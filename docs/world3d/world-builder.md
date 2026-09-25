# World builder refresh

The top toolbar keeps Library, Undo, Move home, Start fresh and Done visible.
The narrower library separates free building pieces from owned marketplace items.
Move and Erase work in either library tab. Library can be hidden for more building
space. Zoom sits with the camera controls, and Turn/Place only appear when useful.
Keyboard movement pauses while the reset dialog is open; the native modal traps
focus, supports Escape, and focuses Keep building when opened.

Start fresh clears placed objects and all editable ground (including starter
paths), preserving the current home location and permanent world scenery. It
writes an explicit empty ground array so reload does not recreate starter paths.
Ownership, rewards, XP and other student/preview storage scopes are unchanged.
Reset records one normal undo snapshot. Closing and reopening the editor retains
history; reloading/leaving the world does not. The existing history holds 30 edits.

Local browser checks covered the library, hiding/showing it, the reset confirmation,
cancellation, clearing the visible ground, and Undo restoring the layout. Desktop
visual review completed; narrow-screen styles are implemented but still need a
physical phone/tablet review. No production layouts were reset.

Validation:
- `node scripts/central-world-3d-audit.mjs`
- `npm run qa:central-world-home`
- `node --no-warnings --experimental-strip-types --experimental-loader ./scripts/typescript-alias-loader.mjs scripts/central-world-reset-test.mjs`
- Targeted ESLint and TypeScript.

## Library overflow correction

The library now uses constrained, equal-width card columns with wrapping names.
Category buttons are compact; only the results list scrolls at normal viewport
heights, leaving the category and search controls visible. Very short viewports
allow the outer panel to scroll as a fallback. Owned items also use a wrapping
card grid. Desktop browser review included the last Fortress rows (Carved Stone
Planter, Stone Garden Seat and Garden Window Arch) with all labels visible and
filters remaining in place during scrolling.
