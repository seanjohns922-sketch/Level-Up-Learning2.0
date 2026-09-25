# Central valley backdrop

The final direction preserves the original stylised adventure-game world. The first photographic treatment was rejected as too real beside the tower. The selected artwork uses clear layered foliage, broad mountain facets, rounded rocks, softer light and selective surface detail.

## Assets and generation

Generated with the built-in image-generation tool. Final runtime assets live in `public/images/central-valley-stylised/`: `section-1.webp` through `section-6.webp` plus matching `-lite.webp` derivatives. Full-detail sections retain their native 1774 × 887 pixels; lightweight exports are 888 × 444. WebP conversion and downsampling use Sharp; no artificial enlargement is counted as detail.

Six sections, each covering 60 degrees plus 15 degrees of overlap, supply about 8,515 horizontal samples after the overlap crop. This is a segmented panorama, not an 8192 × 4096 source image. High and medium use the native sections; low quality and smaller texture limits use lightweight sections. Only the chosen set is requested. The original panorama remains available for comparison and rollback.

The central-only shader blends wrap boundaries in one opaque draw, follows the camera horizontally, and leaves depth clear for buildings and scenery. It uses narrow overlap bands and mirrors sections 2 and 5 to align rising/falling valley slopes. The shared realm panorama renderer is unchanged.

The foreground and outer meadow share a slightly brighter, fresher green material tint (`#cdddba`) to match the stylised valley while preserving the existing grass texture and shadows. The outer meadow fades beyond 106 m. A low terrain ridge, instanced rocks and a few trees sit outside the editable grid. Fog is gentler to avoid the previous pale strip between grass and backdrop.

## Final prompt

The hero river section was restyled from its photographic draft using the original valley as a style reference, preserving the river, skyline, sun and border composition. The remaining five sections used that corrected hero as the style reference with this prompt:

> Use case: style-transfer. Image 1 is the edit target: one section of a cylindrical game panorama. Image 2 is the REQUIRED finished art style reference. Restyle image 1 to exactly the polished stylised 3D adventure-game language of image 2: crisp readable shapes, soft broad mountain facets, rounded layered conifer foliage, warm green meadow slopes with selective simple grass clumps, smooth rounded granite, gentle golden lighting, clean soft cream clouds. The user rejected photographic realism. Remove photographic microtexture, excessive snow and geological noise. Preserve image 1's composition, skyline height at both borders, land slopes and any river course; no new sun disc. Keep the sky blue and the grass a natural warm green. Dimensional, premium and coherent with a chunky sandstone tower and block-style avatar. No blur, no photograph, no UI, no buildings, no people or text. Exactly 2:1 landscape at highest native resolution.

## Review and checks

Open `/demo-review/central-panorama` to compare the original and corrected stylised artwork with identical camera controls and hub geometry, inspect all six directions, and select lightweight mode.

Run `node --no-warnings --experimental-strip-types --experimental-loader ./scripts/typescript-alias-loader.mjs scripts/central-valley-panorama-test.mjs` for native image dimensions, file budgets, texture-limit fallback, UV bounds and wrap-boundary continuity. Mathematical blend continuity is separate from visual art review.
