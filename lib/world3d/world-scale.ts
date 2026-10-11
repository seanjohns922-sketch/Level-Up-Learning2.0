/** Shared world-space dimensions. Saved grid coordinates and connection ports stay fixed. */
export const WORLD_AVATAR_SCALE = 0.9;
export const WORLD_AVATAR_REFERENCE_HEIGHT = 2.2 * WORLD_AVATAR_SCALE;
// Both avatar renderers use the same foot pivot, below the movement origin.
export const WORLD_AVATAR_FOOT_Y = -0.73;
export const WORLD_AVATAR_SCALE_OFFSET = WORLD_AVATAR_FOOT_Y * (1 - WORLD_AVATAR_SCALE);
export const TRAIN_WORLD_SCALE = 1.8;
export const TRAIN_CARRIAGE_SPACING = 5.2;
export const TRAIN_RAIL_HALF_GAUGE = 0.28 * TRAIN_WORLD_SCALE;
export const TRAIN_RAIL_Y = 0.13;
// Building only: a wider, taller station with a shallow platform-side plan.
// Depth is deliberately authored independently so old 5x3 sites remain valid.
export const STATION_BUILDING_SCALE: [number, number, number] = [1.85, 1.85, 1.15];
export const STATION_BUILDING_Z = -1.65;
export const STATION_DOOR_CLEARANCE = 1.3 * STATION_BUILDING_SCALE[1];
export const STATION_ROOF_HEIGHT = 2.755 * STATION_BUILDING_SCALE[1];
