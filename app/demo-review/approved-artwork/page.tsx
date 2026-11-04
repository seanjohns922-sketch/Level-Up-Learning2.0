import { getAllLegends } from "@/data/legends";
import LegendCardArtwork from "@/components/legends/LegendCardArtwork";

export default function ApprovedArtworkReview() {
  const legends = getAllLegends();
  return <main className="min-h-screen bg-slate-100 p-4 text-slate-900 md:p-8">
    <h1 className="text-3xl font-black">RELIQ artwork review</h1>
    <p className="my-4">All 35 card fronts, matching realm backs and character cutouts. Cards show the complete 63 × 88 mm trimmed composition.</p>
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{legends.map(legend => <section key={legend.id} className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="font-bold">{legend.name} · {legend.yearLabel === "Prep" ? "Ground" : legend.yearLabel.replace("Year", "Level")}</h2>
      <p className="mb-3 text-sm">{legend.realmId}</p>
      <div className="grid grid-cols-2 gap-3">
        <LegendCardArtwork src={legend.images.cardFront} alt={`${legend.name} front`} className="aspect-[63/88] w-full" />
        <LegendCardArtwork src={legend.images.cardBack} alt={`${legend.realmId} back`} className="aspect-[63/88] w-full" />
      </div>
      <div className="mt-4 rounded-xl bg-slate-800 p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={legend.images.avatar} alt={`${legend.name} cutout`} className="mx-auto h-40 w-full object-contain" />
      </div>
    </section>)}</div>
  </main>;
}
