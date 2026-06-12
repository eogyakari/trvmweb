// build.js — TRVM Build Script
// Reads _content/*/*.md files and generates JSON data files
// Run by Netlify on every deploy: "node build.js"

'use strict';

var fs   = require('fs');
var path = require('path');

// ── Frontmatter parser ──────────────────────────────────────
function parseFrontmatter(raw) {
  var result = { meta: {}, content: '' };
  var match  = raw.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) { result.content = raw.trim(); return result; }
  result.content = match[2].trim();
  match[1].split('\n').forEach(function(line) {
    var idx = line.indexOf(':');
    if (idx < 0) return;
    var key = line.slice(0, idx).trim();
    var val = line.slice(idx + 1).trim();
    if ((val.charAt(0) === '"' && val.charAt(val.length-1) === '"') ||
        (val.charAt(0) === "'" && val.charAt(val.length-1) === "'")) {
      val = val.slice(1, -1);
    }
    if (val === 'true')  { result.meta[key] = true;  return; }
    if (val === 'false') { result.meta[key] = false; return; }
    result.meta[key] = val;
  });
  return result;
}

// ── Markdown to HTML ─────────────────────────────────────────
function mdToHtml(md) {
  var html = (md || '')
    .replace(/^### (.+)$/gm,   '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,    '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,     '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>')
    .replace(/^> (.+)$/gm,     '<blockquote><p>$1</p></blockquote>')
    .replace(/^---$/gm,        '<hr/>');
  var lines = html.split('\n');
  var out   = [];
  var inP   = false;
  lines.forEach(function(line) {
    var l      = line.trim();
    var isTag  = /^<(h[1-6]|blockquote|hr|ul|ol|li)/.test(l);
    if (!l) {
      if (inP) { out.push('</p>'); inP = false; }
    } else if (isTag) {
      if (inP) { out.push('</p>'); inP = false; }
      out.push(l);
    } else {
      if (!inP) { out.push('<p>'); inP = true; }
      out.push(l);
    }
  });
  if (inP) out.push('</p>');
  return out.join('\n');
}

// ── Embed URL ────────────────────────────────────────────────
function embedUrl(url) {
  if (!url) return '';
  var yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
  if (yt) return 'https://www.youtube.com/embed/' + yt[1];
  var vi = url.match(/vimeo\.com\/(\d+)/);
  if (vi) return 'https://player.vimeo.com/video/' + vi[1];
  return url;
}

// ── Read collection folder ───────────────────────────────────
function readCollection(folder) {
  var dir = path.join(__dirname, '_content', folder);
  if (!fs.existsSync(dir)) {
    console.log('  ℹ️  _content/' + folder + '/ not found — skipping');
    return [];
  }
  var files = fs.readdirSync(dir).filter(function(f) { return f.endsWith('.md'); });
  files.sort().reverse();
  return files.map(function(filename) {
    try {
      var raw    = fs.readFileSync(path.join(dir, filename), 'utf8');
      var parsed = parseFrontmatter(raw);
      return { filename: filename, meta: parsed.meta, content: parsed.content };
    } catch(e) {
      console.log('  ⚠️  Error reading ' + filename + ': ' + e.message);
      return null;
    }
  }).filter(function(f) { return f !== null; });
}

// ── Read settings JSON ───────────────────────────────────────
function readSettings(name) {
  var file = path.join(__dirname, '_content', 'settings', name + '.json');
  if (!fs.existsSync(file)) return {};
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch(e) { return {}; }
}

// ── Published filter ─────────────────────────────────────────
function isPublished(f) {
  var p = f.meta.published;
  return String(p).toLowerCase() !== 'false';
}

// ── Write JSON ───────────────────────────────────────────────
function write(filename, data) {
  try {
    fs.writeFileSync(
      path.join(__dirname, filename),
      JSON.stringify(data, null, 2)
    );
    var count = Array.isArray(data) ? data.length + ' item(s)' : 'written';
    console.log('  ✅ ' + filename + ' — ' + count);
  } catch(e) {
    console.log('  ❌ Failed to write ' + filename + ': ' + e.message);
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════
console.log('\n🔨 TRVM Build Starting...\n');

// 1. Devotions
var devotions = readCollection('devotions')
  .filter(isPublished)
  .map(function(f) {
    return {
      id:        f.filename.replace('.md', ''),
      title:     f.meta.title     || 'Untitled',
      date:      f.meta.date      || '',
      tag:       f.meta.tag       || 'Faith',
      scripture: f.meta.scripture || '',
      summary:   f.meta.summary   || '',
      content:   mdToHtml(f.content)
    };
  });
write('devotions-data.json', devotions);

// Also write as a JS file — loaded directly as a script tag, no fetch needed
var jsContent = 'window.CMS_DEVOTIONS = ' + JSON.stringify(devotions).split('<'+'/script>').join('<\/script>') + ';';
fs.writeFileSync(path.join(process.cwd(), 'devotions-data.js'), jsContent);
console.log('  ✅ devotions-data.js — ' + devotions.length + ' devotion(s)');

// 2. Books
var books = readCollection('books')
  .filter(isPublished)
  .map(function(f) {
    return {
      id:          f.filename.replace('.md', ''),
      title:       f.meta.title       || 'Untitled',
      author:      f.meta.author      || 'TRVM Ministry',
      description: f.meta.description || '',
      category:    f.meta.category    || 'Faith',
      access:      f.meta.access      || 'coming',
      coverColor:  f.meta.cover_color || '#4A1A7A',
      pdfUrl:      f.meta.pdf         || '',
      coverImage:  f.meta.cover_image || ''
    };
  });
write('books-data.json', books);
var booksJs = 'window.CMS_BOOKS = ' + JSON.stringify(books).split('<' + '/script>').join('<\/script>') + ';';
fs.writeFileSync(path.join(process.cwd(), 'books-data.js'), booksJs);
console.log('  \u2705 books-data.js \u2014 ' + books.length + ' book(s)');

// 3. Magazine
var magazine = readCollection('magazine')
  .filter(isPublished)
  .sort(function(a, b) { return Number(b.meta.edition) - Number(a.meta.edition); })
  .map(function(f) {
    return {
      id:          f.filename.replace('.md', ''),
      edition:     f.meta.edition     || '1',
      year:        f.meta.year        || '',
      title:       f.meta.title       || '',
      description: f.meta.description || '',
      pdfUrl:      f.meta.pdf         || '',
      coverImage:  f.meta.cover_image || '',
      access:      f.meta.access      || 'donation'
    };
  });
write('magazine-data.json', magazine);
var magazineJs = 'window.CMS_MAGAZINE = ' + JSON.stringify(magazine).split('<' + '/script>').join('<\/script>') + ';';
fs.writeFileSync(path.join(process.cwd(), 'magazine-data.js'), magazineJs);
console.log('  \u2705 magazine-data.js \u2014 ' + magazine.length + ' issue(s)');

// 4. Videos
var videos = readCollection('videos')
  .filter(isPublished)
  .map(function(f) {
    return {
      id:          f.filename.replace('.md', ''),
      title:       f.meta.title       || 'Untitled',
      url:         f.meta.url         || '',
      embed:       embedUrl(f.meta.url || ''),
      description: f.meta.description || '',
      category:    f.meta.category    || 'Other',
      date:        f.meta.date        || ''
    };
  });
write('videos-data.json', videos);

// 5. Newsletter
var newsletter = readCollection('newsletter')
  .filter(isPublished)
  .map(function(f) {
    return {
      id:      f.filename.replace('.md', ''),
      title:   f.meta.title   || 'Untitled',
      date:    f.meta.date    || '',
      summary: f.meta.summary || '',
      content: mdToHtml(f.content)
    };
  });
write('newsletter-data.json', newsletter);

// 6. Settings
var settings = {
  general:  readSettings('general'),
  homepage: readSettings('homepage'),
  about:    readSettings('about')
};
write('settings-data.json', settings);




console.log('\n✅ Build complete!\n');