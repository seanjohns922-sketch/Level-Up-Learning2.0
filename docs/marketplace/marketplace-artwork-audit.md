# Marketplace Artwork Audit

## Current Architecture

- Catalogue, ownership, pricing and equip identity use `economy_items.item_key`.
- The marketplace previously used `economy_items.icon` for every non-pet card.
- Pets already use `PetArt` and avatar preview already uses `StudentAvatar`.
- Home themes already store their image path in `economy_items.metadata.image`.
- Cards and preview previously had separate rendering branches.

## Migration Result

| State | Count | Rendering source |
| --- | ---: | --- |
| Avatar and clothing products | 29 | Isolated wearable on cards; item equipped on the student in preview |
| Pet products | 10 | Pet alone on cards; pet beside the student in preview |
| Home-theme backgrounds | 8 | Existing image assets |
| Furniture | 2 | Isolated object on cards; object placed in the Explorer Study in preview |
| Effects | 1 | Isolated effect on cards; effect around the student in preview |
| Titles | 1 | Isolated badge on cards; badge displayed with the student in preview |
| Missing approved artwork | 0 | Strict unavailable fallback remains active |
| Total listed products | 51 | 51 visualised, 0 unavailable |

The four previously unavailable products now use approved transparent assets:

- `/marketplace/furniture/crystal-study-lamp.png`
- `/marketplace/furniture/data-display-shelf.png`
- `/marketplace/effects/energy-sparks.png`
- `/marketplace/titles/master-measurer.png`

`20260720180000_marketplace_artwork_assets.sql` supersedes the temporary guard by restoring purchasing and recording each canonical asset, alt text and contextual preview mode.

## Source Of Truth

`resolveMarketplaceVisual(item)` resolves every visual from the same economy item object used for purchase and equip operations. `MarketplaceItemImage` renders that result in both card and preview contexts. Missing or broken assets produce an explicit unavailable state and never fall back to another icon or item.

No pricing, rarity, inventory, ownership or equipped-item records are changed by this visual migration. Only the four guarded products have their original purchasable state restored now that approved artwork exists.
