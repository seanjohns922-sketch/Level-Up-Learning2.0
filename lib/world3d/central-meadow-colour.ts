// Mix in linear colour space before lighting, preserving texture and shadows.
// Both the buildable meadow and its outer rim share the valley's warm grass green.
// Compress the photographic texture contrast so it suits the painted backdrop.
export const CENTRAL_MEADOW_MAP_FRAGMENT = `#include <map_fragment>
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.18, 0.28, 0.025), 0.5);`;
