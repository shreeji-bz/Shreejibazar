// ============================================================
// 015 — Normalize the live games catalog (run from backend/ dir)
// Target set (matches the live home-screen list, 8 games):
//   Gali, Shree Ganesh, Disawar, Faridabad, Ghaziabad, Delhi Bazar,
//   Nepal Day, Nepal Night  (all active)
// - upserts the 8 target games (by slug, with proper times)
// - deactivates any games outside the target set (soft, status only)
// - ensures open rounds exist for today + tomorrow per active game
// Idempotent. Safe to re-run. No hard deletes.
// ============================================================
require('dotenv').config({ path: 'C:/free/Shreejibazar/shri-ji-bazaar/backend/.env' });
const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const TARGETS = [
  { name: 'Gali',         slug: 'gali',         open: '06:00', close: '11:35', result: '12:05' },
  { name: 'Shree Ganesh', slug: 'shri-ganesh',  open: '06:00', close: '04:30', result: '05:00' },
  { name: 'Disawar',      slug: 'disawar',      open: '06:00', close: '04:30', result: '05:00' },
  { name: 'Faridabad',    slug: 'faridabad',    open: '06:00', close: '05:50', result: '06:20' },
  { name: 'Ghaziabad',    slug: 'ghaziabad',    open: '06:00', close: '09:05', result: '09:35' },
  { name: 'Delhi Bazar',  slug: 'delhi-bazar',  open: '06:00', close: '03:00', result: '03:35' },
  { name: 'Nepal Day',    slug: 'nepal-day',    open: '07:00', close: '01:05', result: '01:05' },
  { name: 'Nepal Night',  slug: 'nepal-night',  open: '07:00', close: '09:05', result: '09:35' },
];

(async () => {
  // 1) upsert the 8 target games (by slug)
  for (const g of TARGETS) {
    const { error } = await s.from('games').upsert({
      name: g.name,
      slug: g.slug,
      status: 'active',
      description: g.name + ' - play and win big!',
      opening_time: g.open,
      closing_time: g.close,
      result_time: g.result,
    }, { onConflict: 'slug' });
    if (error) { console.error('upsert', g.name, 'FAILED:', error.message); process.exitCode = 1; }
  }

  // 2) deactivate any games NOT in the target set (soft: status only, so
  //    their rounds vanish from the app but history/wagers stay intact)
  const { data: allGames } = await s.from('games').select('id, name, slug, status');
  const liveSlugs = new Set(TARGETS.map(t => t.slug));
  for (const g of allGames) {
    if (liveSlugs.has(g.slug)) continue;
    if (g.status === 'active') {
      const { error } = await s.from('games').update({ status: 'inactive' }).eq('id', g.id);
      console.log('deactivated extra game:', g.name, `(${g.slug})`, error ? 'ERROR: ' + error.message : '');
    }
  }

  // 3) ensure every target game has an open round for today + tomorrow
  const { data: actives } = await s.from('games').select('id, opening_time, slug').in('slug', [...liveSlugs]);
  const day0 = new Date(); day0.setUTCHours(0, 0, 0, 0);
  for (const g of actives) {
    for (const off of [0, 1]) {
      const start = new Date(day0.getTime() + off * 86400000);
      const hh = (g.opening_time || '06:00').slice(0, 2);
      const mm = (g.opening_time || '06:00').slice(3, 5);
      start.setUTCHours(+hh, +mm, 0, 0);
      const end = new Date(start.getTime() + 30 * 60000);
      const { data: exists } = await s.from('rounds').select('id').eq('game_id', g.id).eq('start_time', start.toISOString()).limit(1);
      if (!exists || exists.length === 0) {
        const { error } = await s.from('rounds').insert({
          game_id: g.id,
          round_number: String(Date.now() % 100000),
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          status: 'open',
        });
        console.log('created open round:', g.slug, off === 0 ? 'today' : 'tomorrow', error ? 'ERROR: ' + error.message : 'ok');
      }
    }
  }

  console.log('--- final catalog ---');
  const { data: fin } = await s.from('games').select('name, status, opening_time, closing_time, result_time').order('sort_order');
  for (const g of fin) {
    console.log('  ' + g.name.padEnd(14) + ' ' + g.status.padEnd(8) + ' open ' + g.opening_time + ' close ' + g.closing_time + ' result ' + g.result_time);
  }
})();
