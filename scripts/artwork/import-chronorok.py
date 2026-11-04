"""Import approved Chronorok print TrimBoxes and exact avatar PNGs. Never edit sources."""
from pathlib import Path
import hashlib,json,zipfile,io
import fitz
from PIL import Image,ImageCms,ImageDraw
root=Path(__file__).resolve().parents[2];source=Path.home()/'Downloads'
pack=source/'RELIQ_Chronorok_Print_Pack 2/Chronorok'
out=root/'public/cards/chronorok-2026-11-04-v1';out.mkdir(parents=True,exist_ok=True)
avatars=root/'public/guides/chronorok-2026-11-04-v1';avatars.mkdir(parents=True,exist_ok=True)
profile=ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()
entries=[];cards=[];records=[];names=['Spark','Ember','Pulse','Current','Rift','Blaze','Eternal']
with zipfile.ZipFile(source/'Chronorok_Avatars.zip') as z:
 for level,name in enumerate(names):
  stage='Ground' if level==0 else f'L{level}'
  pdf=pack/f'Chronorok_{level+1:02d}_{stage}_{name}_CMYK.pdf'
  slug=f'chronorok-{name.lower()}-y{level}'
  records.append((pdf,slug+'-front'))
  member=f'Chronorok_Avatars/Chronorok_{level:02d}_'+('Ground' if level==0 else f'Level_{level}')+f'_{name}.png'
  raw=z.read(member);im=Image.open(io.BytesIO(raw));assert im.mode=='RGBA' and im.getextrema()[3][0]==0
  target=avatars/(slug+'.png');target.write_bytes(raw)
  entries.append({'source':'Chronorok_Avatars.zip/'+member,'output':str(target.relative_to(root/'public')),'sourceSha256':hashlib.sha256(raw).hexdigest(),'outputSha256':hashlib.sha256(target.read_bytes()).hexdigest()})
  cards.append({'id':slug,'grade':'Prep' if level==0 else f'Year {level}','name':'Chronorok '+name,'images':{'avatar':'/'+str(target.relative_to(root/'public')),'cardFront':f'/cards/chronorok-2026-11-04-v1/{slug}-front.webp','cardBack':'/cards/chronorok-2026-11-04-v1/back.webp'},'unlockVideoUrl':None,'showcaseVideoUrl':None})
records.append((pack/'Chronorok_08_Shared_Amber_Q_Back_CMYK.pdf','back'))
sheet=Image.new('RGB',(8*220,340),'#eee9e0');draw=ImageDraw.Draw(sheet)
for index,(pdf,stem) in enumerate(records):
 raw=pdf.read_bytes();doc=fitz.open(pdf);assert len(doc)==1;page=doc[0];box=page.trimbox
 assert abs(box.width*25.4/72-63)<.01 and abs(box.height*25.4/72-88)<.01
 pix=page.get_pixmap(matrix=fitz.Matrix(400/72,400/72),clip=box,colorspace=fitz.csRGB,alpha=False)
 im=Image.frombytes('RGB',[pix.width,pix.height],pix.samples).resize((1008,1408),Image.Resampling.LANCZOS)
 target=out/(stem+'.webp');im.save(target,'WEBP',quality=96,method=6,icc_profile=profile)
 assert raw==pdf.read_bytes()
 entries.append({'source':str(pdf.relative_to(source)),'sourceSha256':hashlib.sha256(raw).hexdigest(),'trimBoxPoints':list(box),'output':str(target.relative_to(root/'public')),'outputSha256':hashlib.sha256(target.read_bytes()).hexdigest()})
 im.thumbnail((208,298));sheet.paste(im,(index*220+6,6));draw.text((index*220+4,310),stem,fill='black')
sheet.save('/private/tmp/chronorok-cards.jpg')
(root/'data/chronorok-artwork.ts').write_text('export type ChronorokCard = { id: string; grade: string; name: string; images: { avatar: string; cardFront: string; cardBack: string }; unlockVideoUrl: string | null; showcaseVideoUrl: string | null };\n\n/** Approved grade-specific cards. Video slots intentionally empty until supplied. */\nexport const CHRONOROK_CARDS: readonly ChronorokCard[] = '+json.dumps(cards,indent=2)+';\n\nexport const CHRONOROK_VIDEOS: { arrival: string | null; portal: string | null } = { arrival: null, portal: null };\n')
(root/'docs/artwork/chronorok-2026-11-04-sources.json').write_text(json.dumps(entries,indent=2)+'\n')
print('Imported 7 fronts, amber back and 7 exact transparent avatars; empty video slots.')
