import { cavernRealm, cavernWeek } from '@/lib/world3d/shattered-realms';
import { getRealmTheme } from '@/lib/useRealmTheme';

/** Decorative only: the shared week-page layout and controls stay untouched. */
export default function CavernWeekBackground({ realmId, week }: { realmId: string; week: number }) {
  const realm = cavernRealm(realmId) ?? 'number';
  const depth = (cavernWeek(week) - 1) / 11;
  const theme = getRealmTheme(realm);
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-slate-950" data-cavern-background={realm}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/images/shattered-realms/${realm}-cavern.webp`}
        alt=""
        fetchPriority="high"
        className="h-full w-full object-cover"
        style={{
          objectPosition: '58% center',
          transformOrigin: '58% 48%',
          transform: `scale(${1 + depth * 0.18})`,
          filter: `brightness(${0.88 - depth * 0.14})`,
        }}
      />
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, rgba(2,6,23,0.28), rgba(2,6,23,0.12) 45%, rgba(2,6,23,0.42))',
        boxShadow: `inset 0 0 ${100 + depth * 100}px rgba(2,6,23,${0.3 + depth * 0.15})`,
      }} />
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse at 62% 45%, ${theme.accentText}, transparent 45%)`,
        opacity: 0.03 + depth * 0.07,
      }} />
    </div>
  );
}
