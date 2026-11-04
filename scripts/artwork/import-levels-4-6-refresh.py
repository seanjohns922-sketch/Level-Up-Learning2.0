"""Render supplied Level 4–6 print masters to versioned sRGB browser PNGs."""
from pathlib import Path
import hashlib,json
import fitz
from PIL import Image,ImageCms,ImageDraw
root=Path(__file__).resolve().parents[2];downloads=Path.home()/'Downloads'
version='levels-4-6-2026-11-04-v2';records=[]
for realm,folder,prefix,names,back in [
 ('number-nexus','RELIQ_Number_Nexus_Levels_4-6_Repacked','Numbot',['Solver','Calculator','Equationator'],'Numbot_Shared_Teal_RELIQ_Back_CMYK.pdf'),
 ('measurelands','RELIQ_Measurelands_Levels_4-6_Print_Pack','Meazurex',['Balancer','Calibrator','Timewielder'],'Measurelands_Shared_Gold_Q_RELIQ_Back_CMYK.pdf')]:
 for level,name in enumerate(names,4):records.append((realm,downloads/folder/f'{prefix}_L{level}_{name}_Front_CMYK.pdf',f'{prefix.lower()}-{name.lower()}-y{level}-front'))
 records.append((realm,downloads/folder/back,'back'))
profile=ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes();manifest=[]
sheet=Image.new('RGB',(8*240,365),'#eee9e0');draw=ImageDraw.Draw(sheet)
for i,(realm,pdf,stem) in enumerate(records):
 raw=pdf.read_bytes();doc=fitz.open(stream=raw,filetype='pdf');assert len(doc)==1
 page=doc[0];box=page.trimbox
 assert abs(box.width*25.4/72-63)<.02 and abs(box.height*25.4/72-88)<.02
 pix=page.get_pixmap(matrix=fitz.Matrix(400/72,400/72),clip=box,colorspace=fitz.csRGB,alpha=False)
 im=Image.frombytes('RGB',(pix.width,pix.height),pix.samples).resize((1008,1408),Image.Resampling.LANCZOS)
 target=root/'public/cards'/version/realm/(stem+'.png');target.parent.mkdir(parents=True,exist_ok=True);im.save(target,icc_profile=profile,optimize=True)
 assert raw==pdf.read_bytes()
 manifest.append({'source':str(pdf.relative_to(downloads)),'sourceSha256':hashlib.sha256(raw).hexdigest(),'trimBoxPoints':list(box),'output':str(target.relative_to(root/'public')),'outputSha256':hashlib.sha256(target.read_bytes()).hexdigest()})
 im.thumbnail((230,322));sheet.paste(im,(i*240+5,5));draw.text((i*240+5,335),stem,fill='black')
sheet.save('/private/tmp/levels-4-6-card-refresh.jpg')
(root/'docs/artwork/levels-4-6-2026-11-04-v2-sources.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Rendered six fronts and two backs. Print originals unchanged.')
