import json
from pathlib import Path
d = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-8-sig'))
print(f'Total files: {d["total_files"]}')
print(f'Total words: {d["total_words"]}')
for k, v in d['files'].items():
    if v:
        print(f'  {k}: {len(v)} files')
if d.get('skipped_sensitive'):
    print(f'  skipped (sensitive): {len(d["skipped_sensitive"])} files')
