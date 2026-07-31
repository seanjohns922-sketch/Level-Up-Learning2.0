"use client";

import { isDemoPreviewMode } from "@/lib/demo-mode";
import { supabase } from "@/lib/supabase";

export type RealmieRealmId = "number" | "measurement" | "space";
export type RealmieRarity = "rare" | "epic" | "legendary";
export type RealmieCollectionStatus = "live" | "coming_soon";

export type RealmieDefinition = {
  id: string;
  realmie_key: string;
  display_name: string;
  realm_id: RealmieRealmId;
  character_key: string;
  evolution_level: number;
  rarity: RealmieRarity;
  lore_text: string;
  collection_order: number;
  asset_path: string | null;
  silhouette_asset_path: string | null;
  asset_status: string;
  owned: boolean;
  earned_at: string | null;
  unlock_source: string | null;
  favourite: boolean;
  display_slot: number | null;
};

export type RealmieDisplaySlot = {
  slot_number: number;
  realmie_id: string;
  realmie_key: string;
  display_name: string;
  realm_id: RealmieRealmId;
  rarity: RealmieRarity;
  asset_path: string | null;
};

export type RealmieAvailability = {
  realm_id: RealmieRealmId;
  display_name: string;
  character_name: string;
  status: RealmieCollectionStatus;
};

export type RealmieCollection = {
  catalogue: RealmieDefinition[];
  display: RealmieDisplaySlot[];
  totals: { collected: number; active_standard: number };
  backfill: {
    unseen_count: number;
    latest_backfill_at: string | null;
    acknowledged_at: string | null;
  };
  availability: RealmieAvailability[];
};

const DEMO_FAVOURITES_KEY = "lul:demo-preview:realmie-favourites:v1";
const DEMO_DISPLAY_KEY = "lul:demo-preview:realmie-display:v1";

const FALLBACK_CATALOGUE: Array<Omit<RealmieDefinition, "owned" | "earned_at" | "unlock_source" | "favourite" | "display_slot">> = [
  ["number-nexus-numbot-counter-standard", "Numbot Counter", "number", "numbot", 1, "rare", "Numbot begins by counting the patterns hidden inside Number Nexus.", 101, "/realmies/number/numbot-counter.png"],
  ["number-nexus-numbot-builder-standard", "Numbot Builder", "number", "numbot", 2, "rare", "Numbot builds stronger number structures from every solved challenge.", 102, "/realmies/number/numbot-builder.png"],
  ["number-nexus-numbot-processor-standard", "Numbot Processor", "number", "numbot", 3, "epic", "Numbot processes complex number signals with speed and precision.", 103, "/realmies/number/numbot-processor.png"],
  ["number-nexus-numbot-solver-standard", "Numbot Solver", "number", "numbot", 4, "epic", "Numbot solves the deepest puzzles in the digital realm.", 104, "/realmies/number/numbot-solver.png"],
  ["number-nexus-numbot-calculator-standard", "Numbot Calculator", "number", "numbot", 5, "epic", "Numbot calculates pathways through even the largest number systems.", 105, "/realmies/number/numbot-calculator.png"],
  ["number-nexus-numbot-equationator-standard", "Numbot Equationator", "number", "numbot", 6, "legendary", "Numbot masters the equations that power all of Number Nexus.", 106, "/realmies/number/numbot-equationator.png"],
  ["measurelands-meazurex-ticklet-standard", "Meazurex Ticklet", "measurement", "meazurex", 1, "rare", "Meazurex learns to notice every tick, mark and measured step.", 201, "/realmies/measurement/meazurex-ticklet.png"],
  ["measurelands-meazurex-measurer-standard", "Meazurex Measurer", "measurement", "meazurex", 2, "rare", "Meazurex measures the paths and landmarks of Measurelands.", 202, "/realmies/measurement/meazurex-measurer.png"],
  ["measurelands-meazurex-tracker-standard", "Meazurex Tracker", "measurement", "meazurex", 3, "epic", "Meazurex tracks distance, mass, capacity and time across the realm.", 203, "/realmies/measurement/meazurex-tracker.png"],
  ["measurelands-meazurex-balancer-standard", "Meazurex Balancer", "measurement", "meazurex", 4, "epic", "Meazurex balances quantities with calm and exact judgement.", 204, "/realmies/measurement/meazurex-balancer.png"],
  ["measurelands-meazurex-calibrator-standard", "Meazurex Calibrator", "measurement", "meazurex", 5, "epic", "Meazurex calibrates every instrument used by Measurelands explorers.", 205, "/realmies/measurement/meazurex-calibrator.png"],
  ["measurelands-meazurex-timewielder-standard", "Meazurex Timewielder", "measurement", "meazurex", 6, "legendary", "Meazurex wields time and measure as one legendary force.", 206, "/realmies/measurement/meazurex-timewielder.png"],
  ["starpath-geospin-roller-standard", "Geospin Roller", "space", "geospin", 1, "rare", "Geospin rolls into Starpath ready to explore shapes and routes.", 301, "/realmies/space/geospin-roller.png"],
  ["starpath-geospin-mapper-standard", "Geospin Mapper", "space", "geospin", 2, "rare", "Geospin maps the floating paths between Starpath worlds.", 302, "/realmies/space/geospin-mapper.png"],
  ["starpath-geospin-navigator-standard", "Geospin Navigator", "space", "geospin", 3, "epic", "Geospin navigates distant routes using shape, position and direction.", 303, "/realmies/space/geospin-navigator.png"],
  ["starpath-geospin-shapeshifter-standard", "Geospin Shapeshifter", "space", "geospin", 4, "epic", "Geospin reshapes cosmic structures to solve spatial mysteries.", 304, "/realmies/space/geospin-shapeshifter.png"],
  ["starpath-geospin-galaxycrafter-standard", "Geospin Galaxycrafter", "space", "geospin", 5, "epic", "Geospin crafts whole galaxies from patterns, paths and forms.", 305, "/realmies/space/geospin-galaxycrafter.png"],
  ["starpath-geospin-starweaver-standard", "Geospin Starweaver", "space", "geospin", 6, "legendary", "Geospin weaves the final Starpath into a legendary cosmic map.", 306, "/realmies/space/geospin-starweaver.png"],
].map(([key, name, realm, character, level, rarity, lore, order, asset]) => ({
  id: String(key),
  realmie_key: String(key),
  display_name: String(name),
  realm_id: realm as RealmieRealmId,
  character_key: String(character),
  evolution_level: Number(level),
  rarity: rarity as RealmieRarity,
  lore_text: String(lore),
  collection_order: Number(order),
  asset_path: String(asset),
  silhouette_asset_path: null,
  asset_status: "ready",
}));

const DEFAULT_AVAILABILITY: RealmieAvailability[] = [
  { realm_id: "number", display_name: "Number Nexus", character_name: "Numbot", status: "live" },
  { realm_id: "measurement", display_name: "Measurelands", character_name: "Meazurex", status: "live" },
  { realm_id: "space", display_name: "Starpath", character_name: "Geospin", status: "coming_soon" },
];

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "") as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeCatalogue(data: unknown): RealmieDefinition[] {
  return Array.isArray(data) ? data as RealmieDefinition[] : [];
}

function buildDemoCollection(catalogue = FALLBACK_CATALOGUE): RealmieCollection {
  const favourites = new Set(readJson<string[]>(DEMO_FAVOURITES_KEY, []));
  const displayMap = readJson<Record<string, string>>(DEMO_DISPLAY_KEY, {});
  const now = new Date().toISOString();
  const figures = catalogue.map((entry) => {
    const slot = Object.entries(displayMap).find(([, key]) => key === entry.realmie_key)?.[0];
    return {
      ...entry,
      owned: true,
      earned_at: now,
      unlock_source: "demo_preview",
      favourite: favourites.has(entry.realmie_key),
      display_slot: slot ? Number(slot) : null,
    };
  });
  const display = Object.entries(displayMap)
    .map(([slot, key]) => {
      const figure = figures.find((entry) => entry.realmie_key === key);
      return figure ? {
        slot_number: Number(slot),
        realmie_id: figure.id,
        realmie_key: figure.realmie_key,
        display_name: figure.display_name,
        realm_id: figure.realm_id,
        rarity: figure.rarity,
        asset_path: figure.asset_path,
      } : null;
    })
    .filter((entry): entry is RealmieDisplaySlot => Boolean(entry))
    .sort((a, b) => a.slot_number - b.slot_number);

  return {
    catalogue: figures,
    display,
    totals: { collected: figures.length, active_standard: figures.length },
    backfill: { unseen_count: 0, latest_backfill_at: null, acknowledged_at: null },
    availability: DEFAULT_AVAILABILITY.map((entry) => ({ ...entry, status: "live" })),
  };
}

export async function fetchRealmieCollection(studentId: string): Promise<RealmieCollection> {
  if (isDemoPreviewMode() || studentId === "demo-preview") {
    const { data } = await supabase.rpc("get_active_realmie_catalogue_secure");
    const catalogue = normalizeCatalogue(data);
    return buildDemoCollection(catalogue.length > 0
      ? catalogue.map((entry) => ({ ...entry, owned: false, earned_at: null, unlock_source: null, favourite: false, display_slot: null }))
      : FALLBACK_CATALOGUE);
  }

  const [collectionResult, availabilityResult] = await Promise.all([
    supabase.rpc("get_student_realmies_secure", { p_student_id: studentId }),
    supabase.rpc("get_realmie_collection_availability_secure"),
  ]);
  if (collectionResult.error) throw collectionResult.error;
  if (availabilityResult.error) throw availabilityResult.error;
  const raw = (collectionResult.data ?? {}) as Partial<RealmieCollection>;
  return {
    catalogue: normalizeCatalogue(raw.catalogue),
    display: Array.isArray(raw.display) ? raw.display as RealmieDisplaySlot[] : [],
    totals: raw.totals ?? { collected: 0, active_standard: 0 },
    backfill: raw.backfill ?? { unseen_count: 0, latest_backfill_at: null, acknowledged_at: null },
    availability: Array.isArray(availabilityResult.data)
      ? availabilityResult.data as RealmieAvailability[]
      : DEFAULT_AVAILABILITY,
  };
}

export async function setRealmieFavourite(studentId: string, figure: RealmieDefinition, favourite: boolean) {
  if (isDemoPreviewMode() || studentId === "demo-preview") {
    const favourites = new Set(readJson<string[]>(DEMO_FAVOURITES_KEY, []));
    if (favourite) favourites.add(figure.realmie_key);
    else favourites.delete(figure.realmie_key);
    writeJson(DEMO_FAVOURITES_KEY, [...favourites]);
    return;
  }
  const { error } = await supabase.rpc("set_student_realmie_favourite_secure", {
    p_student_id: studentId,
    p_realmie_id: figure.id,
    p_favourite: favourite,
  });
  if (error) throw error;
}

export async function setRealmieDisplaySlot(studentId: string, slot: number, figure: RealmieDefinition | null) {
  if (isDemoPreviewMode() || studentId === "demo-preview") {
    const display = readJson<Record<string, string>>(DEMO_DISPLAY_KEY, {});
    for (const key of Object.keys(display)) {
      if (figure && display[key] === figure.realmie_key) delete display[key];
    }
    if (figure) display[String(slot)] = figure.realmie_key;
    else delete display[String(slot)];
    writeJson(DEMO_DISPLAY_KEY, display);
    return;
  }
  const { error } = await supabase.rpc("set_student_realmie_display_slot_secure", {
    p_student_id: studentId,
    p_slot_number: slot,
    p_realmie_id: figure?.id ?? null,
  });
  if (error) throw error;
}

export async function acknowledgeRealmieUnlocks(studentId: string) {
  if (isDemoPreviewMode() || studentId === "demo-preview") return;
  const { error } = await supabase.rpc("acknowledge_student_realmie_unlocks_secure", {
    p_student_id: studentId,
  });
  if (error) throw error;
}

