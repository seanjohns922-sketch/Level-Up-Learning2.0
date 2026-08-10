function Bar({ className }: { className: string }) {
  return <div className={`animate-pulse bg-slate-200 ${className}`} aria-hidden="true" />;
}

export default function SchoolAdminDetailLoading() {
  return (
    <div role="status" aria-label="Loading school administration detail">
      <Bar className="h-4 w-24" />
      <Bar className="mt-4 h-9 w-full max-w-lg" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Bar key={index} className="h-32 w-full" />
        ))}
      </div>
      <Bar className="mt-7 h-72 w-full" />
      <span className="sr-only">Loading school data...</span>
    </div>
  );
}
