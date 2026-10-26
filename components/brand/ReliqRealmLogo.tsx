import { RELIQ_LETTERS_PATH, RELIQ_Q_PATH } from "@/lib/brand-reliq-logo-paths";
import { getReliqsColor } from "@/lib/reliqs-brand";

/** RELIQ logo for a realm's pages: white RELI with the Q in the realm's colour,
 * the same colours as the realm's RELIQS in Hall of Legends. Fixed, trusted
 * artwork paths; nothing external is injected. */

const REALM_SLUG: Record<string, string> = {
  number: "number-nexus",
  measurement: "measurelands",
  space: "starpath",
  pattern: "pattern-peaks",
  statistics: "statistica",
  chance: "chance-hollow",
};

const REALM_NAME: Record<string, string> = {
  number: "Number Nexus",
  measurement: "Measurelands",
  space: "Starpath",
  pattern: "Pattern Peaks",
  statistics: "Statistica",
  chance: "Chance Hollow",
};

export function reliqRealmColor(realmId: string): string {
  return getReliqsColor(REALM_SLUG[realmId] ?? realmId);
}

export default function ReliqRealmLogo({ realmId, levelLabel, className = "" }: { realmId: string; levelLabel?: string; className?: string }) {
  const color = reliqRealmColor(realmId);
  const realmName = REALM_NAME[realmId];
  return (
    <div className={`text-right ${className}`}>
      <svg viewBox="0 0 279 79" role="img" aria-label="RELIQ" className="ml-auto block h-auto w-[132px] drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)] sm:w-[168px]">
        <path fill="#FFFFFF" d={RELIQ_LETTERS_PATH} />
        <path fill={color} d={RELIQ_Q_PATH} />
      </svg>
      {levelLabel ? (
        <p className="mt-1.5 text-[10px] font-black uppercase tracking-[0.22em] drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]" style={{ color }}>
          {levelLabel}{realmName ? ` · ${realmName}` : ""}
        </p>
      ) : null}
    </div>
  );
}
