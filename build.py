"""Bundle the entire game into one portable, offline-playable HTML file."""
from pathlib import Path
import re

root = Path(__file__).resolve().parent
css = (root / 'styles.css').read_text(encoding='utf-8')
engine = (root / 'engine.mjs').read_text(encoding='utf-8')
engine = engine.replace('export const ', 'const ').replace('export function ', 'function ')
app = (root / 'app.mjs').read_text(encoding='utf-8')
app = app[app.index('const ROOT='):]
code = (engine + '\n' + app).replace('</script>', '<\\/script>')
index = (root / 'index.html').read_text(encoding='utf-8')
index = re.sub(r'<link rel="(?:icon|apple-touch-icon|manifest)"[^>]*>', '', index)
index = re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>', '', index)  # standalone requires inline JS/CSS
index = index.replace('<link rel="stylesheet" href="./styles.css">', '<style>' + css + '</style>')
index = index.replace('<script type="module" src="./app.mjs"></script>', '<script>' + code + '</script>')
if 'src="./app.mjs"' in index or 'href="./styles.css"' in index or len(index) < 80000:
    raise RuntimeError('Standalone build failed to inline application assets')
(root / 'play.html').write_text(index, encoding='utf-8')
print('Bundled playable HTML:', len(index.encode('utf-8')), 'bytes')
