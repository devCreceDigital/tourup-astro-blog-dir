import json
from pathlib import Path
from collections import Counter

d = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-8'))
root = Path(d['scan_root'])
all_files = []
for flist in d['files'].values():
    all_files.extend(flist)

counts = Counter()
for f in all_files:
    p = Path(f).relative_to(root)
    parts = p.parts
    if len(parts) >= 2:
        if parts[0] == 'src' and len(parts) >= 2:
            top = str(Path('src') / parts[1])
            counts[top] += 1
    elif p.parent == Path('.'):
        counts['(root)'] += 1

for name, cnt in counts.most_common(10):
    print(f'  {name}: {cnt} files')
