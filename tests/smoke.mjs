/* decision-helper-bd -- headless-Chrome smoke tests (file:// + raw CDP).
   Usage: node tests/smoke.mjs [--mobile]
   Mobile mode emulates a 390px viewport. */
import { spawn, execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MOBILE = process.argv.includes('--mobile');
const PORT = MOBILE ? 9224 : 9223;
const BASE = fileURLToPath(new URL('..', import.meta.url));
const PAGE_URL = 'file://' + join(BASE, 'index.html');
const CHROME_CANDIDATES = ['chrome', 'google-chrome', 'chromium', 'chromium-browser', '/opt/meta-chromium/chrome'];

function findChrome() {
  for (const c of CHROME_CANDIDATES) {
    try {
      if (c.includes('/')) { execSync('test -x ' + c, { stdio: 'ignore' }); return c; }
      execSync('command -v ' + c, { stdio: 'ignore' }); return c;
    } catch { /* try next */ }
  }
  throw new Error('no chrome binary found');
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function httpJson(url) {
  const res = await fetch(url);
  return res.json();
}
function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
    ws.onopen = () => resolve({
      send(method, params = {}) {
        return new Promise((res, rej) => {
          const mid = ++id;
          pending.set(mid, { res, rej });
          ws.send(JSON.stringify({ id: mid, method, params }));
        });
      },
      close() { ws.close(); }
    });
    ws.onerror = reject;
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) rej(new Error(JSON.stringify(msg.error)));
        else res(msg.result);
      }
    };
  });
}
async function evaluate(client, expr) {
  const r = await client.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error('eval failed: ' + JSON.stringify(r.exceptionDetails).slice(0, 500));
  return r.result.value;
}

let passed = 0;
function check(name, cond, extra = '') {
  if (!cond) throw new Error('FAIL: ' + name + ' ' + extra);
  passed += 1;
  console.log('ok - ' + name);
}

const chrome = findChrome();
const userDataDir = join(tmpdir(), 'dh-smoke-' + PORT + '-' + Date.now());
const proc = spawn(chrome, [
  '--headless=new', '--no-sandbox', '--no-proxy-server',
  '--disable-features=LocalNetworkAccessChecks',
  '--remote-debugging-port=' + PORT,
  '--user-data-dir=' + userDataDir, 'about:blank'
], { stdio: 'ignore', detached: true });

let failed = null;
try {
  let tabs = [];
  for (let i = 0; i < 50 && tabs.length === 0; i++) {
    await sleep(300);
    try { tabs = (await httpJson('http://127.0.0.1:' + PORT + '/json/list')).filter((t) => t.type === 'page'); } catch { /* not up yet */ }
  }
  if (!tabs.length) throw new Error('chrome did not start');
  const client = await connect(tabs[0].webSocketDebuggerUrl);
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  if (MOBILE) {
    await client.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  }
  await client.send('Page.navigate', { url: PAGE_URL });
  for (let i = 0; i < 50; i++) {
    await sleep(200);
    const ready = await evaluate(client, 'document.readyState');
    if (ready === 'complete') break;
  }
  await sleep(400);

  const errors = [];
  await client.send('Runtime.evaluate', {
    expression: `window.__dhErrors = []; window.addEventListener('error', e => window.__dhErrors.push(String(e.message || e.error))); window.addEventListener('unhandledrejection', e => window.__dhErrors.push('rejection:' + String(e.reason)));`,
    returnByValue: true
  });

  // 1. Title + honesty note render.
  check('title renders', await evaluate(client, `document.getElementById('app-title').textContent === 'Decision Helper'`));
  check('honesty note visible', await evaluate(client, `document.getElementById('honesty-note').textContent.includes('does not decide')`));

  // 2. Default decision: 2 options x 2 criteria, all scores 5 -> totals 25 each, tie -> Option A first.
  check('default winner tie -> Option A', await evaluate(client, `(() => { const el = document.querySelector('.winner-name'); return el && el.textContent === 'Option A'; })()`));
  check('default gap 0', await evaluate(client, `document.querySelector('.winner-gap').textContent.includes('0')`));

  // 3. Fixed case via logic API: X=32, Y=33, winner Y, sensitivity flips on A and B.
  const fixed = await evaluate(client, `(() => {
    const d = DH_LOGIC.newDecision();
    d.title = 'Fixed';
    d.options = [{id:'oX',name:'X'},{id:'oY',name:'Y'}];
    d.criteria = [{id:'cA',name:'A',weight:3},{id:'cB',name:'B',weight:2}];
    d.scores = { oX:{cA:8,cB:4}, oY:{cA:5,cB:9} };
    const r = DH_LOGIC.computeResults(d);
    return { totals: r.totals.map(x => x.name + ':' + x.total), winner: r.winner.name, gap: r.gap,
      sens: r.sensitivity.map(s => s.criterion + ':' + s.fromWeight + '->' + s.toWeight + '=>' + s.newWinner).sort().join('|') };
  })()`);
  check('fixed totals 32/33', fixed.totals.join(',') === 'X:32,Y:33', JSON.stringify(fixed));
  check('fixed winner Y gap 1', fixed.winner === 'Y' && fixed.gap === 1);
  check('fixed sensitivity A+B flip', fixed.sens === 'A:3->4=>X|B:2->1=>X', fixed.sens);

  // 4. UI flow: rename title, change a score, results update live.
  await evaluate(client, `(() => {
    const t = document.getElementById('f-title');
    t.value = 'Laptop pick'; t.dispatchEvent(new Event('input', {bubbles:true}));
    const firstScore = document.querySelector('.score-grid tbody input');
    firstScore.value = '10'; firstScore.dispatchEvent(new Event('input', {bubbles:true})); firstScore.dispatchEvent(new Event('change', {bubbles:true}));
  })()`);
  await sleep(200);
  check('score edit updates winner total', await evaluate(client, `(() => { const el = document.querySelector('.winner-total'); return el && el.textContent.includes('40'); })()`));

  // 5. Add option -> 3 options; add criterion -> 3 criteria; validation still passes.
  await evaluate(client, `(() => {
    document.getElementById('btn-add-opt').click();
    document.getElementById('btn-add-cri').click();
    document.querySelectorAll('#options-box input[type="text"]').forEach(el => { if (!el.value) { el.value = 'Option C'; el.dispatchEvent(new Event('input', {bubbles:true})); } });
    document.querySelectorAll('#criteria-box input[type="text"]').forEach(el => { if (!el.value) { el.value = 'Speed'; el.dispatchEvent(new Event('input', {bubbles:true})); } });
  })()`);
  await sleep(200);
  check('add option + criterion', await evaluate(client, `document.querySelectorAll('.score-grid tbody tr').length === 3 && document.querySelectorAll('.score-grid thead th').length === 4`));

  // 6. Pros/cons: add a pro to first option, it renders.
  await evaluate(client, `(() => {
    const input = document.querySelector('[id^="pc-input-"][id$="-pro"]');
    input.value = 'Cheap'; input.dispatchEvent(new Event('input', {bubbles:true}));
    input.closest('.row').querySelector('[data-add-pc]').click();
  })()`);
  await sleep(200);
  check('pro renders', await evaluate(client, `document.body.textContent.includes('Cheap')`));

  // 7. Save -> appears in saved list; export/import round-trip via logic API.
  await evaluate(client, `(() => { document.getElementById('btn-save').click(); })()`);
  await sleep(200);
  check('saved list shows decision', await evaluate(client, `(() => { const rows = document.querySelectorAll('.saved-row'); return rows.length === 1 && document.body.textContent.includes('Laptop pick'); })()`));
  const rt = await evaluate(client, `(() => {
    const d = DH_LOGIC.newDecision(); d.title = 'RT';
    const imp = DH_LOGIC.importState(DH_LOGIC.exportState([d]));
    return imp.ok && imp.decisions[0].title === 'RT';
  })()`);
  check('export/import round-trip', rt === true);

  // 8. BN toggle: title switches to Bengali, digits convert.
  await evaluate(client, `(() => { document.getElementById('btn-lang').click(); })()`);
  await sleep(200);
  check('BN title', await evaluate(client, `document.getElementById('app-title').textContent === '\u09b8\u09bf\u09a6\u09cd\u09a7\u09be\u09a8\u09cd\u09a4 \u09b8\u09b9\u09be\u09af\u09bc\u0995'`));
  check('BN digits in winner total', await evaluate(client, `(() => { const el = document.querySelector('.winner-total'); return el && /[\u09e6-\u09ef]/.test(el.textContent); })()`));
  await evaluate(client, `(() => { document.getElementById('btn-lang').click(); })()`);
  await sleep(200);
  check('back to EN', await evaluate(client, `document.getElementById('app-title').textContent === 'Decision Helper'`));

  // 9. Erase-all flow: prompt stub returns DELETE -> saved list empties.
  await evaluate(client, `(() => { window.prompt = () => 'DELETE'; window.alert = () => {}; document.getElementById('btn-erase').click(); })()`);
  await sleep(200);
  check('erase-all empties saved', await evaluate(client, `document.querySelectorAll('.saved-row').length === 0`));

  // 10. Mobile: no horizontal overflow.
  if (MOBILE) {
    check('no horizontal overflow at 390px', await evaluate(client, `document.documentElement.scrollWidth <= 391`));
  }

  // 11. No console/page errors collected.
  const errs = await evaluate(client, 'window.__dhErrors');
  check('zero page errors', Array.isArray(errs) && errs.length === 0, JSON.stringify(errs));

  client.close();
  console.log('ALL ' + passed + ' SMOKE TESTS PASSED (' + (MOBILE ? 'mobile' : 'desktop') + ')');
} catch (e) {
  failed = e;
  console.error('SMOKE FAILED: ' + (e && e.stack ? e.stack : e));
} finally {
  try { process.kill(-proc.pid, 'SIGKILL'); } catch { /* already dead */ }
  try { execSync('rm -rf ' + userDataDir); } catch { /* ignore */ }
}
if (failed) process.exit(1);
