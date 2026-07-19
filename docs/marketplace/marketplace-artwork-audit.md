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
| Avatar and clothing products | 29 | Student avatar plus item metadata layer |
| Pet products | 10 | Pet species artwork |
| Home-theme backgrounds | 8 | Existing image assets |
| Effects | 0 | No approved asset yet |
| Titles | 0 | No approved asset yet |
| Missing approved artwork | 4 | Unavailable, purchase blocked |
| Total listed products | 51 | 47 visualised, 4 unavailable |

The unavailable products are `home_crystal_lamp`, `home_data_shelf`, `trail_energy_sparks`, and `title_master_measurer`. They remain registered but cannot be purchased until approved transparent artwork is supplied.

## Source Of Truth

`resolveMarketplaceVisual(item)` resolves every visual from the same economy item object used for purchase and equip operations. `MarketplaceItemImage` renders that result in both card and preview contexts. Missing or broken assets produce an explicit unavailable state and never fall back to another icon or item.

No pricing, rarity, inventory, ownership or equipped-item records are changed by this visual migration.
