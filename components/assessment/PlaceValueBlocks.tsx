/** Each rod is ten square units; a single cube uses the same 20px unit. */
export function PlaceValueBlocks({ tens, ones }: { tens: number; ones: number }) {
  return (
    <div className="flex flex-wrap items-start justify-center gap-8">
      <div className="flex max-w-full flex-col items-center gap-3">
        <span className="text-sm font-bold text-teal-900">Tens</span>
        <div className="flex flex-wrap justify-center gap-2" role="img" aria-label={`${tens} tens rods`}>
          {Array.from({ length: tens }, (_, index) => (
            <svg key={index} width="20" height="200" viewBox="0 0 20 200" className="shrink-0" aria-hidden="true">
              <path d="M0 0H20V200H0Z" fill="#5eead4" />
              <path d="M0 0H20V200H0Z" fill="none" stroke="#115e59" />
              {Array.from({ length: 9 }, (__, unit) => <path key={unit} d={`M0 ${(unit + 1) * 20}H20`} stroke="#115e59" />)}
            </svg>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <span className="text-sm font-bold text-amber-900">Ones</span>
        <div className="grid grid-cols-5 gap-2" role="img" aria-label={`${ones} ones cubes`}>
          {Array.from({ length: ones }, (_, index) => (
            <svg key={index} width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M0 0H20V20H0Z" fill="#fcd34d" stroke="#92400e" />
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
}
