# World scale contract

World geometry uses metres; the editor uses two-metre grid cells. Item land reservation and visual size are separate. Do not shrink a model to make an undersized catalogue footprint pass validation.

## October 2026 correction

The recurring mismatch came from three independent behaviours: the station bypassed the common sizing wrapper, railway models were authored at miniature scale, and the general wrapper silently reduced models to their plot size. Transforming geometry bounding boxes also exaggerated rotated roofs, which could trigger more shrinkage. Six released realm buildings were missing from the saved measurement audit.

`lib/world3d/world-scale.ts` owns the avatar, station and railway dimensions. The moving avatar is 90% of its former size, with its feet kept at the same ground pivot. The station building has a 2.405 m door clearance and a roughly 5.10 m roof. Its existing 5 × 3 grid reservation and track endpoints are preserved. Train units are 1.8 times their original geometry size; track gauge, rail elevation and carriage spacing use the same contract.

`SizedWorldModel` measures actual transformed vertices, including instances. Ordinary models use their authored target size, independently of plot width. Fixed connector models preserve their native scale and origin. Explicit realm-building footprints prevent stale catalogue metadata from reducing their reserved land.

The complete audit covers 174 catalogue assets, plus the alternate village and realm building designs checked by the geometry suites. Reviewed prop corrections include the well, wooden gate, stone wall, trellis, stone seat and sundial. Railway vehicles intentionally extend beyond their placement anchor; their operating envelope is checked on the connected route instead of forcing them into a two-metre square.

No saved placement coordinates, item identifiers, ownership, rail centre lines or station connection ports are migrated. Short loops can display fewer carriages: the route is sampled for conservative body overlap around bends and wraparound. Ownership is unchanged, and the controls explain how to display the complete train. These checks do not simulate articulated wheel bogies or collisions between independently placed trains.

## Review and regression checks

1. Open `/demo-review/world-art` on the local development server. Use **scale comparison** for the actual avatar beside representative objects, **all items** for individual inspection, and **railway** for the production placement and moving-train renderer.
2. After model or sizing changes, use **Measure all 174 models**, wait for completion and download the JSON. Replace `docs/world3d/item-scale-measurements.json` with those measurements. Do not manually adjust recorded dimensions to make a test pass.
3. Run `npm run qa:world-scale`. It checks catalogue coverage, intended dimensions, footprint compatibility, selected human proportions, station/train geometry, route endpoints, save/reload, and the free, infrastructure, village and realm model suites. The measurement file is a browser-generated snapshot; rerender it when geometry changes.
4. Visually inspect representative small props, furniture, doors, buildings and the moving train against the actual avatar. In the railway view, check straight track, bends and the station stop. Keep wide carriage spacing unless a replacement also passes corner and return-track overlap checks.
5. Refresh changed marketplace artwork from the actual models. Run the production build; `qa:world-scale` is part of `prebuild`.

The comparison uses the standard explorer outfit. Hair, hats and other avatar accessories can extend beyond its nominal reference height. Existing player-built track layouts keep their original curve radii; this release does not rebuild them into larger railway curves.
