export function isRealm3DEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_REALM_3D === "1" || process.env.NODE_ENV !== "production";
}
