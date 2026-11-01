'use client';

import { useEffect } from 'react';
import GroundObjectToken from './GroundObjectToken';

// A short burst of stars on a right answer. Decorative, and off for reduced motion.
const BURST = [[-260, -150], [-190, -240], [-90, -280], [20, -300], [130, -270], [230, -210], [280, -110], [-300, -50], [300, -20], [-170, -90], [170, -80], [0, -180]];

/** One short note for a drag, pop or drop. Silent if the device blocks audio. */
export function groundBlip(frequency = 520) {
  try {
    const audio = new AudioContext(), tone = audio.createOscillator(), gain = audio.createGain();
    tone.frequency.value = frequency;
    gain.gain.setValueAtTime(.06, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .16);
    tone.connect(gain).connect(audio.destination);
    tone.start();
    tone.stop(audio.currentTime + .16);
    window.setTimeout(() => void audio.close(), 260);
  } catch { /* Sound is a bonus. */ }
}

function chime() {
  try {
    const audio = new AudioContext();
    [523, 659, 784].forEach((frequency, i) => {
      const tone = audio.createOscillator(), gain = audio.createGain(), at = audio.currentTime + i * .11;
      tone.frequency.value = frequency;
      gain.gain.setValueAtTime(.07, at);
      gain.gain.exponentialRampToValueAtTime(.001, at + .2);
      tone.connect(gain).connect(audio.destination);
      tone.start(at);
      tone.stop(at + .2);
    });
    window.setTimeout(() => void audio.close(), 700);
  } catch { /* Sound is a bonus; the lesson works without it. */ }
}

const LINES: Record<string, string[]> = {
  groundFeed: ['Yum!', 'Tasty!'], groundCollect: ['Got them!'], groundBuild: ['You built it!', 'Nice build!'], groundTapCount: ['Pop pop!', 'You counted!'],
  groundOrderTap: ['Blast off!', 'In order!'], groundSequence: ['All aboard!'], groundCompare: ['You spotted it!'], groundFoundation: ['Well done!', 'Fair and square!'],
  groundMatch: ['A match!'], measurementCompare: ['Great exploring!', 'You got it!'], measurePath: ['Good measuring!'], balanceScale: ['Balanced!'],
};

export default function GroundCheer({ kind, seed = 0 }: { kind?: string; seed?: number }) {
  const options = (kind && LINES[kind]) || ['Great!', 'Yes!'];
  const line = options[seed % options.length];
  useEffect(chime, []);
  return <div data-ground-cheer aria-hidden="true" className="pointer-events-none fixed left-1/2 top-[62%] z-50">
    <strong data-ground-cheer-word className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-6xl font-black text-white">{line}</strong>
    {BURST.map(([x, y], i) => <span key={i} className="absolute" style={{ '--x': `${x}px`, '--y': `${y}px`, animationDelay: `${i * 18}ms` } as React.CSSProperties}><GroundObjectToken objectType={i % 3 ? 'stars' : 'gems'} size={i % 2 ? 'md' : 'lg'} /></span>)}
  </div>;
}
