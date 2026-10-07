# Card artwork and print production

For all future collectible-card creation or updates, read and follow
`docs/cards/PRINT-SPEC.md`. These are the user's confirmed supplier requirements,
not optional defaults. Keep print masters separate from web/app exports.

# Assessment realm presentation

For every new assessment realm and every five-form review, use that realm's shared
`getRealmTheme` tokens throughout: header, form tabs, dropdowns, question cards,
answer choices and selected/hover/focus states, question navigation, progress,
read-aloud, Back/Next/Finish, “I don’t know”, review details and result panels.
Do not carry Number Nexus teal/cyan styling into other realms. Preserve colours
that are mathematical evidence inside diagrams. Check the whole assessment screen,
including selected and disabled states, before handing it over for manual review.

Every piece of student-facing question wording must have a nearby read-aloud
control: prompts, answer choices, diagram labels, captions, units and instructions.
A labelled “Read diagram” button may narrate a whole panel in a sensible order.
Narrate only information available visually, without revealing hidden answers.
Use the shared read-aloud component and verify coverage across all five forms.

Before drawing or sourcing assessment artwork, inspect the realm's existing
weekly-lesson assets and reuse them wherever they accurately illustrate the
question. Preserve controlled geometry for measured quantities and comparisons.

Assessment visuals must depict the named object recognisably (ribbon, pencil,
container, etc.), rather than using a generic bar labelled as that object. Reuse
lesson artwork when suitable, or shared object renderers with precise measurement
geometry. Check this across all five forms at every level and realm. Fabric or
object details must not change measured endpoints, scale or mathematical evidence.

At each assessment level, explicitly inspect the existing lesson components and
artwork first. Prefer reuse over new drawings where the asset accurately presents
the skill; check actual image contents rather than trusting filenames.

Student login RPC releases: student sessions run under Supabase anon with the
validated x-student-session header. Preserve explicit anon/authenticated EXECUTE
grants and existing access guards. Test new endpoints under the actual student
role with a valid session and reject missing/cross-student sessions; postgres-role
migration checks alone are insufficient. Roll back all test session fixtures.

# RELIQ brand terminology

The product is RELIQ; the company is BrightUp Education. Collectible cards are
called **RELIQS** (one **RELIQ card**) in student-facing copy, navigation,
collection labels, rewards, and read-aloud text. Gems remain **Gems**. Preserve character names and
rarity terms such as Legendary. Do not rename internal Legend identifiers,
existing /legends URLs, LUL codes, storage keys or database fields for branding.

# Security follow up after program completion

The user deferred the security audit and hardening work until the program is
finished, expected a few weeks after 5 October 2026. The saved plan is in
`docs/SECURITY_FOLLOW_UP.md`. When program completion or wider rollout is being
reviewed, surface this outstanding checklist. No automatic reminder is scheduled;
do not treat this note as authorization to change production security settings.

# Remaining rebrand work deferred

On 5 October 2026, the user deferred the remaining rebrand work for a few weeks
until the final Boldly Creative branding and assets arrive. Keep the deployed
RELIQ name and RELIQS card wording in place. Do not resume brand redesign, asset
replacement, Realmies retirement or domain migration unless the user resumes
the work. When resumed, review the final wordmark/font, visual consistency across
all roles and outputs, favicon/social assets, separate print artwork, Realmies
retirement and the chosen domain/email migration. No automatic reminder is set.
