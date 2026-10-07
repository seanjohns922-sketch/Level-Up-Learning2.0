import { getRealmTheme } from "@/lib/useRealmTheme";
import type { CanonicalRealmId } from "@/lib/realms/realm-registry";
/** Building materials follow shared realm accents plus the existing world artwork. */
export function realmBuildingPalette(realm:CanonicalRealmId){
 const theme=getRealmTheme(realm);
 const materials={
  number:{body:"#173a43",edge:"#305a66",base:"#11252e",metal:"#809ca6",glass:"#123e4c",light:theme.accentText,primary:theme.ctaFrom,secondary:theme.ctaTo},
  measurement:{body:"#765038",edge:"#c09554",base:"#493b36",metal:theme.ctaTo,glass:"#59417e",light:"#e8c97e",primary:theme.ctaFrom,secondary:"#a78bfa"},
  pattern:{body:"#35443f",edge:"#557666",base:"#24253c",metal:theme.accentText,glass:"#533689",light:"#a78bfa",primary:theme.ctaFrom,secondary:theme.ctaTo},
  statistics:{body:"#e4e7dc",edge:"#9ebcad",base:"#48695f",metal:theme.ctaTo,glass:"#8dcbb6",light:"#cbdcf2",primary:theme.passRing,secondary:theme.ctaFrom},
  chance:{body:"#342b43",edge:"#62506c",base:"#203b3a",metal:theme.ctaTo,glass:"#623568",light:theme.accentText,primary:theme.ctaFrom,secondary:"#a78bfa"},
  space:{body:"#353362",edge:"#7476a6",base:"#191d3d",metal:"#c3bcdc",glass:"#472c83",light:theme.accentText,primary:theme.ctaFrom,secondary:theme.ctaTo},
 };
 return materials[realm as keyof typeof materials]??materials.number;
}
export type RealmBuildingPalette=ReturnType<typeof realmBuildingPalette>;
