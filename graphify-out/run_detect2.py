import json, sys
from graphify.detect import detect
from pathlib import Path

result = detect(Path('src/content'))
root = result.get('scan_root', str(Path('src/content').resolve()))
Path('graphify-out/.graphify_root').write_text(root, encoding='utf-8')
Path('graphify-out/.graphify_detect.json').write_text(json.dumps(result, ensure_ascii=False), encoding='utf-8')

print(f'Total files: {result["total_files"]}')
print(f'Total words: {result["total_words"]}')
for k, v in result['files'].items():
    if v:
        print(f'  {k}: {len(v)} files')
if result.get('skipped_sensitive'):
    print(f'  skipped (sensitive): {len(result["skipped_sensitive"])} files')
