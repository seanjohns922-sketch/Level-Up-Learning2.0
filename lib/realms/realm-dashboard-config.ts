import { REALM_REGISTRY, type CanonicalRealmId } from "./realm-registry";

export type RealmLevelId = "Prep" | "Year 1" | "Year 2" | "Year 3" | "Year 4" | "Year 5" | "Year 6";

export type RealmDistrictConfig = {
  id: string;
  title: string;
  weeks: number[];
  description: string;
  positionKey: string;
  themeVariant?: string;
};

export type RealmDistrictPosition = {
  order?: number;
  gridColumn?: string;
  gridRow?: string;
  justifySelf?: "start" | "center" | "end" | "stretch";
  alignSelf?: "start" | "center" | "end" | "stretch";
  maxWidth?: string;
};

export type RealmDashboardTheme = {
  primary: string;
  secondary: string;
  accent: string;
  panel: string;
  text: string;
  mutedText: string;
  backgroundAsset: string | ((level: RealmLevelId) => string);
  overlay: string;
  glow: string;
};

export type RealmDashboardConfig = {
  realmId: CanonicalRealmId;
  slug: string;
  displayName: string;
  shortName: string;
  totalWeeks: number;
  districts: RealmDistrictConfig[] | Partial<Record<RealmLevelId, RealmDistrictConfig[]>>;
  districtPositions?: Record<string, RealmDistrictPosition>;
  weekLabels?: Partial<Record<number, string>>;
  weeklyQuizWeeks: number[];
  hasPretest: boolean | ((level: RealmLevelId) => boolean);
  hasPosttest: boolean | ((level: RealmLevelId) => boolean);
  theme: RealmDashboardTheme;
  labels: {
    continueAction: string;
    currentPath: string;
    levelName: (level: RealmLevelId) => string;
  };
  routes: {
    dashboard: string;
    lesson: string;
    pretest: string;
    posttest: string;
    quiz: string;
  };
};

function districtSets(config: RealmDashboardConfig): RealmDistrictConfig[][] {
  return Array.isArray(config.districts)
    ? [config.districts]
    : Object.values(config.districts).filter((districts): districts is RealmDistrictConfig[] => Boolean(districts));
}

export function getRealmDistricts(config: RealmDashboardConfig, level: RealmLevelId): RealmDistrictConfig[] {
  return Array.isArray(config.districts) ? config.districts : (config.districts[level] ?? []);
}

export function getRealmBackground(config: RealmDashboardConfig, level: RealmLevelId): string {
  return typeof config.theme.backgroundAsset === "function"
    ? config.theme.backgroundAsset(level)
    : config.theme.backgroundAsset;
}

export function defineRealmDashboardConfig(config: RealmDashboardConfig): RealmDashboardConfig {
  const registered = REALM_REGISTRY[config.realmId];
  if (registered.totalWeeks != null && registered.totalWeeks !== config.totalWeeks) {
    throw new Error(`${registered.name} must use its registered ${registered.totalWeeks}-week journey`);
  }
  if (!Number.isInteger(config.totalWeeks) || config.totalWeeks < 1) {
    throw new Error(`${config.displayName} must define a positive totalWeeks value`);
  }

  for (const quizWeek of config.weeklyQuizWeeks) {
    if (!Number.isInteger(quizWeek) || quizWeek < 1 || quizWeek > config.totalWeeks) {
      throw new Error(`${config.displayName} quiz week ${quizWeek} is outside its journey`);
    }
  }

  for (const districts of districtSets(config)) {
    const ids = new Set<string>();
    const assignedWeeks = new Set<number>();
    for (const district of districts) {
      if (ids.has(district.id)) throw new Error(`${config.displayName} repeats district id ${district.id}`);
      ids.add(district.id);
      if (!district.weeks.length) throw new Error(`${district.title} must contain at least one week`);
      for (const week of district.weeks) {
        if (!Number.isInteger(week) || week < 1 || week > config.totalWeeks) {
          throw new Error(`${district.title} contains invalid week ${week}`);
        }
        if (assignedWeeks.has(week)) throw new Error(`${config.displayName} assigns week ${week} to multiple districts`);
        assignedWeeks.add(week);
      }
    }
  }

  return config;
}
