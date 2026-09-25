# Measurelands Level 3 detail restoration

Tool: built-in `image_gen.imagegen` (no CLI/API fallback).

Final PNG masters: `masters/section-1.png` through `masters/section-4.png`.
Runtime WebP exports: `public/images/measurelands-level3-detail/section-1.webp`
through `section-4.webp`. All are native 887 × 1774, with no enlargement.
Original artwork remains untouched. Reference quarter crops were prepared from
`public/images/measurelands-panorama-y3-360-4k.jpg`; only the generated outputs
supply the new detail. The full-wrap and uncropped-reference trials were rejected.

## Final prompt for sections 1 and 4

Edit target: this exact portrait image is already the CORRECT CROP of a game panorama. Restore crisp sharp native detail to this exact tile. Output same 1:2 portrait aspect ratio, highest native resolution. Strictly preserve exact framing, scale, ALL object positions, mountain silhouettes, skyline heights, colours, horizon, lighting and perspective. Do NOT reframe, zoom, shift, stretch or change the design. This tile must join adjacent panorama tiles; treat the outermost 5% on all sides as composition-locked, maintaining exactly the same objects and colours there. Replace blurry enlarged pixels with clean detailed wood joints, stone blocks, foliage, cobblestones, garden plants, grasses and clear measuring instruments and recognisable villagers. Preserve the warm golden-hour light and polished stylised 3D game aesthetic. Do not add or remove any features or people. Deep focus. No blur, no depth-of-field, no smearing, no halos, no additional text. This is detail restoration, not scene generation.

## Final prompt for sections 2 and 3

Edit target: this exact portrait image is already the CORRECT CROP of a game panorama. Restore crisp sharp native detail to this exact tile. Output same 1:2 portrait aspect ratio, highest native resolution. Strictly preserve the exact framing, scale, ALL object positions, skyline heights, silhouettes, colours, horizon, lighting and perspective. Do NOT reframe, zoom, shift, stretch or change the design. In particular the partial house at the [right for section 2 / left for section 3] edge must remain cut at EXACTLY the same place and height; this tile must join its neighbouring panorama tiles. Treat the outermost 5% on all sides as composition-locked, maintaining exactly the same objects and colours there. Replace blurry enlarged pixels with clean detailed stone blocks, timber beams, roof tiles, cobblestones, flower leaves, grasses and clear measuring instruments. Preserve the warm golden-hour light and polished stylised 3D game aesthetic. Do not add or remove any features. No blur, no depth-of-field, no smearing, no halos. [Section 3 only: The existing small wooden sign must read exactly "Measurelands" on line 1 and "Level 3" on line 2, keeping its existing size and position.] This is detail restoration, not scene generation.
