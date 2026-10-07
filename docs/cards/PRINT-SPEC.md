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

The user rejected the redesign that mixed other realms into Number Nexus.
Keep Number Nexus's own Numbot robot and arithmetic identity. Use original
Number Nexus artwork as the identity and theme reference. Newer realm artwork
may inform illustration quality, detail and polish only; do not import its
character anatomy, costumes or realm-specific props. The precise upgraded look
is pending visual review; no replacement style has been approved.

- Front: avatar artwork with a subtle Number Nexus background; no small print,
  statistics, badges, title or decorative card frame.
- Back: character name and level, three prominent attributes, card number, and
  one short sentence. No dense rules or lore paragraphs.
- Attribute values must match the canonical Legends data in `data/legends.ts`.
- Preserve original assets or use versioned paths when replacing a collection.

The Number Nexus visual brief is specific to that redesign; the physical print
specification above applies to every future card.
