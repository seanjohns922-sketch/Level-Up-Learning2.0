/** Live screen sharing is suspended pending the access-control privacy review. */
export default function StudentScreenViewer() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5" role="status">
      <p className="font-semibold text-slate-800">Live screen view temporarily unavailable</p>
      <p className="mt-2 text-sm text-slate-600">
        Screen sharing is paused while we strengthen privacy protections.
        Lesson activity and progress reporting remain available.
      </p>
    </div>
  );
}
