/** Approved Year 8 programme lengths; availability is controlled separately. */
export const LEVEL8_WEEK_COUNTS = {number:12,measurement:12,space:10,pattern:12,statistics:10,chance:10} as const;
export type Level8Realm = keyof typeof LEVEL8_WEEK_COUNTS;
export const isLevel8Realm = (value:string):value is Level8Realm => Object.hasOwn(LEVEL8_WEEK_COUNTS,value);
