// Credits for artwork RELIQ uses under an open licence. Linked from the places that show it (Rex's panel).
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Credits · RELIQ" };

const CREDITS = [
  { what: "Rex the maths T-rex", title: "Randaling T-Rex, animated!", author: "quander", source: "https://sketchfab.com/3d-models/randaling-t-rex-animated-09a3632365344a99bb88e3dd0b684c89", licence: "CC BY 4.0", licenceUrl: "https://creativecommons.org/licenses/by/4.0/", note: "Textures resized and the file compressed for the web." },
  { what: "Rex's roars and growls", title: "T-rex calls", author: "OpenGameArt.org", source: "https://opengameart.org/content/t-rex-calls", licence: "CC0 1.0", licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/", note: "Cut into separate calls and levelled." },
  { what: "Trees, rocks and plants in the hub", title: "Nature Kit", author: "Kenney", source: "https://www.kenney.nl", licence: "CC0 1.0", licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/", note: null },
] as const;

export default function CreditsPage() {
  return (
    <main className="min-h-dvh bg-white px-4 py-12 text-[#121314] sm:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-black uppercase tracking-wide">Credits</h1>
        <p className="mt-3 text-slate-600">RELIQ uses some artwork made by others and shared under open licences. Thank you to these creators.</p>
        <ul className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
          {CREDITS.map((credit) => (
            <li key={credit.title} className="py-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{credit.what}</p>
              <p className="mt-1 font-bold">
                <a href={credit.source} target="_blank" rel="noreferrer" className="underline">&ldquo;{credit.title}&rdquo;</a> by {credit.author}, licensed under{" "}
                <a href={credit.licenceUrl} target="_blank" rel="noreferrer" className="underline">{credit.licence}</a>.
              </p>
              {credit.note ? <p className="mt-1 text-sm text-slate-600">{credit.note}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
