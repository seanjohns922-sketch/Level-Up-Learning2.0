'use client';

import ReadAloudBtn from '@/components/ReadAloudBtn';
import { getRealmTheme } from '@/lib/useRealmTheme';

/** Shows given quantities only: the student must work out the number of tins. */
export default function PaintTinsVisual({ need, capacity, price }: { need: number; capacity: number; price?: number }) {
  const theme = getRealmTheme('number');
  const speech = `Paint needed: ${need} litres. Each whole tin holds ${capacity} litres.${price === undefined ? '' : ` Each tin costs ${price} dollars.`}`;
  return <figure className="my-3 rounded-xl border p-3" style={{ background: theme.surfaceTint, borderColor: theme.borderRing, color: theme.ctaFrom }}>
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
      <div className="text-center">
        <svg viewBox="0 0 180 90" className="mx-auto h-20 w-40" aria-hidden="true">
          <rect x="8" y="8" width="164" height="75" rx="3" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M12 13H137V68H12Z" fill="currentColor" opacity=".18" />
          <rect x="120" y="20" width="38" height="16" rx="4" fill="currentColor" />
          <path d="M158 28H165V45H142V66" fill="none" stroke="currentColor" strokeWidth="3" />
          <rect x="137" y="60" width="10" height="21" rx="3" fill="currentColor" />
        </svg>
        <figcaption className="text-base font-bold">Paint needed: {need} L</figcaption>
      </div>
      <div className="text-center">
        <svg viewBox="0 0 120 100" className="mx-auto h-20 w-28" aria-hidden="true">
          <path d="M27 48V34C27 2 93 2 93 34V48" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M25 32H95L91 86Q60 100 29 86Z" fill="white" stroke="currentColor" strokeWidth="2" />
          <ellipse cx="60" cy="32" rx="35" ry="9" fill="currentColor" opacity=".3" stroke="currentColor" strokeWidth="2" />
          <path d="M29 49H91V76H29Z" fill="currentColor" opacity=".18" />
          <path d="M60 49C56 56 50 60 50 66A10 10 0 0 0 70 66C70 60 64 56 60 49Z" fill="currentColor" />
        </svg>
        <p className="text-base font-bold">{capacity} L per tin</p>
        {price !== undefined && <p className="text-base font-bold">${price} per tin</p>}
      </div>
      <ReadAloudBtn text={speech} label="Read diagram" />
    </div>
  </figure>;
}
