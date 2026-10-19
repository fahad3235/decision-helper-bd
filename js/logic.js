/* decision-helper-bd -- pure decision math (no DOM).
   Weighted scoring: total(option) = sum(weight[c] * score[option][c]).
   Ranking: total desc, name asc tie-break (deterministic).
   Sensitivity: for each criterion, test weight +/-1 (clamped 1..5);
   report when the winner would change. No recommendations are
   invented: the tool computes from the user's own scores. */
(function (global) {
  'use strict';

  function uid(prefix) {
    return (prefix || 'id') + Math.random().toString(36).slice(2, 9);
  }
  function clampInt(v, min, max, fallback) {
    var n = parseInt(v, 10);
    if (isNaN(n)) return fallback;
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }
  function isNonEmptyStr(v, max) {
    return typeof v === 'string' && v.trim().length > 0 && v.trim().length <= (max || 500);
  }

  function newDecision() {
    var o1 = uid('opt'), o2 = uid('opt');
    var c1 = uid('cri'), c2 = uid('cri');
    var scores = {};
    scores[o1] = {}; scores[o1][c1] = 5; scores[o1][c2] = 5;
    scores[o2] = {}; scores[o2][c1] = 5; scores[o2][c2] = 5;
    return {
      id: uid('dec'),
      title: '',
      question: '',
      options: [
        { id: o1, name: 'Option A' },
        { id: o2, name: 'Option B' }
      ],
      criteria: [
        { id: c1, name: 'Benefit', weight: 3 },
        { id: c2, name: 'Cost', weight: 2 }
      ],
      scores: scores,
      prosCons: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  function validateDecision(d) {
    var errs = [];
    if (!d || typeof d !== 'object') return ['Decision must be an object.'];
    if (!isNonEmptyStr(d.title, 120)) errs.push('Title is required (1-120 chars).');
    if (d.question != null && typeof d.question !== 'string') errs.push('Question must be text.');
    if (d.question && d.question.length > 500) errs.push('Question max 500 chars.');
    return errs.concat(mathErrors(d));
  }

  // Math-input errors only (options/criteria/scores/pros-cons).
  // Title/question are metadata: results render without them, but
  // saving still requires a title via validateDecision().
  function mathErrors(d) {
    var errs = [];
    if (!d || typeof d !== 'object') return ['Decision must be an object.'];
    if (!Array.isArray(d.options) || d.options.length < 2 || d.options.length > 6) {
      errs.push('Need 2-6 options.');
    } else {
      var seenO = {};
      d.options.forEach(function (o, i) {
        if (!o || !isNonEmptyStr(o.name, 60)) errs.push('Option #' + (i + 1) + ' needs a name (1-60 chars).');
        else {
          var k = o.name.trim().toLowerCase();
          if (seenO[k]) errs.push('Option names must be unique: "' + o.name.trim() + '".');
          seenO[k] = true;
        }
        if (!o.id || typeof o.id !== 'string') errs.push('Option #' + (i + 1) + ' has no id.');
      });
    }
    if (!Array.isArray(d.criteria) || d.criteria.length < 1 || d.criteria.length > 6) {
      errs.push('Need 1-6 criteria.');
    } else {
      var seenC = {};
      d.criteria.forEach(function (c, i) {
        if (!c || !isNonEmptyStr(c.name, 60)) errs.push('Criterion #' + (i + 1) + ' needs a name (1-60 chars).');
        else {
          var k = c.name.trim().toLowerCase();
          if (seenC[k]) errs.push('Criterion names must be unique: "' + c.name.trim() + '".');
          seenC[k] = true;
        }
        if (!c.id || typeof c.id !== 'string') errs.push('Criterion #' + (i + 1) + ' has no id.');
        if (!Number.isInteger(c.weight) || c.weight < 1 || c.weight > 5) {
          errs.push('Criterion "' + (c.name || ('#' + (i + 1))) + '" weight must be an integer 1-5.');
        }
      });
    }
    if (d.scores && typeof d.scores === 'object' && Array.isArray(d.options) && Array.isArray(d.criteria)) {
      d.options.forEach(function (o) {
        var row = d.scores[o.id];
        if (!row || typeof row !== 'object') { errs.push('Missing scores for option "' + o.name + '".'); return; }
        d.criteria.forEach(function (c) {
          var s = row[c.id];
          if (!Number.isInteger(s) || s < 1 || s > 10) {
            errs.push('Score for "' + o.name + '" on "' + c.name + '" must be an integer 1-10.');
          }
        });
      });
    }
    if (d.prosCons != null && typeof d.prosCons === 'object') {
      Object.keys(d.prosCons).forEach(function (optId) {
        var list = d.prosCons[optId];
        if (!Array.isArray(list)) { errs.push('Pros/cons for an option must be a list.'); return; }
        list.forEach(function (item) {
          if (!item || (item.kind !== 'pro' && item.kind !== 'con')) errs.push('Pros/cons entry needs kind pro/con.');
          if (!item || !isNonEmptyStr(item.text, 200)) errs.push('Pros/cons entry needs text (1-200 chars).');
        });
      });
    }
    return errs;
  }

  function totalsFor(d, weightOverride) {
    var out = [];
    d.options.forEach(function (o) {
      var total = 0, maxPossible = 0;
      var breakdown = [];
      d.criteria.forEach(function (c) {
        var w = (weightOverride && weightOverride[c.id] != null) ? weightOverride[c.id] : c.weight;
        var s = (d.scores[o.id] || {})[c.id];
        if (!Number.isInteger(s)) s = 0;
        total += w * s;
        maxPossible += w * 10;
        breakdown.push({ criterionId: c.id, criterion: c.name, weight: w, score: s, contribution: w * s });
      });
      out.push({
        optionId: o.id, name: o.name, total: total, maxPossible: maxPossible,
        pct: maxPossible > 0 ? Math.round((total / maxPossible) * 1000) / 10 : 0,
        breakdown: breakdown
      });
    });
    return out;
  }

  function rankTotals(totals) {
    return totals.slice().sort(function (a, b) {
      if (b.total !== a.total) return b.total - a.total;
      return a.name.localeCompare(b.name);
    });
  }

  function computeResults(d) {
    var totals = totalsFor(d, null);
    var ranking = rankTotals(totals);
    var winner = ranking[0] || null;
    var gap = ranking.length > 1 ? ranking[0].total - ranking[1].total : 0;
    var sensitivity = [];
    d.criteria.forEach(function (c) {
      [+1, -1].forEach(function (delta) {
        var nw = c.weight + delta;
        if (nw < 1 || nw > 5) return;
        var override = {};
        override[c.id] = nw;
        var alt = rankTotals(totalsFor(d, override));
        if (alt[0] && winner && alt[0].optionId !== winner.optionId) {
          sensitivity.push({
            criterionId: c.id, criterion: c.name,
            fromWeight: c.weight, toWeight: nw,
            direction: delta > 0 ? '+1' : '-1',
            newWinner: alt[0].name
          });
        }
      });
    });
    return { totals: totals, ranking: ranking, winner: winner, gap: gap, sensitivity: sensitivity };
  }

  function exportState(decisions) {
    return JSON.stringify({ app: 'decision-helper-bd', version: 1, exportedAt: new Date().toISOString(), decisions: decisions }, null, 2);
  }

  function importState(text) {
    var data;
    try { data = JSON.parse(text); } catch (e) { return { ok: false, error: 'Not valid JSON.' }; }
    if (!data || data.app !== 'decision-helper-bd' || data.version !== 1 || !Array.isArray(data.decisions)) {
      return { ok: false, error: 'Not a decision-helper-bd export (app/version/decisions mismatch).' };
    }
    var seen = {};
    for (var i = 0; i < data.decisions.length; i++) {
      var d = data.decisions[i];
      var errs = validateDecision(d);
      if (errs.length) return { ok: false, error: 'Decision #' + (i + 1) + ': ' + errs[0] };
      if (!d.id || typeof d.id !== 'string' || seen[d.id]) return { ok: false, error: 'Decision #' + (i + 1) + ' has a missing/duplicate id.' };
      seen[d.id] = true;
    }
    return { ok: true, decisions: data.decisions };
  }

  var api = {
    uid: uid, clampInt: clampInt, isNonEmptyStr: isNonEmptyStr,
    newDecision: newDecision, validateDecision: validateDecision, mathErrors: mathErrors,
    totalsFor: totalsFor, rankTotals: rankTotals, computeResults: computeResults,
    exportState: exportState, importState: importState
  };
  global.DH_LOGIC = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
