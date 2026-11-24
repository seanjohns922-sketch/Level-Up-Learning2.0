"use client";

import { HubQuestCard } from "@/components/quests/QuestParts";
import { previewXpAward, type XpAward } from "@/lib/xp-quests";

// Review page: the hub's quest card and each kind of XP reward. Nothing is saved or paid.
const CASES: Array<{ label: string; award: XpAward }> = [
  { label: "Quest done (+30)", award: { kind: "quest", quest: "two_lessons", xp: 30 } },
  { label: "Accuracy: all right (+20)", award: { kind: "accuracy", xp: 20, perfect: true } },
  { label: "Accuracy: 80%+ (+10)", award: { kind: "accuracy", xp: 10, perfect: false } },
  { label: "All quests done (+50)", award: { kind: "quests_all", xp: 50 } },
  { label: "Week cleared (+100)", award: { kind: "week", xp: 100, realm: "number", level: "Year 4", week: 4 } },
  { label: "Level cleared (+1,000)", award: { kind: "level", xp: 1000, realm: "measurement", level: "Year 5" } },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-[#2a1c30] p-8 font-sans text-white">
      <h1 className="font-display text-2xl font-black">Daily quests and XP rewards</h1>
      <div className="mt-5 flex max-w-3xl flex-wrap gap-3">
        {CASES.map((c) => (
          <button key={c.label} type="button" onClick={() => previewXpAward(c.award)} className="rounded-full bg-white px-5 py-3 font-display text-sm font-black text-[#16121f]">{c.label}</button>
        ))}
      </div>
      <HubQuestCard />
    </main>
  );
}
