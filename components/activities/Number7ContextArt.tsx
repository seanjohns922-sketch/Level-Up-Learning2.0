'use client';
import Image from 'next/image';
import {number7ContextArt} from '@/lib/number7-context-art';
import ReadAloudBtn from '@/components/ReadAloudBtn';

/** Model explicit area-model questions; use decorative props for other contexts. */
export function Number7AreaModel({prompt}:{prompt:string}) {
  const area = prompt.match(/^Use an area model to find (\d+)²\. Split \d+ into (\d+) \+ (\d+)\./);
  if (area) {
    const whole = Number(area[1]), tens = Number(area[2]), ones = Number(area[3]);
    const split = 32 + 240 * tens / whole;
    const speech = `A square with each side split into ${tens} and ${ones}. The dividing lines make four rectangles. Find each area, then add them.`;
    return <figure className="mx-auto mt-4 w-full max-w-sm rounded-xl border border-teal-200 bg-white p-3" data-number7-area-model>
      <figcaption className="flex items-center justify-between gap-2 text-sm font-bold text-teal-900">Area model<ReadAloudBtn text={speech} label="Read diagram" /></figcaption>
      <svg viewBox="0 0 304 304" className="w-full" role="img" aria-label={speech}>
        <rect x="32" y="32" width="240" height="240" fill="#ccfbf1" stroke="#0f766e" strokeWidth="2" />
        <rect x={split} y={split} width={272-split} height={272-split} fill="#fde68a" />
        <path d={`M ${split} 32 V 272 M 32 ${split} H 272`} fill="none" stroke="#0f766e" strokeWidth="2" />
        <g fill="#134e4a" fontSize="16" textAnchor="middle">
          <text x={(32+split)/2} y="23">{tens}</text><text x={(split+272)/2} y="23">{ones}</text>
          <text x="16" y={(32+split)/2} dominantBaseline="middle">{tens}</text><text x="16" y={(split+272)/2} dominantBaseline="middle">{ones}</text>
        </g>
      </svg>
    </figure>;
  }
  return null;
}

export default function Number7ContextArt({prompt}:{prompt:string}) {
  const kind=number7ContextArt(prompt);
  if(!kind)return null;
  // The prompt names the object and provides read-aloud. These unmarked props
  // carry no extra information and are hidden from assistive technology.
  return <div aria-hidden="true" data-number7-context-art={kind} className="flex h-28 w-24 shrink-0 items-center justify-center self-center sm:h-36 sm:w-32">
    <Image src={`/images/number-nexus/level7/objects/${kind}-v1.png`} width={160} height={160} sizes="(max-width: 640px) 96px, 128px" alt="" className="h-full w-full object-contain"/>
  </div>;
}
