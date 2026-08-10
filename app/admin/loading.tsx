function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-slate-200 ${className}`} aria-hidden="true" />;
}

export default function PlatformAdminLoading() {
  return (
    <div role="status" aria-label="Loading platform administration">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-4 h-9 w-full max-w-xl" />
      <Skeleton className="mt-3 h-4 w-full max-w-2xl" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="border border-slate-200 bg-white p-5 shadow-sm">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-5 h-8 w-20" />
            <Skeleton className="mt-3 h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
      <span className="sr-only">Loading platform data...</span>
    </div>
  );
}
