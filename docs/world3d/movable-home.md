# Movable home and editable paths

In Edit World, **Move My Home** picks up the one permanent home. Arrows or a ground tap position the preview; Turn rotates it in 90-degree steps. Place commits; Cancel, changing tools, or closing the editor discards the preview. The Move tool can also select the home by its footprint. It cannot be deleted or stamped into duplicates. Undo restores its saved transform.

The home uses a 7×7-cell footprint plus a three-cell landing strip in front of its doorway. Placement rejects occupied cells, water under the building or landing, protected tower/arrival cells, grid boundaries, and entrances outside the playable movement bounds/ellipse. Subsequent object placement protects the landing; paths can reach it, but water cannot cover it. The old house location is released when the house moves.

All home rendering, nearby interaction detection, Home teleport, return-from-home spawn and arrival camera orientation derive from the same placement transform. Moving the house moves the avatar to its new landing. The main tower remains fixed.

Starter tower/home routes migrate to ordinary editable ground tiles. Erase and painting apply to them outside the protected tower approach, central arrival space, and occupied home footprint. Existing paths stay in place after a house move; students can erase or extend them themselves. There is no automatic path generation that can overwrite student painting.

## Storage

This uses the existing browser-local world storage, scoped by student ID, with a separate `demo-preview` scope. It does not sync between devices. The home is a singleton entry in `lul:central-world:layout:v1:<scope>`, with a default placement for older saves. Ground writes use `lul:central-world:ground:v2:<scope>`; missing v2 data combines the starter paths and legacy v1 paint, with legacy paint winning. An empty v2 array means intentionally cleared ground and never re-seeds paths. Legacy storage is retained.

## Verification

- `npm run qa:central-world-home`: runtime tests for transforms, rotations, grid and reachable-entry bounds, collision in both directions, water, freed old location, singleton persistence, corruption fallback, scope isolation, path migration and erased-path reloads.
- `npm run qa:central-world3d`
- `npm run qa:world3d-return`
- Browser: move and rotate, cancel, save/reload, Home shortcut, enter/return, erase/repaint a starter path, Undo; check the green/red preview and disabled Place state.
