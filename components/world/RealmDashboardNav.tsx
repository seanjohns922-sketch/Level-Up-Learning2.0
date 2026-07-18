"use client";

import type { CSSProperties } from "react";
import { Castle, House } from "lucide-react";
import { useRouter } from "next/navigation";

const DESTINATIONS = [
  { key: "home", label: "MY HOME", accessibleLabel: "Open My Home", route: "/home-base", Icon: House },
  { key: "tower", label: "TOWER", accessibleLabel: "Return to the Tower of Knowledge", route: "/realms", Icon: Castle },
] as const;

type RealmDashboardNavProps = {
  buttonStyle: CSSProperties;
  buttonClassName?: string;
  iconClassName?: string;
  palette: {
    text: string;
    iconBackground: string;
    iconBorder: string;
    iconShadow: string;
    textShadow: string;
  };
};

export default function RealmDashboardNav({
  buttonStyle,
  buttonClassName,
  iconClassName,
  palette,
}: RealmDashboardNavProps) {
  const router = useRouter();

  return DESTINATIONS.map(({ key, label, accessibleLabel, route, Icon }) => (
    <button
      key={key}
      type="button"
      onClick={() => router.push(route)}
      aria-label={accessibleLabel}
      title={accessibleLabel}
      style={buttonStyle}
      className={buttonClassName}
    >
      <div
        className={iconClassName}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 48,
          height: 48,
          borderRadius: 14,
          color: palette.text,
          background: palette.iconBackground,
          border: palette.iconBorder,
          boxShadow: palette.iconShadow,
          transition: "transform 200ms ease, box-shadow 220ms ease",
        }}
      >
        <Icon size={28} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <span
        style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.18em",
          color: palette.text,
          fontFamily: "ui-monospace,monospace",
          textShadow: palette.textShadow,
        }}
      >
        {label}
      </span>
    </button>
  ));
}
