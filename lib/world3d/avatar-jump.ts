// A visual hop above the grounded player; never changes terrain or gate checks.
export const WORLD_JUMP_DURATION = 0.72;
export const WORLD_JUMP_HEIGHT = 1.25;
export type WorldJumpState = { elapsed: number };
export const createWorldJump = (): WorldJumpState => ({ elapsed: WORLD_JUMP_DURATION });
export function startWorldJump(state: WorldJumpState) {
  if (state.elapsed < WORLD_JUMP_DURATION) return false;
  state.elapsed = 0;
  return true;
}
export function resetWorldJump(state: WorldJumpState) {
  state.elapsed = WORLD_JUMP_DURATION;
}
export function advanceWorldJump(state: WorldJumpState, delta: number) {
  state.elapsed = Math.min(WORLD_JUMP_DURATION, state.elapsed + Math.max(0, Math.min(delta, 0.05)));
  const progress = state.elapsed / WORLD_JUMP_DURATION;
  return 4 * WORLD_JUMP_HEIGHT * progress * (1 - progress);
}
