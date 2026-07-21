export default function RealmCurrentPath({ label, week, path, accent }: { label: string; week: number; path: string; accent: string }) {
  return (
    <p className="text-center text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: accent }}>
      {label} · Week {week} · {path}
    </p>
  );
}

