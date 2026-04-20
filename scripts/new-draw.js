#!/usr/bin/env node
/**
 * new-draw.js — Scaffold a new blood draw DATA entry for index.html
 * Run: node scripts/new-draw.js
 *
 * Prompts for date and draw type, then outputs a ready-to-paste DATA entry.
 */

const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

// Cycle schedule
const CYCLES = [
  { n:1, date:'Jan 19, 2026' },
  { n:2, date:'Feb 11, 2026' },
  { n:3, date:'Mar 9, 2026'  },
  { n:4, date:'Mar 30, 2026' },
  { n:5, date:'Apr 21, 2026' },
  { n:6, date:'~May 12, 2026' },
  { n:7, date:'~Jun 2, 2026'  },
  { n:8, date:'~Jun 23, 2026' },
];

const DRAW_TYPES = [
  { key:'c1d7',   label:'C(n) Day 7',        shortEn:'C{n}D7',  shortZh:'第{n}周期第7天' },
  { key:'c1d14',  label:'C(n) Day 14',       shortEn:'C{n}D14', shortZh:'第{n}周期第14天' },
  { key:'prec',   label:'Pre-Cycle (Day 18)', shortEn:'Pre-C{n}', shortZh:'第{n}周期前（第{p}周期第18天）' },
];

async function main() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   OncologyReport — New Draw Scaffold         ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  // Date
  const dateStr = await ask('Draw date (e.g. Apr 28, 2026): ');
  if (!dateStr.trim()) { console.log('Date required.'); rl.close(); return; }

  // Parse short date for DATA entry (e.g. "Apr 28")
  const dateParts = dateStr.trim().split(',');
  const shortDate = dateParts[0].trim(); // e.g. "Apr 28"

  // Cycle number
  console.log('\nCycles:');
  CYCLES.forEach(c => console.log(`  ${c.n}. Cycle ${c.n} (${c.date})`));
  const cycleNum = parseInt(await ask('Which cycle? (1-8): '));
  if (isNaN(cycleNum) || cycleNum < 1 || cycleNum > 8) {
    console.log('Invalid cycle.'); rl.close(); return;
  }

  // Draw type
  console.log('\nDraw types:');
  console.log('  1. Day 7 (C(n)D7)');
  console.log('  2. Day 14 (C(n)D14)');
  console.log('  3. Pre-cycle check (Day 18)');
  const drawType = parseInt(await ask('Draw type (1-3): '));

  let dateLabel, cycleZH;
  if (drawType === 1) {
    dateLabel = `C${cycleNum}D7`;
    cycleZH   = `第${cycleNum}周期第7天`;
  } else if (drawType === 2) {
    dateLabel = `C${cycleNum}D14`;
    cycleZH   = `第${cycleNum}周期第14天`;
  } else {
    dateLabel = `Pre-C${cycleNum}`;
    cycleZH   = `第${cycleNum - 1}周期第18天（第${cycleNum}周期前）`;
  }

  // Image count
  const imgCount = parseInt(await ask('Number of images for this draw (0 to skip): ') || '0');

  // LFT drawn?
  const hasLFT = (await ask('LFT (liver function) drawn same day? (y/n): ')).toLowerCase() === 'y';

  rl.close();

  // Build date string for image folder (strip spaces, lowercase month)
  const dateForFile = dateStr.trim()
    .replace(/,.*/, '')        // "Apr 28"
    .replace(/\s+/g, '')       // "Apr28"
    .toLowerCase();            // "apr28"

  // Actually we need YYYYMMDD format
  const monthMap = {jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',
                    jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12'};
  const parts = shortDate.split(' ');
  const monthKey = parts[0].toLowerCase().slice(0,3);
  const dayNum   = parts[1].padStart(2,'0');
  const year     = (dateStr.match(/\d{4}/) || ['2026'])[0];
  const yyyymmdd = `${year}${monthMap[monthKey] || '00'}${dayNum}`;

  // Generate image entries
  const imageEntries = Array.from({length: imgCount}, (_,i) =>
    `      { label:"Page ${i+1}", url:"images/${yyyymmdd}-${i+1}.jpeg" },`
  ).join('\n');

  // Generate LFT block
  const lftBlock = hasLFT ? `    lft:{ ALT:null, AST:null, ALP:null, GGT:null, TBIL:null, DBIL:null, IBIL:null,
          ALB:null, GLB:null, TP:null, AG:null, CHE:null, TBA:null, PA:null, ADA:null, AFU:null },\n` : '';

  const imageBlock = imgCount > 0 ? `    images:[\n${imageEntries}\n    ],\n` : '';

  // Output
  console.log('\n\n══════════════════════════════════════════════════════');
  console.log('  PASTE THIS INTO index.html DATA array (before ]);');
  console.log('══════════════════════════════════════════════════════\n');

  console.log(`  { date:"${shortDate}\\n${dateLabel}", fullDate:"${dateStr.trim()}", cycleZH:"${cycleZH}",
    WBC:null, Neut_abs:null, Neut_pct:null, PLT:null, HGB:null, RBC:null,
    Lymph_abs:null, Lymph_pct:null, Mono_abs:null, Mono_pct:null,
    Hct:null, MCV:null, MCH:null, MCHC:null, RDW_CV:null, RDW_SD:null,
    MPV:null, PDW:null, PCT:null, P_LCR:null, Eos_pct:null, Eos_abs:null, Baso_pct:null, Baso_abs:null,
${lftBlock}${imageBlock}  },`);

  console.log('\n══════════════════════════════════════════════════════');
  console.log('  ALSO UPDATE in index.html:');
  console.log('══════════════════════════════════════════════════════');
  console.log(`  • T.en.timelineNote  — mention "${dateStr.trim()} = ${dateLabel}"`);
  console.log(`  • T.en.flagsTitle    — "Latest Draw (${dateStr.trim()} · ${dateLabel})"`);
  console.log(`  • T.en.chartNote     — add "${shortDate} (${dateLabel})" to sequence`);
  console.log(`  • T.zh — same fields in Chinese`);
  console.log(`  • drawLabels_en (renderMFull): add "${shortDate} · ${dateLabel}"`);
  console.log(`  • drawLabels_zh (renderMFull): add corresponding Chinese label`);
  if (hasLFT) {
    console.log(`  • drawLabels_en (renderMLFT): add "${shortDate} · ${dateLabel}"`);
    console.log(`  • drawLabels_zh (renderMLFT): add corresponding Chinese label`);
  }
  console.log(`  • FAMILY_CONTENT: update lastUpdated, systems, prayerRequests, shareText`);
  console.log('');
  console.log('══════════════════════════════════════════════════════');
  console.log('  UPDATE labs.html DRAW object:');
  console.log('══════════════════════════════════════════════════════');
  console.log(`  date:      "${dateStr.trim()}",`);
  console.log(`  cycle:     "${dateLabel.replace('Pre-C', 'Pre-Cycle ').replace(/C(\d+)D/, 'Cycle $1 · Day ')}",`);
  console.log(`  cycleZH:   "${cycleZH}",`);
  console.log('');
  console.log(`  Image folder: images\\${yyyymmdd}-1.jpeg ... ${yyyymmdd}-${imgCount}.jpeg`);
  console.log('\nDone. Run validate.js after filling in values.\n');
}

main().catch(console.error);
