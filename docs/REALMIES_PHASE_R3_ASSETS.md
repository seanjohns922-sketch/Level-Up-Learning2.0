# Realmies Phase R3 Artwork

## Production Set

The first standard Realmie collection now has 18 standalone transparent PNG
renders:

- six Numbot evolutions in `public/realmies/number`
- six Meazurex evolutions in `public/realmies/measurement`
- six Geospin evolutions in `public/realmies/space`

Every file uses a 1200 x 1600 transparent canvas, full-body framing, consistent
three-quarter presentation and no card frame, environment or pedestal.

## Catalogue Registration

`20260731102000_register_realmie_production_assets.sql` maps every stable R2
catalogue key to one production path and changes its asset status from
`missing` to `ready`.

Locked collection tiles should derive their silhouette from the same alpha
asset. This avoids maintaining a second artwork file that can drift from the
canonical figure.

## Student Availability

Only Number Nexus and Measurelands collections are live for production
students. Starpath is registered as `coming_soon`: the collection UI should
show a locked Starpath realm section but must not expose Geospin figures or
allow them to be selected, favourited or displayed until Starpath launches.
The artwork remains prepared so launch does not require another asset phase.

The client must read
`get_realmie_collection_availability_secure()` rather than inferring launch
status from whether an artwork path exists.

## Generation Record

The renders were generated in reference-guided image-generation mode from the
approved Hall of Legends character fronts. The prompt standard required a
premium stylised 3D collectible, centered full-body three-quarter view,
eye-level camera, consistent scale, soft studio lighting, clean silhouette,
flat chroma background, and no text, card frame, scene or pedestal. Chroma was
then removed locally and the alpha channel was validated.

Run `npm run qa:realmies-r3-assets` to verify all 18 paths, dimensions,
transparency and catalogue registrations.
