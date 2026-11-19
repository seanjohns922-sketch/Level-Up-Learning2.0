// A visual hop above the grounded player; never changes terrain or gate checks.
export const WORLD_JUMP_DURATION = 0.72;
export const WORLD_JUMP_HEIGHT = 1.25;
/** power scales the hop: height grows with power, air time with its square root (like a real bounce). */
export type WorldJumpState = { elapsed: number; power: number };
const duration = (state: WorldJumpState) => WORLD_JUMP_DURATION * Math.sqrt(state.power);
export const createWorldJump = (): WorldJumpState => ({ elapsed: WORLD_JUMP_DURATION, power: 1 });
export function isWorldJumpGrounded(state: WorldJumpState) {
  return state.elapsed >= duration(state);
}
export function startWorldJump(state: WorldJumpState, power = 1) {
  if (!isWorldJumpGrounded(state)) return false;
  state.power = Math.max(0.1, power);
  state.elapsed = 0;
  return true;
}
export function resetWorldJump(state: WorldJumpState) {
  state.power = 1;
  state.elapsed = WORLD_JUMP_DURATION;
}
export function advanceWorldJump(state: WorldJumpState, delta: number) {
  const total = duration(state);
  state.elapsed = Math.min(total, state.elapsed + Math.max(0, Math.min(delta, 0.05)));
  const progress = state.elapsed / total;
  return 4 * WORLD_JUMP_HEIGHT * state.power * progress * (1 - progress);
}
