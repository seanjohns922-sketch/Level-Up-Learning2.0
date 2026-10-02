/** Level-specific demo curriculum lengths; earlier levels retain their contracts. */
export const CAVE7_WEEK_COUNTS = {number:12,measurement:12,space:10,pattern:12,statistics:10,chance:8} as const;
export type Cave7Realm = keyof typeof CAVE7_WEEK_COUNTS;
export const cave7Realm = (value:string):value is Cave7Realm => Object.hasOwn(CAVE7_WEEK_COUNTS,value);
export const cave7WeekCount = (realm:string) => cave7Realm(realm)?CAVE7_WEEK_COUNTS[realm]:0;
export const CAVE7_NAMES = {number:'Number Nexus',measurement:'Measurelands',space:'Starpath',pattern:'Pattern Peaks',statistics:'Statistica',chance:'Chance Hollow'} as const;
