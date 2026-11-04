# Collectible card print specification

Confirmed by the user on 14 September 2026. Applies to **all future cards** unless
the user explicitly supplies revised printer requirements.

| Property | Required value |
| --- | --- |
| Finished / trimmed card | **63 × 88 mm**, portrait |
| Bleed | **3 mm on every side** |
| Master artwork / PDF page | **69 × 94 mm** |
| Trim position | Centred; 3 mm from each master-page edge |
| Raster artwork resolution | **300 DPI at final print size** |
| Print colour | **CMYK** |
| Final supplier format | **PDF** |
| Important content | Safely inside the trim line |

Production rules:

- Extend the background across the full 69 × 94 mm canvas. Bleed is artwork,
  not a white border or an enlarged crop of the finished card.
- Set the PDF MediaBox/BleedBox to 69 × 94 mm and TrimBox to the centred
  63 × 88 mm area. Do not add crop marks outside the required page size unless
  the supplier requests them.
- Use a conservative **4 mm safe inset inside trim** for names, sentences,
  attributes, card numbers, logos and other important content. This is a project
  production choice; the supplier's requirement is to stay safely inside trim.
- At 300 DPI, the bleed canvas rounds to **815 × 1110 pixels**. Exact physical
  dimensions are controlled by the PDF page boxes, not rounded pixel counts.
- Keep text vector-based in the print PDF and embed fonts. For the simplified
  Number Nexus backs, use readable type of at least 10.5 pt for informational
  text, with larger names and attribute values.
- Use the supplier's CMYK ICC profile when provided. If no profile is supplied,
  document the profile used; do not claim a supplier-specific press proof or
  PDF/X certification without verification.
- Check both page geometry and visual rendering before handing off the PDF.
- Export separate **RGB PNGs** without bleed for the Legends app. Do not use
  CMYK files as browser artwork. Keep transparent avatar cutouts separate.

## Current Number Nexus design brief

Updated by the user on 4 November 2026. The approved direction is a new sci-fi
Numbot family: emerald/teal armour, silver trim, graphite joints, mint eyes and
energy cores, with springy Bouncer through the three-fin flight-equipped
Equationator. Keep each stage distinct and recognisably part of this family.

- Front: full-art realm illustration, name, stage, level and three attributes;
  clean cream typography and a consistent near-black charcoal attribute strip.
- Back: shared black/charcoal clocktower artwork with white RELI and a
  Number Nexus-coloured castle Q. No character attributes on the back.
- Number attributes: Calculation / Speed / Accuracy. User-confirmed progression:
  Ground 10/10/10; L1 20/25/15; L2 35/40/30; L3 50/55/45;
  L4 65/70/60; L5 80/85/75; L6 95/100/90. These supersede old card values.
- Display review previews at trimmed size. Clearly label any bleed-page proof.
- Keep web cutouts separate from card artwork; never use CMYK PDFs as web assets.
- Preserve original assets and use versioned replacement paths.

Approved transparent teal guide assets are in `public/guides/numbot-teal-2026-11-04-v1/`.
The prior emerald sci-fi pack remains preserved for recovery. Card fronts and
realm backs now use trimmed sRGB exports in `public/cards/approved-2026-11-04-v1/`.
The original CMYK proofs are unchanged. Existing unlock/showcase videos still
contain the old artwork and require separate replacements. Browser integration
does not constitute supplier approval of print masters.
