"""Import exact approved transparent PNGs without cropping, recolouring or re-encoding."""
import hashlib, shutil
from PIL import Image

def import_teal_avatar(source, root, level, name):
    stage = 'Ground' if level == 0 else f'Level_{level}'
    original = source/'Numbot_Teal_Avatars'/f'{level:02d}_{stage}_Numbot_{name}.png'
    image = Image.open(original)
    assert image.mode == 'RGBA' and image.getextrema()[3][0] == 0, original
    target = root/'public/guides/numbot-teal-2026-11-04-v1'/f'numbot-{name.lower()}-y{level}.png'
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(original, target)
    checksum = hashlib.sha256(original.read_bytes()).hexdigest()
    assert hashlib.sha256(target.read_bytes()).hexdigest() == checksum
    return '/' + str(target.relative_to(root/'public')), {
        'realm': 'number-nexus', 'source': str(original.relative_to(source)),
        'sourceSha256': checksum, 'output': str(target.relative_to(root/'public')),
        'outputSha256': checksum, 'width': image.width, 'height': image.height,
    }

if __name__ == '__main__':
    import json, re, sys
    from pathlib import Path
    root = Path(__file__).resolve().parents[2]
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home()/'Downloads'
    mapping = root/'data/legend-artwork.ts'
    text = mapping.read_text()
    provenance = root/'docs/artwork/approved-2026-11-04-sources.json'
    entries = [e for e in json.loads(provenance.read_text()) if not e['source'].startswith('Numbot_Teal_Avatars/')]
    for level, name in enumerate(['Bouncer','Counter','Builder','Processor','Solver','Calculator','Equationator']):
        path, entry = import_teal_avatar(source, root, level, name)
        text, count = re.subn(r'"avatar": "/guides/[^"\n]+/numbot-'+name.lower()+r'-y'+str(level)+r'\.(?:webp|png)"', '"avatar": "'+path+'"', text)
        assert count == 1, (name, count)
        entries.append(entry)
    mapping.write_text(text)
    provenance.write_text(json.dumps(entries, indent=2)+'\n')
    print('Imported all seven exact teal PNGs; original dimensions, alpha and pixel data preserved.')
