'use client';

import { useEffect } from 'react';
import GroundObjectToken from './GroundObjectToken';

// A short burst of stars on a right answer. Decorative, and off for reduced motion.
const BURST = [[-260, -150], [-190, -240], [-90, -280], [20, -300], [130, -270], [230, -210], [280, -110], [-300, -50], [300, -20], [-170, -90], [170, -80], [0, -180]];

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

export default function GroundCheer() {
  useEffect(chime, []);
  return <div data-ground-cheer aria-hidden="true" className="pointer-events-none fixed left-1/2 top-[62%] z-50">
    <strong data-ground-cheer-word className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-6xl font-black text-white">Great!</strong>
    {BURST.map(([x, y], i) => <span key={i} className="absolute" style={{ '--x': `${x}px`, '--y': `${y}px`, animationDelay: `${i * 18}ms` } as React.CSSProperties}><GroundObjectToken objectType={i % 3 ? 'stars' : 'gems'} size={i % 2 ? 'md' : 'lg'} /></span>)}
  </div>;
}
