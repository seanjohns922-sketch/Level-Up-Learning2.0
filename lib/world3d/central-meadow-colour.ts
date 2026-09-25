// Shared world-aligned meadow colouring. Ground and rim have the same UV mapping,
// so broad shaded grass and sunlit yellow-green patches continue across the join.
export const CENTRAL_MEADOW_SHADER_COMMON = `
float meadowHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float meadowNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(meadowHash(cell), meadowHash(cell + vec2(1.0, 0.0)), f.x),
             mix(meadowHash(cell + vec2(0.0, 1.0)), meadowHash(cell + vec2(1.0, 1.0)), f.x), f.y);
}
`;
export const CENTRAL_MEADOW_MAP_FRAGMENT = `#include <map_fragment>
#ifdef USE_MAP
  float meadowPatch = 0.25 * meadowNoise(vMapUv * 1.8) + 0.45 * meadowNoise(vMapUv * 9.0) + 0.30 * meadowNoise(vMapUv * 31.0);
  float meadowLight = smoothstep(0.22, 0.78, meadowPatch);
  float meadowDetail = clamp(dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722)) * 4.0 + 0.6, 0.72, 1.20);
  diffuseColor.rgb = mix(vec3(0.13, 0.235, 0.006), vec3(0.255, 0.345, 0.012), meadowLight) * meadowDetail;
#endif`;
