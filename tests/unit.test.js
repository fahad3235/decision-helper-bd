/* decision-helper-bd -- node unit tests (run: node tests/unit.test.js) */
'use strict';
const assert = require('assert');
const L = require('../js/logic.js');

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log('ok - ' + name);
}

// Fixed hand-verified case: 2 options x 2 criteria.
// Criteria: A weight 3, B weight 2.
// X: A=8, B=4 -> 3*8 + 2*4 = 32.  Y: A=5, B=9 -> 3*5 + 2*9 = 33.
function fixedDecision() {
  const d = L.newDecision();
  d.title = 'Fixed case';
  d.options = [{ id: 'oX', name: 'X' }, { id: 'oY', name: 'Y' }];
  d.criteria = [{ id: 'cA', name: 'A', weight: 3 }, { id: 'cB', name: 'B', weight: 2 }];
  d.scores = {
    oX: { cA: 8, cB: 4 },
    oY: { cA: 5, cB: 9 }
  };
  return d;
}

check('fixed case totals and winner', () => {
  const d = fixedDecision();
  assert.deepStrictEqual(L.validateDecision(d), []);
  const res = L.computeResults(d);
  const byName = {};
  res.totals.forEach((r) => { byName[r.name] = r.total; });
  assert.strictEqual(byName.X, 32);
  assert.strictEqual(byName.Y, 33);
  assert.strictEqual(res.winner.name, 'Y');
  assert.strictEqual(res.gap, 1);
  assert.strictEqual(res.ranking[0].name, 'Y');
  assert.strictEqual(res.ranking[1].name, 'X');
  assert.strictEqual(res.ranking[0].maxPossible, 50);
  assert.strictEqual(res.ranking[0].pct, 66);
});

check('fixed case sensitivity: both criteria can flip the winner', () => {
  const res = L.computeResults(fixedDecision());
  // A weight 3->4: X=40, Y=38 (flips). B weight 2->1: X=28, Y=24 (flips).
  const crits = res.sensitivity.map((s) => s.criterion + ':' + s.fromWeight + '->' + s.toWeight + '=>' + s.newWinner).sort();
  assert.deepStrictEqual(crits, ['A:3->4=>X', 'B:2->1=>X']);
});

check('sensitivity skips out-of-range weights', () => {
  const d = fixedDecision();
  d.criteria[0].weight = 5; // A at max: +1 skipped
  d.criteria[1].weight = 1; // B at min: -1 skipped
  const res = L.computeResults(d);
  res.sensitivity.forEach((s) => {
    assert.ok(s.toWeight >= 1 && s.toWeight <= 5, 'weight in range');
  });
});

check('tie breaks by name ascending', () => {
  const d = fixedDecision();
  d.scores.oY = { cA: 8, cB: 4 }; // equal totals 32/32
  const res = L.computeResults(d);
  assert.strictEqual(res.ranking[0].name, 'X');
  assert.strictEqual(res.gap, 0);
});

check('results render without title; save still requires it', () => {
  const d = L.newDecision();
  assert.deepStrictEqual(L.mathErrors(d), []);
  assert.ok(L.validateDecision(d).some((e) => /Title/.test(e)));
  assert.ok(L.computeResults(d).winner);
});

check('newDecision has valid defaults', () => {
  const d = L.newDecision();
  d.title = 'Defaults';
  assert.strictEqual(d.options.length, 2);
  assert.strictEqual(d.criteria.length, 2);
  assert.deepStrictEqual(L.validateDecision(d), []);
  const res = L.computeResults(d);
  assert.strictEqual(res.winner.total, 25); // (3+2)*5
});

check('validation catches bad input', () => {
  const d = L.newDecision();
  d.title = '';
  assert.ok(L.validateDecision(d).length > 0);
  d.title = 'T';
  d.options = [{ id: 'a', name: 'Same' }, { id: 'b', name: 'same' }];
  assert.ok(L.validateDecision(d).some((e) => /unique/i.test(e)));
  d.options = [{ id: 'a', name: 'Only one' }];
  assert.ok(L.validateDecision(d).some((e) => /2-6/.test(e)));
  const d2 = L.newDecision();
  d2.criteria[0].weight = 9;
  assert.ok(L.validateDecision(d2).some((e) => /weight/i.test(e)));
  const d3 = L.newDecision();
  d3.scores[d3.options[0].id][d3.criteria[0].id] = 11;
  assert.ok(L.validateDecision(d3).some((e) => /Score/i.test(e)));
  const d4 = L.newDecision();
  d4.prosCons = { [d4.options[0].id]: [{ id: 'x', kind: 'pro', text: '' }] };
  assert.ok(L.validateDecision(d4).length > 0);
});

check('criteria count limits enforced', () => {
  const d = L.newDecision();
  d.criteria = [];
  assert.ok(L.validateDecision(d).some((e) => /1-6/.test(e)));
  d.criteria = Array.from({ length: 7 }, (_, i) => ({ id: 'c' + i, name: 'C' + i, weight: 1 }));
  assert.ok(L.validateDecision(d).some((e) => /1-6/.test(e)));
});

check('export/import round-trip', () => {
  const d = fixedDecision();
  const text = L.exportState([d]);
  const res = L.importState(text);
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.decisions.length, 1);
  assert.strictEqual(res.decisions[0].title, 'Fixed case');
});

check('import rejects garbage', () => {
  assert.strictEqual(L.importState('not json').ok, false);
  assert.strictEqual(L.importState('{"app":"other","version":1,"decisions":[]}').ok, false);
  assert.strictEqual(L.importState('{"app":"decision-helper-bd","version":2,"decisions":[]}').ok, false);
  const bad = L.exportState([{ ...fixedDecision(), title: '' }]);
  assert.strictEqual(L.importState(bad).ok, false);
  const dup = fixedDecision();
  assert.strictEqual(L.importState(L.exportState([dup, dup])).ok, false);
});

check('clampInt behaves', () => {
  assert.strictEqual(L.clampInt('7', 1, 5, 3), 5);
  assert.strictEqual(L.clampInt('0', 1, 5, 3), 1);
  assert.strictEqual(L.clampInt('abc', 1, 5, 3), 3);
  assert.strictEqual(L.clampInt(3, 1, 5, 1), 3);
});

check('totalsFor with weight override', () => {
  const d = fixedDecision();
  const t = L.totalsFor(d, { cA: 4 });
  const byName = {};
  t.forEach((r) => { byName[r.name] = r.total; });
  assert.strictEqual(byName.X, 40);
  assert.strictEqual(byName.Y, 38);
});

console.log('ALL ' + passed + ' UNIT TESTS PASSED');
