"""Import approved Downloads packs; never modify print sources. Requires pymupdf/Pillow."""
import json, hashlib, re, sys
from pathlib import Path
import fitz
from teal_avatars import import_teal_avatar
from PIL import Image, ImageCms, ImageDraw
source = Path(sys.argv[1]) if len(sys.argv)>1 else Path.home()/'Downloads'
root = Path(__file__).resolve().parents[2]
version='approved-2026-11-04-v1'
out=root/'public/cards'/version; out.mkdir(parents=True, exist_ok=True)
packs={'number-nexus':'Number_Nexus_Cards','measurelands':'Measurelands_Proofs','starpath':'Starpath_Proofs','pattern-peaks':'Pattern_Peaks_Proofs_v2','chance-hollow':'Chance_Hollow_Proofs','statistica':'Statistica_Proofs'}
manifest={}; provenance=[]; contact=[]
profile=ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()
for realm,folder in packs.items():
 base=source/folder
 backs=list(base.glob('Back*/*.pdf')); assert len(backs)==1,(realm,backs)
 files=sorted(base.glob('Fronts/*.pdf'))+backs
 manifest[realm]={}
 for p in files:
  before=hashlib.sha256(p.read_bytes()).hexdigest(); doc=fitz.open(p); assert len(doc)==1
  pg=doc[0]; box=pg.trimbox
  assert abs(box.width*25.4/72-63)<.01 and abs(box.height*25.4/72-88)<.01
  back=p in backs
  if back: stem='back'
  else:
   match=re.match(r'([^_]+)_(Ground|L[1-6])_([^_]+)_',p.name); assert match,p
   family,stage,name=match.groups();level=0 if stage=='Ground' else int(stage[1:]);stem=f'{family.lower()}-{name.lower()}-y{level}-front'
  dest=out/realm/f'{stem}.webp';dest.parent.mkdir(parents=True,exist_ok=True)
  # Number's supplied RGB previews are already TrimBox-only; avoid a CMYK round trip.
  if realm=='number-nexus':
   preview=list((base/'Trimmed_Previews').glob('07_Shared*.png' if back else f'{level:02d}_*.png'));assert len(preview)==1
   im=Image.open(preview[0]).convert('RGB'); assert abs(im.width/im.height-63/88)<.002
  else:
   pix=pg.get_pixmap(matrix=fitz.Matrix(400/72,400/72),clip=box,colorspace=fitz.csRGB,alpha=False)
   im=Image.frombytes('RGB',[pix.width,pix.height],pix.samples)
  im=im.resize((1008,1408),Image.Resampling.LANCZOS)
  im.save(dest,'WEBP',quality=96,method=6,icc_profile=profile)
  assert hashlib.sha256(p.read_bytes()).hexdigest()==before
  provenance.append({'realm':realm,'source':str(p.relative_to(source)),'sourceSha256':before,'trimBoxPoints':list(box),'output':str(dest.relative_to(root/'public')),'outputSha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
  if not back:
   key='Prep' if level==0 else f'Year {level}';slug=f'{family.lower()}-{name.lower()}-y{level}'
   avatar=f'/guides/{slug}.webp'
   if realm=='number-nexus':
    avatar, entry = import_teal_avatar(source, root, level, name)
    provenance.append(entry)
   assert (root/'public'/avatar.lstrip('/')).is_file(),avatar
   manifest[realm][key]={'avatar':avatar,'cardFront':'/'+str(dest.relative_to(root/'public')),'cardBack':f'/cards/{version}/{realm}/back.webp'}
  contact.append((realm+'/'+stem,im.copy()))
(root/'docs/artwork/approved-2026-11-04-sources.json').write_text(json.dumps(provenance,indent=2)+'\n')
(root/'data/legend-artwork.ts').write_text('import type { LegendImages, LegendRealmId } from "./legends";\n\n/** Canonical approved browser artwork. Keys are exact school learning levels; no adjacent-level fallback. */\nexport const LEGEND_ARTWORK: Record<LegendRealmId, Record<string, LegendImages>> = '+json.dumps(manifest,indent=2)+';\n\nexport const MISSING_LEGEND_ARTWORK: LegendImages = { avatar: "/guides/artwork-unavailable-v1.svg", cardFront: "/guides/artwork-unavailable-v1.svg", cardBack: "/guides/artwork-unavailable-v1.svg" };\n\nexport function getLegendArtwork(realm: LegendRealmId, year: string): LegendImages {\n  return LEGEND_ARTWORK[realm][year] ?? MISSING_LEGEND_ARTWORK;\n}\n')
for realm in packs:
 items=[x for x in contact if x[0].startswith(realm+'/')]; sheet=Image.new('RGB',(240*len(items),370),'#e8eeee');d=ImageDraw.Draw(sheet)
 for i,(name,im) in enumerate(items):
  im.thumbnail((224,320));sheet.paste(im,(i*240+8,10));d.text((i*240+6,335),name.split('/')[-1],fill='black')
 sheet.save('/private/tmp/reliq-'+realm+'.jpg')
print('Imported',sum(map(len,manifest.values())),'card fronts, 6 backs, 7 exact teal cutouts; PDFs unchanged.')
