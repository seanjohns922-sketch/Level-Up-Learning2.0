'use client';
import Image from 'next/image';
import {number7ContextArt} from '@/lib/number7-context-art';

/** Decorative object artwork, never a mathematical model or answer clue. */
export default function Number7ContextArt({prompt}:{prompt:string}) {
  const kind=number7ContextArt(prompt);
  if(!kind)return null;
  // The prompt names the object and provides read-aloud. These unmarked props
  // carry no extra information and are hidden from assistive technology.
  return <div aria-hidden="true" data-number7-context-art={kind} className="flex h-28 w-24 shrink-0 items-center justify-center self-center sm:h-36 sm:w-32">
    <Image src={`/images/number-nexus/level7/objects/${kind}-v1.png`} width={160} height={160} sizes="(max-width: 640px) 96px, 128px" alt="" className="h-full w-full object-contain"/>
  </div>;
}
