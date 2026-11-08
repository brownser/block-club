"""Build only the audited public static assets, excluding tests/standalone/source artifacts."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parents[1]
out = root / 'site'
public = [
    'index.html', 'styles.css', 'engine.mjs', 'app.mjs',
    'manifest.webmanifest', 'sw.js', 'icon.svg', 'icon-192.png',
    'icon-512.png', 'apple-icon.png',
]
if out.exists():
    shutil.rmtree(out)
out.mkdir()
for filename in public:
    src = root / filename
    if not src.is_file():
        raise SystemExit(f'Missing required asset: {src}')
    shutil.copy2(src, out / filename)
(out / '.nojekyll').write_text('', encoding='utf-8')
print(f'Validated public static bundle: {len(public)} assets, {sum((out/x).stat().st_size for x in public):,} bytes')
