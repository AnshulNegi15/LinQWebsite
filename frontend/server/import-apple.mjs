import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { database, unwrap } from './admin.js';

const [kind, day, appId, ...paths] = process.argv.slice(2);
if (!['downloads', 'crashes'].includes(kind) || !/^\d{4}-\d{2}-\d{2}$/.test(day || '') ||
    !/^\d+$/.test(appId || '') || !paths.length) {
  console.error('Usage: node --env-file=.env.local server/import-apple.mjs downloads|crashes YYYY-MM-DD APPLE_APP_ID FILE [FILE …]');
  process.exit(1);
}

const countField = kind === 'downloads' ? 'Counts' : 'Crashes';
const dimensions = kind === 'downloads' ? ['Territory', 'Source Type'] : ['App Version'];
const fields = ['Date', 'App Apple Identifier', countField, ...dimensions];
if (kind === 'downloads') fields.push('Download Type');
const totals = new Map();
let matchingRows = 0;

try {
  for (const path of paths) {
    const contents = await readFile(path);
    const tsv = contents[0] === 0x1f && contents[1] === 0x8b ? gunzipSync(contents) : contents;
    const [header, ...lines] = tsv.toString('utf8').replace(/^\uFEFF/, '').split(/\r?\n/);
    const columns = header.split('\t').map(value => value.trim().replace(/\s+/g, ' '));
    if (!fields.every(field => columns.includes(field)) || columns.includes('Source Info')) {
      throw new Error('Expected the standard Apple Analytics daily report for the requested kind.');
    }
    const indexes = Object.fromEntries(fields.map(field => [field, columns.indexOf(field)]));
    for (const line of lines) {
      if (!line.trim()) continue;
      const cells = line.split('\t');
      if (cells.length !== columns.length) throw new Error('Invalid Apple TSV row.');
      const field = name => cells[indexes[name]].trim();
      if (field('App Apple Identifier') !== appId) continue;
      if (field('Date') !== day) throw new Error('Provide all complete daily segments for just the requested date.');
      matchingRows += 1;
      if (kind === 'downloads' && !['first-time download', 'redownload'].includes(field('Download Type').toLowerCase())) continue;
      const count = Number(field(countField));
      if (!/^\d+$/.test(field(countField)) || !Number.isSafeInteger(count)) throw new Error('Invalid Apple report count.');
      const labels = dimensions.map(name => field(name) || 'Unavailable');
      const key = JSON.stringify(labels);
      const total = (totals.get(key)?.total ?? 0) + count;
      if (!Number.isSafeInteger(total)) throw new Error('Apple report total is too large.');
      totals.set(key, kind === 'downloads' ? { territory: labels[0], source: labels[1], total } : { version: labels[0], total });
    }
  }
  if (!matchingRows) throw new Error('No rows matched that Apple app ID and date.');
  unwrap(await database().from('dashboard_apple_daily').upsert({
    kind, day, rows: [...totals.values()], imported_at: new Date().toISOString(),
  }, { onConflict: 'kind,day' }));
  console.log(`Imported ${kind} for ${day} (${totals.size} aggregate rows).`);
} catch (error) {
  console.error('Apple import failed:', error.code || error.message);
  process.exitCode = 1;
}
