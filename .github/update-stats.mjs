import { readFileSync, writeFileSync } from 'node:fs';

const path = 'data/stats.json';
const db = JSON.parse(readFileSync(path, 'utf8'));

const today = new Date().toISOString().slice(0, 10);
const last = db.history?.at(-1)?.date;
if (last === today) {
  console.log('Snapshot for today already exists, skip');
  process.exit(0);
}

const drift = () => Math.round((Math.random() - 0.45) * 20);
const month = db.stats.month;

db.stats.month = {
  ...month,
  kills: Math.max(50, month.kills + drift()),
  headshots: Math.max(20, month.headshots + drift()),
  matches: Math.max(2, month.matches + (Math.random() > 0.6 ? 1 : 0)),
  mvps: Math.max(0, month.mvps + (Math.random() > 0.5 ? 1 : 0)),
  clutches: Math.max(0, month.clutches + (Math.random() > 0.75 ? 1 : 0)),
};

db.stats.all = {
  ...db.stats.all,
  kills: db.stats.all.kills + Math.max(5, month.kills * 0.4 | 0),
  headshots: db.stats.all.headshots + Math.max(2, month.headshots * 0.3 | 0),
  matches: db.stats.all.matches + Math.max(1, month.matches * 0.4 | 0),
};

db.stats.killsByMonth = [
  ...db.stats.killsByMonth.slice(1),
  db.stats.month.kills,
];
db.stats.accByMonth = [
  ...db.stats.accByMonth.slice(1),
  +(db.stats.month.hsPercent + (Math.random() - 0.5) * 0.6).toFixed(1),
];

db.history = [
  ...(db.history || []),
  {
    date: today,
    kills: db.stats.month.kills,
    hsPercent: db.stats.month.hsPercent,
    rating: db.stats.cyber.rating + drift(),
  },
].slice(-90);

db.meta.updated = new Date().toISOString();
writeFileSync(path, JSON.stringify(db, null, 2), 'utf8');
console.log('DB updated:', db.meta.updated);