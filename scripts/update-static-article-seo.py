from pathlib import Path
import html
import re

ROOT = Path('.')
GENERIC = '宁波焊材批发,浙江焊材供应商,焊材选型,焊接操作,焊材质量证明书,焊材现货供应,金桥焊材,大西洋焊材,上海东风焊材,天泰焊材,船用焊材,钢结构焊材,压力容器焊材'
MODEL_RE = re.compile(r'\b(?:J\d{3}[A-Z]?|E\d{4}(?:-\d+)?|ER\d+[A-Z0-9-]*|A\d{3}[A-Z]?|D\d{3}[A-Z]?|H\d{2}[A-Za-z0-9]*|SJ\d{3}|HJ\d{3}|Q\d{3}|16Mn|304|316L)\b', re.I)

manifest = (ROOT / 'src/data/imageManifest.js').read_text(encoding='utf-8') if (ROOT / 'src/data/imageManifest.js').exists() else ''

def get_meta(s, name):
    m = re.search(rf'<meta name="{name}" content="([^"]*)"\s*/?>', s)
    return html.unescape(m.group(1)) if m else ''

def get_title(s):
    m = re.search(r'<h1>(.*?)</h1>', s, re.S)
    if m:
        return re.sub(r'<.*?>', '', html.unescape(m.group(1))).strip()
    m = re.search(r'<title>(.*?)</title>', s, re.S)
    return re.sub(r'\s*\|.*$', '', html.unescape(m.group(1))).strip() if m else ''

def upsert_meta(s, tag):
    if tag.split(' content=')[0] in s:
        name = re.search(r'name="([^"]+)"|property="([^"]+)"', tag).group(1) or re.search(r'name="([^"]+)"|property="([^"]+)"', tag).group(2)
        if 'name=' in tag:
            return re.sub(rf'<meta name="{re.escape(name)}" content="[^"]*"\s*/?>', tag, s, count=1)
        return re.sub(rf'<meta property="{re.escape(name)}" content="[^"]*"\s*/?>', tag, s, count=1)
    return s.replace('</title>', '</title>\n    ' + tag, 1)

def picture_for(src, alt):
    key = src.replace('../../', '/') if src.startswith('../../assets/') else src
    # Static pages are two levels below public for qa pages and one below for legacy pages.
    prefix = '../../' if '../../assets/' in src else '../'
    if 'knowledge-operation.png' in src:
        srcset = ', '.join(f'{prefix}assets/optimized/sections__knowledge-operation-{w}.webp {w}w' for w in (480, 768, 1280, 1920))
        return f'<picture><source type="image/webp" srcset="{srcset}" sizes="(max-width: 760px) 100vw, 48vw" /><img src="{src}" alt="{alt}" loading="lazy" /></picture>'
    return None

def update_images(s):
    def repl(m):
        src = m.group(1)
        alt = m.group(2)
        pic = picture_for(src, alt)
        return pic or m.group(0)
    return re.sub(r'<img src="([^"]*knowledge-operation\.png)" alt="([^"]*)"\s*/?>', repl, s)

count = 0
for path in sorted((ROOT / 'public/articles').rglob('*.html')):
    s = path.read_text(encoding='utf-8')
    title = get_title(s)
    desc = get_meta(s, 'description') or title
    models = MODEL_RE.findall(title + ' ' + desc + ' ' + re.sub(r'<[^>]+>', ' ', s[:4000]))
    keywords = ','.join(dict.fromkeys([title, *models, *GENERIC.split(',')]))
    s = upsert_meta(s, f'<meta name="keywords" content="{html.escape(keywords, quote=True)}" />')
    s = upsert_meta(s, f'<meta property="og:title" content="{html.escape(title + " | 宁波志凡焊材有限公司", quote=True)}" />')
    s = upsert_meta(s, f'<meta property="og:description" content="{html.escape(desc[:150], quote=True)}" />')
    s = update_images(s)
    path.write_text(s, encoding='utf-8', newline='\n')
    count += 1
print({'updated': count})
