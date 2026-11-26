"use client";
// The end of a won Level 8 post-test: the final battle is over and the guardian's seal is broken.
// Students go back to their stronghold to watch the seal shatter and the Core break free.
import Link from "next/link";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { AssessmentResultProfile } from "@/data/assessments/analysis";
import { getRealmTheme } from "@/lib/useRealmTheme";
import type { ExpeditionRealm } from "@/lib/world3d/expedition-access";
import { STRONGHOLD_REALMS } from "@/lib/world3d/number-stronghold";
import { level8StrongholdHref } from "@/lib/level8-release";

export default function Level8BattleVictory({ realm, result }: { realm: ExpeditionRealm; result: AssessmentResultProfile }) {
  const theme = getRealmTheme(realm), info = STRONGHOLD_REALMS[realm];
  const guardian = info.guardian[0].toUpperCase() + info.guardian.slice(1);
  const title = "The seal shatters!";
  const detail = `You scored ${result.score} out of ${result.total} (${result.percentage}%). ${guardian}’s seal is broken and the ${info.core} is free.`;
  return (
    <main className="grid min-h-screen place-items-center p-6 text-white" style={{ background: theme.cardSurface }}>
      <div className="max-w-xl text-center">
        <p className="text-xs font-black tracking-[.2em]" style={{ color: theme.accentText }}>LEVEL 8 · {info.name.toUpperCase()} · THE FINAL BATTLE</p>
        <h1 className="mt-3 text-4xl font-black">{title}</h1>
        <p className="mx-auto my-5 max-w-md text-lg" style={{ color: theme.accentTextSoft }}>{detail}</p>
        <div className="flex justify-center"><ReadAloudBtn text={`${title} ${detail} Return to your stronghold to watch the Core break free.`} /></div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href={level8StrongholdHref(realm, { victory: true })} className="rounded-xl px-5 py-3 font-black text-slate-950" style={{ background: theme.ctaGradientCss }}>Watch the Core break free</Link>
          <Link href="/world" className="rounded-xl border px-5 py-3 font-bold" style={{ borderColor: theme.borderRing }}>Back to my world</Link>
        </div>
      </div>
    </main>
  );
}
