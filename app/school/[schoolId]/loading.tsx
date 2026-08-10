export default function SchoolHomeLoading() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-5 py-4 lg:px-8">
          <div className="h-11 w-11 animate-pulse rounded-md bg-emerald-900/15" />
          <div className="space-y-2">
            <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1500px] space-y-6 px-5 py-8 lg:px-8">
        <div className="h-9 w-64 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-lg border border-slate-200 bg-white"
            />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-lg border border-slate-200 bg-white" />
      </div>
    </main>
  );
}
