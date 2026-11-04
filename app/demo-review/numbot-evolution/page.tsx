import { getAllLegends, getLegendGuideImage } from "@/data/legends";

export default function NumbotEvolutionReview() {
  return (
    <main className="min-h-screen bg-[#eef3f4] p-6 text-slate-900 md:p-10">
      <h1 className="text-3xl font-black">Numbot evolution</h1>
      <p className="mt-2 max-w-2xl">Number Nexus character review: Ground through Level 6.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {getAllLegends("number-nexus").map((legend) => (
          <figure key={legend.id} className="rounded-3xl bg-white p-5 text-center shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getLegendGuideImage(legend) ?? undefined} alt={legend.name} className="mx-auto h-72 w-full object-contain" />
            <figcaption className="mt-4">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">{legend.yearLabel === "Prep" ? "Ground" : legend.yearLabel.replace("Year", "Level")}</p>
              <h2 className="mt-1 text-lg font-black">{legend.name}</h2>
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
