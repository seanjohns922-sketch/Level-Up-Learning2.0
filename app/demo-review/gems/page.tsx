"use client";

import { useEffect, useState } from "react";
import GemCase from "@/components/gems/GemCase";
import GemVaultHeader from "@/components/gems/GemVaultHeader";
import { enqueueReveal } from "@/lib/gem-reveal";
import type { GemDefinition, GemRarity } from "@/lib/gems";

/** Review-only snapshot of the seeded gem catalogue (slug, name, rarity, realm, milestone, description). */
const CATALOGUE: Array<[string, string, GemRarity, string | null, string, string]> = [
  ["first-steps-quartz", "First Steps Quartz", "common", null, "lessons_completed", "Complete 1 lesson"],
  ["granite-of-growth", "Granite of Growth", "common", null, "lessons_completed", "Complete 5 lessons"],
  ["sandstone-scholar", "Sandstone Scholar", "common", null, "lessons_completed", "Complete 10 lessons"],
  ["marble-milestone", "Marble Milestone", "uncommon", null, "lessons_completed", "Complete 15 lessons"],
  ["jade-journey-stone", "Jade Journey Stone", "uncommon", null, "lessons_completed", "Complete 25 lessons"],
  ["emerald-explorer", "Emerald Explorer", "rare", null, "lessons_completed", "Complete 50 lessons"],
  ["ruby-of-persistence", "Ruby of Persistence", "rare", null, "lessons_completed", "Complete 100 lessons"],
  ["sapphire-scholar", "Sapphire Scholar", "epic", null, "lessons_completed", "Complete 200 lessons"],
  ["diamond-of-dedication", "Diamond of Dedication", "epic", null, "lessons_completed", "Complete 350 lessons"],
  ["celestial-learning-crystal", "Celestial Learning Crystal", "legendary", null, "lessons_completed", "Complete 500 lessons"],
  ["amethyst-accuracy", "Amethyst Accuracy", "common", null, "perfect_lessons", "Complete 1 lesson with 100% accuracy"],
  ["tiger-eye-focus", "Tiger Eye Focus", "uncommon", null, "perfect_lessons", "Complete 5 perfect lessons"],
  ["aquamarine-precision", "Aquamarine Precision", "uncommon", null, "perfect_lessons", "Complete 10 perfect lessons"],
  ["topaz-mastery", "Topaz Mastery", "rare", null, "perfect_lessons", "Complete 15 perfect lessons"],
  ["sapphire-accuracy", "Sapphire Accuracy", "rare", null, "perfect_lessons", "Complete 25 perfect lessons"],
  ["black-diamond-focus", "Black Diamond Focus", "epic", null, "perfect_lessons", "Complete 50 perfect lessons"],
  ["phoenix-ruby", "Phoenix Ruby", "legendary", null, "perfect_lessons", "Complete 100 perfect lessons"],
  ["agate-challenger", "Agate Challenger", "common", null, "weekly_quizzes_passed", "Pass your first weekly quiz"],
  ["citrine-quiz-star", "Citrine Quiz Star", "uncommon", null, "perfect_weekly_quizzes", "Earn 100% on a weekly quiz"],
  ["moonstone-quiz-master", "Moonstone Quiz Master", "rare", null, "perfect_weekly_quizzes", "Earn 100% on 5 weekly quizzes"],
  ["opal-of-excellence", "Opal of Excellence", "rare", null, "perfect_weekly_quizzes", "Earn 100% on 10 weekly quizzes"],
  ["star-sapphire", "Star Sapphire", "epic", null, "perfect_weekly_quizzes", "Earn 100% on 20 weekly quizzes"],
  ["aurora-diamond", "Aurora Diamond", "legendary", null, "perfect_weekly_quizzes", "Earn 100% on 40 weekly quizzes"],
  ["pathfinder-crystal", "Pathfinder Crystal", "common", null, "pretests_completed", "Complete your first pre-test"],
  ["mastery-peridot", "Mastery Peridot", "uncommon", null, "posttests_passed", "Pass your first post-test"],
  ["alexandrite-achiever", "Alexandrite Achiever", "rare", null, "posttests_passed", "Pass 3 post-tests"],
  ["crown-emerald", "Crown Emerald", "epic", null, "posttests_passed", "Pass 5 post-tests"],
  ["eternal-mastery-crystal", "Eternal Mastery Crystal", "legendary", null, "posttests_passed", "Pass 10 post-tests across all realms"],
  ["sunstone-spark", "Sunstone Spark", "common", null, "streak_days", "Reach a 3-day learning streak"],
  ["rose-quartz-routine", "Rose Quartz Routine", "uncommon", null, "streak_days", "Reach a 5-day learning streak"],
  ["blue-sapphire-streak", "Blue Sapphire Streak", "rare", null, "streak_days", "Reach a 10-day learning streak"],
  ["fire-opal-commitment", "Fire Opal Commitment", "epic", null, "streak_days", "Reach a 20-day learning streak"],
  ["eternal-flame-crystal", "Eternal Flame Crystal", "legendary", null, "streak_days", "Reach a 50-day learning streak"],
  ["amber-spark", "Amber Spark", "common", null, "lifetime_xp", "Earn 500 lifetime XP"],
  ["jade-energy-stone", "Jade Energy Stone", "uncommon", null, "lifetime_xp", "Earn 1,000 lifetime XP"],
  ["ruby-powerstone", "Ruby Powerstone", "rare", null, "lifetime_xp", "Earn 2,500 lifetime XP"],
  ["diamond-explorer-core", "Diamond Explorer Core", "epic", null, "lifetime_xp", "Earn 5,000 lifetime XP"],
  ["celestial-xp-crystal", "Celestial XP Crystal", "legendary", null, "lifetime_xp", "Earn 10,000 lifetime XP"],
  ["bronze-explorer-stone", "Bronze Explorer Stone", "common", null, "explorer_rank", "Reach Explorer Rank 5"],
  ["silver-explorer-gem", "Silver Explorer Gem", "uncommon", null, "explorer_rank", "Reach Explorer Rank 10"],
  ["gold-explorer-emerald", "Gold Explorer Emerald", "rare", null, "explorer_rank", "Reach Explorer Rank 25"],
  ["master-explorer-diamond", "Master Explorer Diamond", "epic", null, "explorer_rank", "Reach Explorer Rank 50"],
  ["legendary-explorer-crystal", "Legendary Explorer Crystal", "legendary", null, "explorer_rank", "Reach Explorer Rank 100"],
  ["first-legend-amethyst", "First Legend Amethyst", "common", null, "legends_unlocked", "Unlock your first Legend"],
  ["ruby-legendstone", "Ruby Legendstone", "uncommon", null, "legends_unlocked", "Unlock 5 Legends"],
  ["star-sapphire-legend", "Star Sapphire Legend", "rare", null, "legends_unlocked", "Unlock 10 Legends"],
  ["diamond-hallstone", "Diamond Hallstone", "epic", null, "legends_unlocked", "Unlock 25 Legends"],
  ["eternal-legend-crystal", "Eternal Legend Crystal", "legendary", null, "all_live_legends", "Unlock every available Legend across all live realms"],
  ["nexus-energy-gem", "Nexus Energy Gem", "rare", "number", "realm_levels_completed", "Complete your first Number Nexus level"],
  ["quantum-numbot-core", "Quantum Numbot Core", "legendary", "number", "realm_legends_completed", "Collect every Number Nexus Legend"],
  ["surveyor-emerald", "Surveyor Emerald", "rare", "measurement", "realm_levels_completed", "Complete your first Measurelands level"],
  ["master-measure-crystal", "Master Measure Crystal", "legendary", "measurement", "realm_legends_completed", "Collect every Measurelands Legend"],
  ["pattern-rune-gem", "Pattern Rune Gem", "rare", "pattern-peaks", "realm_levels_completed", "Complete your first Pattern Peaks level"],
  ["infinite-pattern-crystal", "Infinite Pattern Crystal", "legendary", "pattern-peaks", "realm_legends_completed", "Collect every Pattern Peaks Legend"],
  ["data-prism", "Data Prism", "rare", "statistica", "realm_levels_completed", "Complete your first Statistica level"],
  ["grand-analyst-crystal", "Grand Analyst Crystal", "legendary", "statistica", "realm_legends_completed", "Collect every Statistica Legend"],
  ["fortune-stone", "Fortune Stone", "rare", "chance-hollow", "realm_levels_completed", "Complete your first Chance Hollow level"],
  ["probability-pearl", "Probability Pearl", "legendary", "chance-hollow", "realm_legends_completed", "Collect every Chance Hollow Legend"],
  ["starstone", "Starstone", "rare", "starpath", "realm_levels_completed", "Complete your first Starpath level"],
  ["celestial-navigator-crystal", "Celestial Navigator Crystal", "legendary", "starpath", "realm_legends_completed", "Collect every Starpath Legend"],
  ["time-fragment", "Time Fragment", "rare", "chronoscape", "realm_levels_completed", "Complete your first Chronoscape level"],
  ["eternal-time-crystal", "Eternal Time Crystal", "legendary", "chronoscape", "realm_legends_completed", "Collect every Chronoscape Legend"]
];

const DEFS: GemDefinition[] = CATALOGUE.map(([slug, name, rarity, realm_id, milestone_type, description], index) => ({
  id: slug, slug, name, description, rarity, category: "review", milestone_type, threshold: 1, realm_id,
  asset_key: slug, silhouette_asset_key: "", display_order: index, is_active: true, active_for_completion: true, current: 0, target: 1,
}));

const ORDER: GemRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];

/** Review-only: the Gem Vault layout with every achievement gem (two in three shown as earned), plus reveal previews per rarity. */
export default function GemReview() {
  const [locked, setLocked] = useState(false);

  // ?reveal=<rarity> opens that reveal on load, for screenshots.
  useEffect(() => {
    const rarity = new URLSearchParams(window.location.search).get("reveal") as GemRarity | null;
    const gem = rarity ? DEFS.find((item) => item.rarity === rarity && item.name.includes("Ruby")) ?? DEFS.find((item) => item.rarity === rarity) : undefined;
    if (gem) enqueueReveal([gem]);
  }, []);
  const sorted = [...DEFS].sort((a, b) => ORDER.indexOf(a.rarity) - ORDER.indexOf(b.rarity));
  const owned = locked ? [] : sorted.filter((_, index) => index % 3 !== 2);
  return (
    <main className="min-h-screen bg-[#0a0d13] p-6 text-white">
      <h1 className="text-xl font-black">Gem stones review</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {ORDER.map((rarity) => (
          <button key={rarity} type="button" onClick={() => enqueueReveal([DEFS.find((gem) => gem.rarity === rarity && gem.name.includes("Ruby")) ?? DEFS.find((gem) => gem.rarity === rarity)!])} className="rounded-lg border border-white/20 px-3 py-2 text-sm font-bold capitalize">
            Reveal {rarity}
          </button>
        ))}
        <button type="button" onClick={() => enqueueReveal(ORDER.map((rarity) => DEFS.find((gem) => gem.rarity === rarity)!))} className="rounded-lg border border-white/20 px-3 py-2 text-sm font-bold">Reveal queue</button>
        <button type="button" onClick={() => setLocked((value) => !value)} className="rounded-lg border border-white/20 px-3 py-2 text-sm font-bold">{locked ? "Show earned" : "Show all locked"}</button>
      </div>
      <div className="mx-auto mt-6 max-w-[1180px]">
        <GemVaultHeader
          collected={owned.length}
          total={DEFS.length}
          favourite={DEFS.find((gem) => gem.slug === "phoenix-ruby") ?? null}
          rarityCounts={Object.fromEntries(ORDER.map((rarity) => [rarity, {
            owned: owned.filter((gem) => gem.rarity === rarity).length,
            total: DEFS.filter((gem) => gem.rarity === rarity).length,
          }])) as Record<GemRarity, { owned: number; total: number }>}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {sorted.map((gem, index) => (
            <GemCase
              key={gem.id}
              gem={{ ...gem, current: 3, target: locked || index % 3 === 2 ? 10 : 1 }}
              earnedAt={locked || index % 3 === 2 ? undefined : "2026-10-01T00:00:00Z"}
              favourite={gem.slug === "phoenix-ruby"}
              busy={false}
              onToggleFavourite={() => undefined}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
