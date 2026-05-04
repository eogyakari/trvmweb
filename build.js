// build.js — TRVM Build Script
// Reads _content/*/*.md files → generates JSON data files
// Run by Netlify on every deploy: "node build.js"

const fs   = require('fs');
const path = require('path');

function parseFrontmatter(raw) {
  const result = { meta: {}, content: '' };
  const match  = raw.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) { result.content = raw.trim(); return result; }
  result.content = match[2].trim();
  match[1].split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx < 0) return;
    const key = line.slice(0, idx).trim();
    let   val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (val === 'true')  { result.meta[key] = true;  return; }
    if (val === 'false') { result.meta[key] = false; return; }
    result.meta[key] = val;
  });
  return result;
}

function mdToHtml(md) {
  let html = (md || '')
    .replace(/^### (.+)$/gm,   '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,    '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,     '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>')
    .replace(/^> (.+)$/gm,     '<blockquote><p>$1</p></blockquote>')
    .replace(/^---$/gm,        '<hr/>');
  const lines = html.split('\n');
  const out = []; let inP = false;
  lines.forEach(line => {
    const l = line.trim();
    const isTag = /^<(h[1-6]|blockquote|hr|ul|ol|li)/.test(l);
    if (!l) { if (inP) { out.push('</p>'); inP = false; } }
    else if (isTag) { if (inP) { out.push('</p>'); inP = false; } out.push(l); }
    else { if (!inP) { out.push('<p>'); inP = true; } out.push(l); }
  });
  if (inP) out.push('</p>');
  return out.join('\n');
}

function embedUrl(url) {
  if (!url) return '';
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
  if (yt) return 'https://www.youtube.com/embed/' + yt[1];
  const vi = url.match(/vimeo\.com\/(\d+)/);
  if (vi) return 'https://player.vimeo.com/video/' + vi[1];
  return url;
}

function readCollection(folder) {
  const dir = path.join(__dirname, '_content', folder);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .sort().reverse()
    .map(filename => {
      const raw    = fs.readFileSync(path.join(dir, filename), 'utf8');
      const parsed = parseFrontmatter(raw);
      return { filename, meta: parsed.meta, content: parsed.content };
    });
}

function readSettings(name) {
  const file = path.join(__dirname, '_content', 'settings', name + '.json');
  if (!fs.existsSync(file)) return {};
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch(e) { return {}; }
}

function write(filename, data) {
  fs.writeFileSync(path.join(__dirname, filename), JSON.stringify(data, null, 2));
  const count = Array.isArray(data) ? data.length + ' item(s)' : 'written';
  console.log('  ✅ ' + filename + ' — ' + count);
}

console.log('\n🔨 TRVM Build Starting...\n');

// 1. Devotions
const devotions = readCollection('devotions')
  .filter(f => String(f.meta.published).toLowerCase() !== 'false')
  .map(f => ({
    id:        f.filename.replace('.md',''),
    title:     f.meta.title     || 'Untitled',
    date:      f.meta.date      || '',
    tag:       f.meta.tag       || 'Faith',
    scripture: f.meta.scripture || '',
    summary:   f.meta.summary   || '',
    content:   mdToHtml(f.content),
  }));
write('devotions-data.json', devotions);

// 2. Books
const books = readCollection('books')
  .filter(f => String(f.meta.published).toLowerCase() !== 'false')
  .map(f => ({
    id:          f.filename.replace('.md',''),
    title:       f.meta.title       || 'Untitled',
    author:      f.meta.author      || 'TRVM Ministry',
    description: f.meta.description || '',
    category:    f.meta.category    || 'Faith',
    access:      f.meta.access      || 'coming',
    coverColor:  f.meta.cover_color || '#4A1A7A',
    pdfUrl:      f.meta.pdf         || '',
    coverImage:  f.meta.cover_image || '',
  }));
write('books-data.json', books);

// 3. Magazine
const magazine = readCollection('magazine')
  .filter(f => String(f.meta.published).toLowerCase() !== 'false')
  .sort((a,b) => Number(b.meta.edition) - Number(a.meta.edition))
  .map(f => ({
    id:          f.filename.replace('.md',''),
    edition:     f.meta.edition     || '1',
    year:        f.meta.year        || '',
    title:       f.meta.title       || '',
    description: f.meta.description || '',
    pdfUrl:      f.meta.pdf         || '',
    coverImage:  f.meta.cover_image || '',
    access:      f.meta.access      || 'donation',
  }));
write('magazine-data.json', magazine);

// 4. Videos
const videos = readCollection('videos')
  .filter(f => String(f.meta.published).toLowerCase() !== 'false')
  .map(f => ({
    id:          f.filename.replace('.md',''),
    title:       f.meta.title       || 'Untitled',
    url:         f.meta.url         || '',
    embed:       embedUrl(f.meta.url || ''),
    description: f.meta.description || '',
    category:    f.meta.category    || 'Other',
    date:        f.meta.date        || '',
  }));
write('videos-data.json', videos);

// 5. Newsletter
const newsletter = readCollection('newsletter')
  .filter(f => String(f.meta.published).toLowerCase() !== 'false')
  .map(f => ({
    id:      f.filename.replace('.md',''),
    title:   f.meta.title   || 'Untitled',
    date:    f.meta.date    || '',
    summary: f.meta.summary || '',
    content: mdToHtml(f.content),
  }));
write('newsletter-data.json', newsletter);

// 6. Settings
const settings = {
  general:  readSettings('general'),
  homepage: readSettings('homepage'),
  about:    readSettings('about'),
};
write('settings-data.json', settings);

console.log('\n✅ Build complete!\n');
