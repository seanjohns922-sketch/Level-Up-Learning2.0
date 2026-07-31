"use client";

import { isDemoPreviewMode } from "@/lib/demo-mode";
import { supabase } from "@/lib/supabase";

export type RealmieRealm = "number" | "measurement";
export type RealmieRarity = "common" | "rare" | "epic" | "legendary";

export type Realmie = {
  id: string;
  realmie_key: string;
  display_name: string;
  realm_id: RealmieRealm;
  category: string;
  character_key: string;
  rarity: RealmieRarity;
  lore_text: string;
  unlock_rule_type: string;
  collection_order: number;
  asset_path: string;
  silhouette_asset_path: string;
  asset_status: string;
  owned: boolean;
  earned_at: string | null;
  unlock_source: string | null;
  favourite: boolean;
  display_slot: number | null;
  unlock_clue: string;
};

export type RealmieDisplaySlot = {
  slot_number: number;
  realmie_id: string;
  realmie_key: string;
  display_name: string;
  realm_id: RealmieRealm;
  rarity: RealmieRarity;
  asset_path: string;
};

export type RealmieCollection = {
  catalogue: Realmie[];
  display: RealmieDisplaySlot[];
  totals: {
    collected: number;
    active_standard: number;
  };
};

type PresentationDefinition = Pick<
  Realmie,
  | "realmie_key"
  | "display_name"
  | "realm_id"
  | "category"
  | "character_key"
  | "rarity"
  | "lore_text"
  | "unlock_rule_type"
  | "collection_order"
  | "asset_path"
  | "silhouette_asset_path"
  | "unlock_clue"
>;

export const LIVE_REALMIE_PRESENTATION: PresentationDefinition[] = [
  {
    realmie_key: "number-nexus-bitling-standard",
    display_name: "Bitling",
    realm_id: "number",
    category: "realm_citizen",
    character_key: "bitling",
    rarity: "common",
    lore_text: "Repairs lost numbers travelling through Number Nexus.",
    unlock_rule_type: "first_realm_lesson_completed",
    collection_order: 1010,
    asset_path: "/realmies/number-nexus-bitling-standard/hero-transparent.png",
    silhouette_asset_path: "/realmies/number-nexus-bitling-standard/silhouette.png",
    unlock_clue: "Complete your first Number Nexus lesson.",
  },
  {
    realmie_key: "number-nexus-carrybot-standard",
    display_name: "CarryBot",
    realm_id: "number",
    category: "helper",
    character_key: "carrybot",
    rarity: "rare",
    lore_text: "Moves regrouped numbers between the place-value towers.",
    unlock_rule_type: "realm_lessons_completed_count",
    collection_order: 1020,
    asset_path: "/realmies/number-nexus-carrybot-standard/hero-transparent.png",
    silhouette_asset_path: "/realmies/number-nexus-carrybot-standard/silhouette.png",
    unlock_clue: "Complete 10 unique Number Nexus lessons.",
  },
  {
    realmie_key: "number-nexus-codekeeper-standard",
    display_name: "Codekeeper",
    realm_id: "number",
    category: "guardian",
    character_key: "codekeeper",
    rarity: "epic",
    lore_text: "Protects forgotten equations in the digital archives.",
    unlock_rule_type: "realm_weekly_quizzes_passed_count",
    collection_order: 1030,
    asset_path: "/realmies/number-nexus-codekeeper-standard/hero-transparent.png",
    silhouette_asset_path: "/realmies/number-nexus-codekeeper-standard/silhouette.png",
    unlock_clue: "Pass 5 unique Number Nexus weekly quizzes.",
  },
  {
    realmie_key: "number-nexus-neon-sentinel-standard",
    display_name: "Neon Sentinel",
    realm_id: "number",
    category: "guardian",
    character_key: "neon-sentinel",
    rarity: "legendary",
    lore_text: "Watches the deepest gateway into Number Nexus.",
    unlock_rule_type: "realm_lessons_completed_count",
    collection_order: 1040,
    asset_path: "/realmies/number-nexus-neon-sentinel-standard/hero-transparent.png",
    silhouette_asset_path: "/realmies/number-nexus-neon-sentinel-standard/silhouette.png",
    unlock_clue: "Complete 50 unique Number Nexus lessons.",
  },
  {
    realmie_key: "measurelands-gaugekin-standard",
    display_name: "Gaugekin",
    realm_id: "measurement",
    category: "helper",
    character_key: "gaugekin",
    rarity: "common",
    lore_text: "Checks every measure twice and cheers when it is just right.",
    unlock_rule_type: "first_realm_lesson_completed",
    collection_order: 2010,
    asset_path: "/realmies/measurelands-gaugekin-standard/hero-transparent.png",
    silhouette_asset_path: "/realmies/measurelands-gaugekin-standard/silhouette.png",
    unlock_clue: "Complete your first Measurelands lesson.",
  },
  {
    realmie_key: "measurelands-ruleroot-standard",
    display_name: "Ruleroot",
    realm_id: "measurement",
    category: "realm_citizen",
    character_key: "ruleroot",
    rarity: "rare",
    lore_text: "Grows along the paths where careful explorers measure.",
    unlock_rule_type: "realm_lessons_completed_count",
    collection_order: 2020,
    asset_path: "/realmies/measurelands-ruleroot-standard/hero-transparent.png",
    silhouette_asset_path: "/realmies/measurelands-ruleroot-standard/silhouette.png",
    unlock_clue: "Complete 10 unique Measurelands lessons.",
  },
  {
    realmie_key: "measurelands-compass-keeper-standard",
    display_name: "Compass Keeper",
    realm_id: "measurement",
    category: "guardian",
    character_key: "compass-keeper",
    rarity: "epic",
    lore_text: "Records the pathways confirmed by weekly mastery.",
    unlock_rule_type: "realm_weekly_quizzes_passed_count",
    collection_order: 2030,
    asset_path: "/realmies/measurelands-compass-keeper-standard/hero-transparent.png",
    silhouette_asset_path: "/realmies/measurelands-compass-keeper-standard/silhouette.png",
    unlock_clue: "Pass 5 unique Measurelands weekly quizzes.",
  },
  {
    realmie_key: "measurelands-golden-surveyor-standard",
    display_name: "Golden Surveyor",
    realm_id: "measurement",
    category: "explorer",
    character_key: "golden-surveyor",
    rarity: "legendary",
    lore_text: "Maps the grandest Measurelands expeditions with perfect care.",
    unlock_rule_type: "realm_lessons_completed_count",
    collection_order: 2040,
    asset_path: "/realmies/measurelands-golden-surveyor-standard/hero-transparent.png",
    silhouette_asset_path: "/realmies/measurelands-golden-surveyor-standard/silhouette.png",
    unlock_clue: "Complete 50 unique Measurelands lessons.",
  },
];

const DEMO_STORAGE_KEY = "lul:demo-preview:realmies:v1";

type DemoPreferences = {
  favourites: string[];
  display: Array<{ slot: number; realmieKey: string }>;
};

function readDemoPreferences(): DemoPreferences {
  if (typeof window === "undefined") return { favourites: [], display: [] };
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DEMO_STORAGE_KEY) ?? "{}") as Partial<DemoPreferences>;
    return {
      favourites: Array.isArray(parsed.favourites) ? parsed.favourites : [],
      display: Array.isArray(parsed.display) ? parsed.display : [],
    };
  } catch {
    return { favourites: [], display: [] };
  }
}

function writeDemoPreferences(preferences: DemoPreferences) {
  window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(preferences));
}

function buildDemoCollection(): RealmieCollection {
  const preferences = readDemoPreferences();
  const catalogue = LIVE_REALMIE_PRESENTATION.map((definition) => {
    const displayEntry = preferences.display.find((entry) => entry.realmieKey === definition.realmie_key);
    return {
      ...definition,
      id: definition.realmie_key,
      asset_status: "ready",
      owned: true,
      earned_at: null,
      unlock_source: "demo_preview",
      favourite: preferences.favourites.includes(definition.realmie_key),
      display_slot: displayEntry?.slot ?? null,
    };
  });
  const byKey = new Map(catalogue.map((realmie) => [realmie.realmie_key, realmie]));
  const display = preferences.display
    .map((entry) => {
      const realmie = byKey.get(entry.realmieKey);
      return realmie
        ? {
            slot_number: entry.slot,
            realmie_id: realmie.id,
            realmie_key: realmie.realmie_key,
            display_name: realmie.display_name,
            realm_id: realmie.realm_id,
            rarity: realmie.rarity,
            asset_path: realmie.asset_path,
          }
        : null;
    })
    .filter((entry): entry is RealmieDisplaySlot => entry !== null)
    .sort((a, b) => a.slot_number - b.slot_number);

  return {
    catalogue,
    display,
    totals: { collected: catalogue.length, active_standard: catalogue.length },
  };
}

function normalizeCollection(data: unknown): RealmieCollection {
  const row = (data ?? {}) as {
    catalogue?: Array<Partial<Realmie> & { realmie_key?: string }>;
    display?: RealmieDisplaySlot[];
  };
  const canonicalByKey = new Map(
    (Array.isArray(row.catalogue) ? row.catalogue : [])
      .filter((entry) => typeof entry.realmie_key === "string")
      .map((entry) => [entry.realmie_key as string, entry]),
  );

  const catalogue = LIVE_REALMIE_PRESENTATION.map((definition) => {
    const canonical = canonicalByKey.get(definition.realmie_key);
    return {
      ...definition,
      id: canonical?.id ?? definition.realmie_key,
      asset_status: canonical?.asset_status ?? "ready",
      owned: canonical?.owned === true,
      earned_at: canonical?.earned_at ?? null,
      unlock_source: canonical?.unlock_source ?? null,
      favourite: canonical?.favourite === true,
      display_slot: typeof canonical?.display_slot === "number" ? canonical.display_slot : null,
    };
  });
  const liveKeys = new Set(catalogue.map((entry) => entry.realmie_key));
  const display = (Array.isArray(row.display) ? row.display : []).filter((entry) =>
    liveKeys.has(entry.realmie_key),
  );

  return {
    catalogue,
    display,
    totals: {
      collected: catalogue.filter((entry) => entry.owned).length,
      active_standard: catalogue.length,
    },
  };
}

export async function fetchRealmieCollection(studentId: string): Promise<RealmieCollection> {
  if (isDemoPreviewMode()) return buildDemoCollection();
  const { data, error } = await supabase.rpc("get_student_realmies_secure", {
    p_student_id: studentId,
  });
  if (error) throw error;
  return normalizeCollection(data);
}

export async function setRealmieFavourite(
  studentId: string,
  realmie: Realmie,
  favourite: boolean,
): Promise<RealmieCollection> {
  if (isDemoPreviewMode()) {
    const preferences = readDemoPreferences();
    const favourites = new Set(preferences.favourites);
    if (favourite) favourites.add(realmie.realmie_key);
    else favourites.delete(realmie.realmie_key);
    writeDemoPreferences({ ...preferences, favourites: [...favourites] });
    return buildDemoCollection();
  }
  const { error } = await supabase.rpc("set_student_realmie_favourite_secure", {
    p_student_id: studentId,
    p_realmie_id: realmie.id,
    p_favourite: favourite,
  });
  if (error) throw error;
  return fetchRealmieCollection(studentId);
}

export async function setRealmieDisplaySlot(
  studentId: string,
  slotNumber: number,
  realmie: Realmie | null,
): Promise<RealmieCollection> {
  if (isDemoPreviewMode()) {
    const preferences = readDemoPreferences();
    const display = preferences.display.filter(
      (entry) => entry.slot !== slotNumber && entry.realmieKey !== realmie?.realmie_key,
    );
    if (realmie) display.push({ slot: slotNumber, realmieKey: realmie.realmie_key });
    writeDemoPreferences({ ...preferences, display });
    return buildDemoCollection();
  }
  const { error } = await supabase.rpc("set_student_realmie_display_slot_secure", {
    p_student_id: studentId,
    p_slot_number: slotNumber,
    p_realmie_id: realmie?.id ?? null,
  });
  if (error) throw error;
  return fetchRealmieCollection(studentId);
}

export async function recordRealmieEvent(
  studentId: string,
  eventName: string,
  realmie?: Realmie,
) {
  if (isDemoPreviewMode()) return;
  const { error } = await supabase.rpc("record_realmie_product_event_secure", {
    p_student_id: studentId,
    p_event_name: eventName,
    p_realmie_id: realmie?.id ?? null,
    p_realm_id: realmie?.realm_id ?? null,
    p_source_screen: "my_realmies",
    p_context: {},
  });
  if (error) console.warn("[Realmies] Product event was not recorded", error);
}
