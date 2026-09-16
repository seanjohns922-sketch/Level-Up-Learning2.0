# Shared assessment layout

Current and future assessments should use `AssessmentShell` and the shared `AssessmentWorkspace` for separate visuals and answers. On screens at least 900px wide, ordinary diagrams appear on the left and responses plus “I don't know” on the right, inside one light panel. Back and Next/Finish sit immediately below. On narrow screens, evidence precedes the response in a single column.

`AssessmentQuestionCard` applies the workspace to its existing visual/response renderers without changing scoring or answer handlers. Custom renderers with separate evidence and controls should use `AssessmentWorkspace` directly (as Number Level 3 does). Integrated construction and placement tasks retain their canvas; their skip control sits inside the question area. Timetables, calendars, paired diagrams and other wide tasks retain full width using `wide`.

Use realm theme tokens. Retain visible units, dimension labels, prompt narration and diagram/option read-aloud controls. Trim empty SVG bounds instead of clipping diagram content. Do not shrink protractors, tables or interactive hit targets to force them onto one screen.

Verification for this change: production build and existing assessment regression checks; rendered question panels; laptop and phone viewport checks. The Level 7 triangle and angle-choice examples fit with navigation visible at 1366×768. The 390px-wide triangle screen has no horizontal overflow and stacks naturally. Larger paired diagrams may still require vertical scrolling.
