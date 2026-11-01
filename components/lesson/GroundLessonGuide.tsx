'use client';

import { Fragment, useEffect } from 'react';
import Image from 'next/image';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import { speak, stopSpeaking } from '@/lib/speak';
import { getRealmTheme } from '@/lib/useRealmTheme';
import type { GroundGuide, GroundItem, GroundPanel } from '@/data/lesson-guides/ground';

const COLOURS = { red: '#ef4444', blue: '#3b82f6', yellow: '#facc15', green: '#22c55e' };
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DICE: Record<number, [number, number][]> = { 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]] };

function Token({ kind, second, crossed }: { kind: GroundItem; second?: boolean; crossed?: boolean }) {
  const fill = second ? '#fb923c' : kind === 'star' ? '#facc15' : kind === 'gem' ? '#22d3ee' : kind === 'orb' ? '#a78bfa' : kind === 'block' ? '#34d399' : '#6d3bd1';
  return <svg viewBox="0 0 48 48" aria-hidden="true" className="h-12 w-12 sm:h-14 sm:w-14" style={{ opacity: crossed ? .35 : 1 }}>
    {kind === 'star' && <path d="M24 3l6.5 13.6 15 2-11 10.3 2.8 14.8L24 35.6 10.7 42.7l2.8-14.8-11-10.3 15-2z" fill={fill} stroke="#a16207" strokeWidth="2" strokeLinejoin="round" />}
    {kind === 'gem' && <path d="M12 6h24l10 13-22 25L2 19zM2 19h44M16 19l8 25 8-25M12 6l4 13M36 6l-4 13" fill={fill} stroke="#0e7490" strokeWidth="2" strokeLinejoin="round" />}
    {kind === 'orb' && <><circle cx="24" cy="24" r="20" fill={fill} stroke="#6d28d9" strokeWidth="2" /><circle cx="17" cy="16" r="5" fill="#fff" opacity=".65" /></>}
    {kind === 'block' && <rect x="5" y="5" width="38" height="38" rx="7" fill={fill} stroke="#3c2a63" strokeWidth="2" />}
    {kind === 'dot' && <circle cx="24" cy="24" r="17" fill={fill} />}
    {crossed && <path d="M6 6l36 36M42 6L6 42" stroke="#dc2626" strokeWidth="6" strokeLinecap="round" />}
  </svg>;
}

function Items({ item }: { item: NonNullable<GroundPanel['items']> }) {
  const total = item.n + (item.b ?? 0);
  if (item.dice) return <div className="grid h-40 w-40 grid-cols-3 grid-rows-3 place-items-center rounded-2xl bg-white p-3 shadow-md">
    {DICE[item.n].map(([c, r], i) => <div key={i} style={{ gridColumn: c + 1, gridRow: r + 1 }}><span className="block h-9 w-9 rounded-full bg-[#6d3bd1]" /></div>)}
  </div>;
  return <div className="grid justify-center gap-1.5" style={{ gridTemplateColumns: `repeat(${item.cols ?? Math.min(total, 5)},auto)` }}>
    {Array.from({ length: total }, (_, i) => <Token key={i} kind={item.kind} second={i >= item.n} crossed={i >= total - (item.cross ?? 0)} />)}
  </div>;
}

function Balance({ tilt }: { tilt: 'left' | 'level' }) {
  const d = tilt === 'left' ? 26 : 0;
  return <svg viewBox="0 0 260 170" aria-hidden="true" className="h-40 w-56">
    <path d="M130 40V150M90 152h80" stroke="#3c2a63" strokeWidth="9" strokeLinecap="round" />
    <path d={`M40 ${48 + d}L220 ${48 - d}`} stroke="#3c2a63" strokeWidth="8" strokeLinecap="round" />
    <path d={`M12 ${72 + d}h56l-10 24h-36z`} fill="#a78bfa" stroke="#3c2a63" strokeWidth="3" /><path d={`M192 ${72 - d}h56l-10 24h-36z`} fill="#a78bfa" stroke="#3c2a63" strokeWidth="3" />
    <path d={`M40 ${48 + d}v24M220 ${48 - d}v24`} stroke="#3c2a63" strokeWidth="4" />
    <circle cx="40" cy={60 + d} r={tilt === 'left' ? 17 : 12} fill="#fb923c" stroke="#3c2a63" strokeWidth="3" /><circle cx="220" cy={60 - d} r="12" fill="#fb923c" stroke="#3c2a63" strokeWidth="3" />
  </svg>;
}

function Panel({ panel, compact }: { panel: GroundPanel; compact: boolean }) {
  const size = Math.round((compact ? 116 : 170) * (panel.scale ?? 1));
  return <div className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-3 ${panel.win ? 'bg-amber-100 ring-4 ring-amber-400' : 'bg-white'}`}>
    {panel.big && <span className={`font-black leading-none text-[#3c2a63] ${compact ? 'text-6xl' : 'text-8xl'}`}>{panel.big}</span>}
    {panel.items && <Items item={panel.items} />}
    {panel.img && <Image src={`/images/measurelands/${panel.img}`} alt="" width={size} height={size} className="object-contain" style={{ width: size, height: size }} />}
    {panel.seq && <div className="flex gap-2">{panel.seq.map((c, i) => c === '?' ? <span key={i} className="grid h-14 w-14 place-items-center rounded-full border-4 border-dashed border-amber-500 text-2xl font-black text-amber-700">?</span> : <span key={i} className="block h-14 w-14 rounded-full shadow" style={{ background: COLOURS[c] }} />)}</div>}
    {panel.balance && <Balance tilt={panel.balance} />}
    {panel.fill !== undefined && <span className="relative block h-40 w-32 overflow-hidden rounded-b-3xl rounded-t-lg border-4 border-[#3c2a63] bg-sky-50"><span className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-sky-300 to-blue-600" style={{ height: `${panel.fill * 100}%` }} /></span>}
    {panel.days && <div className="flex flex-wrap justify-center gap-2">{DAYS.slice(panel.days.from ?? 0, panel.days.to ?? 7).map((d, i) => <span key={d} className={`rounded-xl px-4 py-3 text-2xl font-black ${panel.days!.highlight.includes(i + (panel.days!.from ?? 0)) ? 'bg-amber-300 text-amber-950' : i + (panel.days!.from ?? 0) > 4 ? 'bg-emerald-100 text-emerald-900' : 'bg-violet-100 text-violet-900'}`}>{d}</span>)}</div>}
    {panel.note && <span className="text-xl font-black text-[#3c2a63]">{panel.note}</span>}
  </div>;
}

export default function GroundLessonGuide({ guide, title, realm, onContinue, review = false }: {
  guide: GroundGuide; title: string; realm: string; onContinue: () => void; review?: boolean;
}) {
  const theme = getRealmTheme(realm);
  useEffect(() => { void speak(guide.say, undefined, "auto"); return () => stopSpeaking(); }, [guide.say]);
  const compact = guide.panels.length > 3;
  return <section data-ground-guide className="rounded-3xl border-4 bg-[#fffdf5] p-4 text-center text-slate-900 sm:p-6" style={{ borderColor: theme.borderRing }}>
    <h2 className="text-2xl font-black sm:text-3xl">{title}</h2>
    <div className="mx-auto mt-4 flex max-w-3xl items-center justify-center gap-3"><p className="text-2xl font-bold leading-snug sm:text-3xl">{guide.say}</p><ReadAloudBtn text={guide.say} size="md" /></div>
    <div className="my-5 flex flex-wrap items-center justify-center gap-3">{guide.panels.map((panel, i) => <Fragment key={i}>
      {i > 0 && guide.join && <span aria-hidden="true" className="text-4xl font-black text-[#3c2a63]">{i === guide.panels.length - 1 ? guide.result ?? guide.join : guide.join}</span>}
      <Panel panel={panel} compact={compact} />
    </Fragment>)}</div>
    <button autoFocus type="button" onClick={onContinue} className="min-h-20 rounded-2xl px-12 py-4 text-3xl font-black text-white shadow-lg focus-visible:outline focus-visible:outline-offset-4" style={{ background: theme.ctaGradientCss }}>{review ? 'Back to the game' : 'Let’s play!'}</button>
  </section>;
}
