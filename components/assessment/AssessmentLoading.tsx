import { getRealmTheme } from "@/lib/useRealmTheme";

/** Reserve an assessment-sized surface while its code and placement load. */
export default function AssessmentLoading({ realmId }: { realmId?: string }) {
  const theme = realmId ? getRealmTheme(realmId) : null;
  return (
    <main
      className="min-h-screen bg-slate-950 px-4 pt-6 pb-8 md:pt-10"
      aria-busy="true"
      aria-label="Loading assessment"
      style={theme ? { background: theme.cardSurface } : undefined}
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex h-10 items-center justify-between">
          <span role="status" className="text-sm font-bold text-slate-200">Loading your assessment…</span>
          <div className="h-8 w-24 rounded-lg bg-white/10" aria-hidden="true" />
        </div>
        <div aria-hidden="true" className="motion-safe:animate-pulse">
          <div className="mb-3 h-8 w-56 max-w-full rounded bg-white/10" />
          <div className="mb-6 h-3 w-full rounded bg-white/10" />
          <div className="min-h-[26rem] rounded-lg border border-white/15 bg-white/5 p-6 md:p-8">
            <div className="mb-6 h-6 w-3/4 rounded bg-white/10" />
            <div className="mb-8 h-36 rounded bg-white/5" />
            <div className="grid grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((key) => <div key={key} className="h-12 rounded-lg bg-white/10" />)}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
