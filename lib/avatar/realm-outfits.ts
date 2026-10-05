/** Design presets derived from the six signature character references. */
export const REALM_OUTFITS = [
 {key:'equationator',name:'Equationator Tech Suit',realm:'Number Nexus',colour:'#2889ad',trim:'#f4c856',pants:'#18343f',shoes:'#327f9b',held:'numbot_equationator_calculator',detail:'Segmented blue armour, gold equals badge and reinforced boots.'},
 {key:'timewielder',name:'Timewielder Robes',realm:'Measurelands',colour:'#493373',trim:'#dfb961',pants:'#29314b',shoes:'#69517f',held:'meazurex_timewielder_staff',detail:'Split violet robes, clockwork medallion and gold measuring marks.'},
 {key:'starweaver',name:'Starweaver Celestial Suit',realm:'Starpath',colour:'#6445a0',trim:'#ecdb99',pants:'#3d346c',shoes:'#9b83c8',held:'geospin_starweaver_orb',detail:'Layered constellation panels, asymmetric shoulder mantle and star brooch.'},
 {key:'codemaster',name:'Codemaster Crystal Armour',realm:'Pattern Peaks',colour:'#30263f',trim:'#b79860',pants:'#292536',shoes:'#494052',held:'patternox_codemaster_gauntlet',detail:'Dark angular plates, violet crystal shoulders and repeating gold diamonds.'},
 {key:'insightkeeper',name:'Insightkeeper Field Coat',realm:'Statistica',colour:'#eee2c9',trim:'#caad65',pants:'#243e53',shoes:'#ece4d3',held:'datara_insightkeeper_tablet',detail:'Ivory long coat, navy waistcoat, cyan crystal clasp and chart pocket.'},
 {key:'chanzia',name:'Chanzia Shadow Wraps',realm:'Chance Hollow',colour:'#392544',trim:'#c67ce2',pants:'#2b243b',shoes:'#50355e',held:'chanzia_master_die',detail:'Layered plum wraps, lowered hood, diagonal sash and glowing spiral badge.'},
] as const;
export type RealmOutfitKey=typeof REALM_OUTFITS[number]['key'];
export type RealmTopStyle=`realm_${RealmOutfitKey}`;
export function realmOutfit(top:string){return REALM_OUTFITS.find(item=>`realm_${item.key}`===top);}
