import { useSyncExternalStore } from "react";

const subscribeNever = () => () => {};

/**
 * False during the server render and the first hydration pass, true after.
 * Pages that build their first screen from browser-only data (random questions,
 * saved progress) render a loading state until this is true, so the server and
 * browser agree and the browser never has to throw the page away and redraw it.
 */
export function useInBrowser() {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
}
