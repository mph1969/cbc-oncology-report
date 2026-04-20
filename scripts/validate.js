#!/usr/bin/env node
/**
 * validate.js — OncologyReport pre-push checker
 * Extracts the <script> block from index.html and checks for syntax errors.
 * Run: node scripts/validate.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const FILES = ['index.html', 'labs.html'];

let allOk = true;

FILES.forEach(filename => {
  const filepath = path.join(ROOT, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`⚠  ${filename} not found — skipping`);
    return;
  }

  const html = fs.readFileSync(filepath, 'utf8');

  // ── Check for iOS en-dash corruption ────────────────────────
  const enDashCount = (html.match(/–[a-z]/g) || []).length;
  if (enDashCount > 5) {
    console.error(`✗  ${filename}: Possible iOS en-dash corruption detected (${enDashCount} occurrences of –[a-z])`);
    console.error('   CSS variables use -- (double hyphen). iOS autocorrect converts these to – (en-dash).');
    console.error('   Upload the file directly rather than copy-pasting.');
    allOk = false;
  }

  // ── Check for curly quotes inside JS strings ─────────────────
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/g);
  if (scriptMatch) {
    scriptMatch.forEach((block, i) => {
      if (block.includes('src=')) return; // skip external script tags
      const curlyInStrings = block.match(/["'][^"'\n]*[\u201C\u201D\u2018\u2019][^"'\n]*["']/g);
      if (curlyInStrings) {
        console.error(`✗  ${filename}: Curly quotes detected inside JS strings — will crash the browser`);
        console.error('   Replace \u201C \u201D with plain " " characters (or \u2018 \u2019 with \')');
        console.error('   First few offenders:');
        curlyInStrings.slice(0, 3).forEach(m => console.error('     ' + m.substring(0, 120)));
        allOk = false;
      }
    });
  }

  // ── Extract and syntax-check main script block ───────────────
  const scriptBlocks = [];
  const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    scriptBlocks.push(match[1]);
  }

  if (scriptBlocks.length === 0) {
    console.warn(`⚠  ${filename}: No inline script blocks found`);
    return;
  }

  const combined = scriptBlocks.join('\n');
  const tmpFile = path.join(__dirname, `_tmp_validate_${filename}.js`);

  // Stub browser globals so Node doesn't choke on them
  const stub = `
const window = { location: { search: '', href: '' }, open: () => {} };
const document = {
  getElementById: () => ({ className: '', style: { cssText: '' }, innerHTML: '', textContent: '', href: '' }),
  title: '',
  body: { className: '', style: { background: '' } },
};
const Chart = function(){};
Chart.prototype = { destroy: () => {} };
`;

  fs.writeFileSync(tmpFile, stub + combined, 'utf8');

  try {
    execSync(`node --check "${tmpFile}"`, { stdio: 'pipe' });
    console.log(`✓  ${filename}: JavaScript syntax OK`);
  } catch (err) {
    const output = err.stderr ? err.stderr.toString() : err.stdout.toString();
    // Filter out the stub lines from error line numbers
    const stubLines = stub.split('\n').length;
    const cleaned = output.replace(
      /\((\d+)\)/g,
      (_, ln) => `(line ~${Math.max(1, parseInt(ln) - stubLines)})`
    );
    console.error(`✗  ${filename}: JavaScript syntax error\n${cleaned}`);
    allOk = false;
  } finally {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }

  // ── Check DATA array has no orphaned body: lines ─────────────
  const orphanedBody = combined.match(/^\s+body:"[^"]*"\s*},\s*body:/m);
  if (orphanedBody) {
    console.error(`✗  ${filename}: Orphaned body: line detected in DATA/clinicalNotes`);
    allOk = false;
  }

  // ── Check image URLs match files in images\ folder ───────────
  const imagesDir = path.join(ROOT, 'images');
  if (fs.existsSync(imagesDir)) {
    const imageFiles = fs.readdirSync(imagesDir).map(f => f.toLowerCase());
    const urlMatches = combined.match(/url:"images\/([^"]+)"/g) || [];
    urlMatches.forEach(u => {
      const fname = u.replace('url:"images/', '').replace('"', '').toLowerCase();
      if (!imageFiles.includes(fname)) {
        console.warn(`⚠  ${filename}: Image referenced but not found in images\\ folder: ${fname}`);
      }
    });
  }
});

console.log('');
if (allOk) {
  console.log('✅  All checks passed — safe to push');
  process.exit(0);
} else {
  console.log('❌  Errors found — fix before pushing');
  process.exit(1);
}
