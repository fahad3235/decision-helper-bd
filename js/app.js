/* decision-helper-bd -- UI: editor, results, saved list, i18n, storage.
   All user-visible strings come from I18N below (EN + BN).
   The app never decides for the user: it computes from their scores. */
(function () {
  'use strict';
  var L = window.DH_LOGIC;
  var BN_DIGITS = '\u09e6\u09e7\u09e8\u09e9\u09ea\u09eb\u09ec\u09ed\u09ee\u09ef';

  var I18N = {
    en: {
      appTitle: 'Decision Helper',
      appSub: 'Weigh your options. You decide.',
      honesty: 'Scores are your own judgments. This tool only computes \u2014 it does not decide for you.',
      newBtn: 'New decision',
      savedBtn: 'Saved',
      exportBtn: 'Export',
      importBtn: 'Import',
      printBtn: 'Print summary',
      eraseBtn: 'Erase all',
      saveBtn: 'Save decision',
      titleLabel: 'Decision title',
      titlePh: 'e.g. Which laptop should I buy?',
      questionLabel: 'Question (optional)',
      questionPh: 'What exactly are you deciding?',
      criteriaLabel: 'Criteria (1-6)',
      criteriaNamePh: 'Criterion name',
      weightLabel: 'Weight',
      addCriterion: '+ Add criterion',
      optionsLabel: 'Options (2-6)',
      optionNamePh: 'Option name',
      addOption: '+ Add option',
      scoresLabel: 'Scores (1-10 per criterion)',
      prosConsLabel: 'Pros & cons',
      proBtn: '+ Pro',
      conBtn: '+ Con',
      proPh: 'A plus point\u2026',
      conPh: 'A minus point\u2026',
      prosTitle: 'Pros',
      consTitle: 'Cons',
      resultsLabel: 'Results',
      winnerLabel: 'Leading option',
      gapLabel: 'Lead over #2',
      points: 'points',
      rankingLabel: 'Ranking',
      sensitivityLabel: 'Sensitivity \u2014 what could flip the winner?',
      sensitivityNone: 'No single weight change of +/-1 within 1-5 flips the winner. The lead is robust to small weight changes.',
      sensitivityIntro: 'If this weight changes, a different option would lead:',
      sensitivityItem: '\u201c{criterion}\u201d weight {from} \u2192 {to} makes \u201c{winner}\u201d lead.',
      breakdownLabel: 'Score breakdown',
      totalLabel: 'Total',
      ofMax: 'of',
      savedTitle: 'Saved decisions',
      savedEmpty: 'No saved decisions yet. Fill in a decision and press Save.',
      openBtn: 'Open',
      deleteBtn: 'Delete',
      deleteConfirm: 'Delete this decision?',
      eraseConfirm: 'Type DELETE to erase ALL saved decisions.',
      erasePlaceholder: 'Type DELETE',
      eraseDone: 'All saved decisions erased.',
      eraseCancelled: 'Erase cancelled.',
      savedOk: 'Decision saved.',
      validationTitle: 'Please fix:',
      exportName: 'decision-helper-export.json',
      importOk: 'Imported {n} decision(s).',
      importFail: 'Import failed: ',
      fileReadFail: 'Could not read that file.',
      required: 'Required',
      removeBtn: 'Remove',
      langBtn: '\u09ac\u09be\u0982\u09b2\u09be',
      printTitle: 'Decision summary',
      scoreHint: '1 = very weak, 10 = excellent on that criterion.',
      weightHint: 'Weight 1 = matters least, 5 = matters most.',
      emptyOptionName: 'Option name',
      emptyCriterionName: 'Criterion name'
    },
    bn: {
      appTitle: '\u09b8\u09bf\u09a6\u09cd\u09a7\u09be\u09a8\u09cd\u09a4 \u09b8\u09b9\u09be\u09af\u09bc\u0995',
      appSub: '\u09ac\u09bf\u0995\u09b2\u09cd\u09aa\u0997\u09c1\u09b2\u09cb \u0993\u099c\u09a8 \u0995\u09b0\u09c1\u09a8\u0964 \u09b8\u09bf\u09a6\u09cd\u09a7\u09be\u09a8\u09cd\u09a4 \u0986\u09aa\u09a8\u09be\u09b0\u0964',
      honesty: '\u09b8\u09cd\u0995\u09cb\u09b0 \u0986\u09aa\u09a8\u09be\u09b0 \u09a8\u09bf\u099c\u09c7\u09b0 \u09ac\u09bf\u099a\u09be\u09b0\u0964 \u098f\u0987 \u099f\u09c1\u09b2 \u09b6\u09c1\u09a7\u09c1 \u09b9\u09bf\u09b8\u09be\u09ac \u0995\u09b0\u09c7 \u2014 \u098f\u099f\u09bf \u0986\u09aa\u09a8\u09be\u09b0 \u09b9\u09af\u09bc\u09c7 \u09b8\u09bf\u09a6\u09cd\u09a7\u09be\u09a8\u09cd\u09a4 \u09a8\u09c7\u09af\u09bc \u09a8\u09be\u0964',
      newBtn: '\u09a8\u09a4\u09c1\u09a8 \u09b8\u09bf\u09a6\u09cd\u09a7\u09be\u09a8\u09cd\u09a4',
      savedBtn: '\u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4',
      exportBtn: '\u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f',
      importBtn: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f',
      printBtn: '\u09b8\u09be\u09b0\u09be\u0982\u09b6 \u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u099f',
      eraseBtn: '\u09b8\u09ac \u09ae\u09c1\u099b\u09c1\u09a8',
      saveBtn: '\u09b8\u09bf\u09a6\u09cd\u09a7\u09be\u09a8\u09cd\u09a4 \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3',
      titleLabel: '\u09b8\u09bf\u09a6\u09cd\u09a7\u09be\u09a8\u09cd\u09a4\u09c7\u09b0 \u09b6\u09bf\u09b0\u09cb\u09a8\u09be\u09ae',
      titlePh: '\u09af\u09c7\u09ae\u09a8: \u0995\u09cb\u09a8 \u09b2\u09cd\u09af\u09be\u09aa\u099f\u09aa \u0995\u09bf\u09a8\u09ac?',
      questionLabel: '\u09aa\u09cd\u09b0\u09b6\u09cd\u09a8 (\u0990\u099a\u09cd\u099b\u09bf\u0995)',
      questionPh: '\u09a0\u09bf\u0995 \u0995\u09c0 \u09ac\u09bf\u09b7\u09af\u09bc\u09c7 \u09b8\u09bf\u09a6\u09cd\u09a7\u09be\u09a8\u09cd\u09a4 \u09a8\u09bf\u099a\u09cd\u099b\u09c7\u09a8?',
      criteriaLabel: '\u09ae\u09be\u09a8\u09a6\u09a3\u09cd\u09a1 (\u09e7-\u09ec)',
      criteriaNamePh: '\u09ae\u09be\u09a8\u09a6\u09a3\u09cd\u09a1\u09c7\u09b0 \u09a8\u09be\u09ae',
      weightLabel: '\u0993\u099c\u09a8',
      addCriterion: '+ \u09ae\u09be\u09a8\u09a6\u09a3\u09cd\u09a1 \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8',
      optionsLabel: '\u09ac\u09bf\u0995\u09b2\u09cd\u09aa (\u09e8-\u09ec)',
      optionNamePh: '\u09ac\u09bf\u0995\u09b2\u09cd\u09aa\u09c7\u09b0 \u09a8\u09be\u09ae',
      addOption: '+ \u09ac\u09bf\u0995\u09b2\u09cd\u09aa \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8',
      scoresLabel: '\u09b8\u09cd\u0995\u09cb\u09b0 (\u09aa\u09cd\u09b0\u09a4\u09bf \u09ae\u09be\u09a8\u09a6\u09a3\u09cd\u09a1\u09c7 \u09e7-\u09e7\u09e6)',
      prosConsLabel: '\u09b8\u09c1\u09ac\u09bf\u09a7\u09be \u0993 \u0985\u09b8\u09c1\u09ac\u09bf\u09a7\u09be',
      proBtn: '+ \u09b8\u09c1\u09ac\u09bf\u09a7\u09be',
      conBtn: '+ \u0985\u09b8\u09c1\u09ac\u09bf\u09a7\u09be',
      proPh: '\u098f\u0995\u099f\u09bf \u09ad\u09be\u09b2\u09cb \u09a6\u09bf\u0995\u2026',
      conPh: '\u098f\u0995\u099f\u09bf \u0996\u09be\u09b0\u09be\u09aa \u09a6\u09bf\u0995\u2026',
      prosTitle: '\u09b8\u09c1\u09ac\u09bf\u09a7\u09be',
      consTitle: '\u0985\u09b8\u09c1\u09ac\u09bf\u09a7\u09be',
      resultsLabel: '\u09ab\u09b2\u09be\u09ab\u09b2',
      winnerLabel: '\u098f\u0997\u09bf\u09af\u09bc\u09c7 \u09a5\u09be\u0995\u09be \u09ac\u09bf\u0995\u09b2\u09cd\u09aa',
      gapLabel: '\u09e8\u09af\u09bc \u09b8\u09cd\u09a5\u09be\u09a8\u09c7\u09b0 \u099a\u09c7\u09af\u09bc\u09c7 \u098f\u0997\u09bf\u09af\u09bc\u09c7',
      points: '\u09aa\u09af\u09bc\u09c7\u09a8\u09cd\u099f',
      rankingLabel: '\u09b0\u200d\u09cd\u09af\u09be\u0982\u0995\u09bf\u0982',
      sensitivityLabel: '\u09b8\u0982\u09ac\u09c7\u09a6\u09a8\u09b6\u09c0\u09b2\u09a4\u09be \u2014 \u0995\u09c0 \u09ac\u09a6\u09b2\u09be\u09b2\u09c7 \u09ac\u09bf\u099c\u09af\u09bc\u09c0 \u09ac\u09a6\u09b2\u09be\u09ac\u09c7?',
      sensitivityNone: '\u0995\u09cb\u09a8\u09cb \u098f\u0995\u099f\u09bf \u0993\u099c\u09a8 \u00b1\u09e7 \u09ac\u09a6\u09b2\u09be\u09b2\u09c7 \u09ac\u09bf\u099c\u09af\u09bc\u09c0 \u09ac\u09a6\u09b2\u09be\u09af\u09bc \u09a8\u09be\u0964 \u099b\u09cb\u099f \u0993\u099c\u09a8-\u09aa\u09b0\u09bf\u09ac\u09b0\u09cd\u09a4\u09a8\u09c7 \u098f\u0997\u09bf\u09af\u09bc\u09c7 \u09a5\u09be\u0995\u09be \u09ae\u099c\u09ac\u09c1\u09a4\u0964',
      sensitivityIntro: '\u098f\u0987 \u0993\u099c\u09a8 \u09ac\u09a6\u09b2\u09be\u09b2\u09c7 \u0985\u09a8\u09cd\u09af \u09ac\u09bf\u0995\u09b2\u09cd\u09aa \u098f\u0997\u09bf\u09af\u09bc\u09c7 \u09af\u09be\u09ac\u09c7:',
      sensitivityItem: '\u201c{criterion}\u201d \u0993\u099c\u09a8 {from} \u2192 {to} \u09b9\u09b2\u09c7 \u201c{winner}\u201d \u098f\u0997\u09bf\u09af\u09bc\u09c7 \u09af\u09be\u09ac\u09c7\u0964',
      breakdownLabel: '\u09b8\u09cd\u0995\u09cb\u09b0\u09c7\u09b0 \u09ac\u09bf\u09b8\u09cd\u09a4\u09be\u09b0\u09bf\u09a4',
      totalLabel: '\u09ae\u09cb\u099f',
      ofMax: '\u098f\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7',
      savedTitle: '\u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b8\u09bf\u09a6\u09cd\u09a7\u09be\u09a8\u09cd\u09a4',
      savedEmpty: '\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u09b8\u09bf\u09a6\u09cd\u09a7\u09be\u09a8\u09cd\u09a4 \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09a8\u09c7\u0987\u0964 \u098f\u0995\u099f\u09bf \u09b8\u09bf\u09a6\u09cd\u09a7\u09be\u09a8\u09cd\u09a4 \u09aa\u09c2\u09b0\u09a3 \u0995\u09b0\u09c7 \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3 \u0995\u09b0\u09c1\u09a8\u0964',
      openBtn: '\u0996\u09c1\u09b2\u09c1\u09a8',
      deleteBtn: '\u09ae\u09c1\u099b\u09c1\u09a8',
      deleteConfirm: '\u098f\u0987 \u09b8\u09bf\u09a6\u09cd\u09a7\u09be\u09a8\u09cd\u09a4 \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09ac\u09c7\u09a8?',
      eraseConfirm: '\u09b8\u09ac \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b8\u09bf\u09a6\u09cd\u09a7\u09be\u09a8\u09cd\u09a4 \u09ae\u09c1\u099b\u09a4\u09c7 DELETE \u09b2\u09bf\u0996\u09c1\u09a8\u0964',
      erasePlaceholder: 'DELETE \u09b2\u09bf\u0996\u09c1\u09a8',
      eraseDone: '\u09b8\u09ac \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b8\u09bf\u09a6\u09cd\u09a7\u09be\u09a8\u09cd\u09a4 \u09ae\u09cb\u099b\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      eraseCancelled: '\u09ae\u09cb\u099b\u09be \u09ac\u09be\u09a4\u09bf\u09b2 \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      savedOk: '\u09b8\u09bf\u09a6\u09cd\u09a7\u09be\u09a8\u09cd\u09a4 \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      validationTitle: '\u09a0\u09bf\u0995 \u0995\u09b0\u09c1\u09a8:',
      exportName: 'decision-helper-export.json',
      importOk: '{n}\u099f\u09bf \u09b8\u09bf\u09a6\u09cd\u09a7\u09be\u09a8\u09cd\u09a4 \u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      importFail: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09ac\u09cd\u09af\u09b0\u09cd\u09a5: ',
      fileReadFail: '\u09ab\u09be\u0987\u09b2\u099f\u09bf \u09aa\u09a1\u09bc\u09be \u09af\u09be\u09af\u09bc\u09a8\u09bf\u0964',
      required: '\u0986\u09ac\u09b6\u09cd\u09af\u0995',
      removeBtn: '\u09b8\u09b0\u09be\u09a8',
      langBtn: 'English',
      printTitle: '\u09b8\u09bf\u09a6\u09cd\u09a7\u09be\u09a8\u09cd\u09a4\u09c7\u09b0 \u09b8\u09be\u09b0\u09be\u0982\u09b6',
      scoreHint: '\u09e7 = \u0996\u09c1\u09ac \u09a6\u09c1\u09b0\u09cd\u09ac\u09b2, \u09e7\u09e6 = \u0990 \u09ae\u09be\u09a8\u09a6\u09a3\u09cd\u09a1\u09c7 \u099a\u09ae\u09ce\u0995\u09be\u09b0\u0964',
      weightHint: '\u0993\u099c\u09a8 \u09e7 = \u09b8\u09ac\u099a\u09c7\u09af\u09bc\u09c7 \u0995\u09ae \u0997\u09c1\u09b0\u09c1\u09a4\u09cd\u09ac, \u09eb = \u09b8\u09ac\u099a\u09c7\u09af\u09bc\u09c7 \u09ac\u09c7\u09b6\u09bf \u0997\u09c1\u09b0\u09c1\u09a4\u09cd\u09ac\u0964',
      emptyOptionName: '\u09ac\u09bf\u0995\u09b2\u09cd\u09aa\u09c7\u09b0 \u09a8\u09be\u09ae',
      emptyCriterionName: '\u09ae\u09be\u09a8\u09a6\u09a3\u09cd\u09a1\u09c7\u09b0 \u09a8\u09be\u09ae'
    }
  };

  var LS_KEY = 'decision-helper-bd:v1';
  var LANG_KEY = 'decision-helper-bd:lang';

  var state = {
    lang: 'en',
    current: L.newDecision(),
    saved: [],
    showSaved: false
  };

  function t(key) {
    var dict = I18N[state.lang] || I18N.en;
    return dict[key] != null ? dict[key] : (I18N.en[key] || key);
  }
  function fmtNum(n) {
    var s = String(n);
    if (state.lang !== 'bn') return s;
    return s.replace(/[0-9]/g, function (d) { return BN_DIGITS[parseInt(d, 10)]; });
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fill(template, vars) {
    return template.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : ''; });
  }

  function load() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        if (data && Array.isArray(data.decisions)) state.saved = data.decisions;
      }
    } catch (e) { state.saved = []; }
    var lang = localStorage.getItem(LANG_KEY);
    if (lang === 'bn' || lang === 'en') state.lang = lang;
  }
  function persist() {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ app: 'decision-helper-bd', version: 1, decisions: state.saved })); } catch (e) { /* storage full/blocked: keep working in memory */ }
  }
  function persistLang() {
    try { localStorage.setItem(LANG_KEY, state.lang); } catch (e) { /* ignore */ }
  }

  function syncFromForm() {
    var d = state.current;
    var titleEl = document.getElementById('f-title');
    var qEl = document.getElementById('f-question');
    if (titleEl) d.title = titleEl.value;
    if (qEl) d.question = qEl.value;
    d.criteria.forEach(function (c) {
      var nameEl = document.getElementById('cri-name-' + c.id);
      var wEl = document.getElementById('cri-weight-' + c.id);
      if (nameEl) c.name = nameEl.value;
      if (wEl) c.weight = L.clampInt(wEl.value, 1, 5, c.weight);
    });
    d.options.forEach(function (o) {
      var nameEl = document.getElementById('opt-name-' + o.id);
      if (nameEl) o.name = nameEl.value;
      d.criteria.forEach(function (c) {
        var sEl = document.getElementById('score-' + o.id + '-' + c.id);
        if (sEl) {
          if (!d.scores[o.id]) d.scores[o.id] = {};
          d.scores[o.id][c.id] = L.clampInt(sEl.value, 1, 10, 5);
        }
      });
    });
    d.updatedAt = new Date().toISOString();
  }

  function render() {
    renderHeader();
    renderEditor();
    renderResults();
    renderSaved();
  }

  function renderHeader() {
    document.getElementById('app-title').textContent = t('appTitle');
    document.getElementById('app-sub').textContent = t('appSub');
    document.getElementById('honesty-note').textContent = t('honesty');
    var langBtn = document.getElementById('btn-lang');
    langBtn.textContent = t('langBtn');
    document.getElementById('btn-new').textContent = t('newBtn');
    document.getElementById('btn-saved').textContent = t('savedBtn');
    document.getElementById('btn-export').textContent = t('exportBtn');
    document.getElementById('btn-import').textContent = t('importBtn');
    document.getElementById('btn-print').textContent = t('printBtn');
    document.getElementById('btn-erase').textContent = t('eraseBtn');
    document.getElementById('btn-save').textContent = t('saveBtn');
    document.getElementById('lbl-title').textContent = t('titleLabel');
    document.getElementById('f-title').placeholder = t('titlePh');
    document.getElementById('lbl-question').textContent = t('questionLabel');
    document.getElementById('f-question').placeholder = t('questionPh');
  }

  function renderEditor() {
    var d = state.current;
    document.getElementById('f-title').value = d.title || '';
    document.getElementById('f-question').value = d.question || '';

    var criBox = document.getElementById('criteria-box');
    criBox.innerHTML = '';
    var criTitle = document.createElement('h3');
    criTitle.textContent = t('criteriaLabel');
    criBox.appendChild(criTitle);
    var wHint = document.createElement('p');
    wHint.className = 'hint';
    wHint.textContent = t('weightHint');
    criBox.appendChild(wHint);
    d.criteria.forEach(function (c) {
      var row = document.createElement('div');
      row.className = 'row';
      row.innerHTML =
        '<input type="text" id="cri-name-' + c.id + '" value="' + esc(c.name) + '" placeholder="' + esc(t('criteriaNamePh')) + '" maxlength="60">' +
        '<label>' + esc(t('weightLabel')) + ' <input type="number" id="cri-weight-' + c.id + '" value="' + c.weight + '" min="1" max="5" step="1"></label>' +
        '<button type="button" class="btn danger small" data-remove-cri="' + c.id + '">' + esc(t('removeBtn')) + '</button>';
      criBox.appendChild(row);
    });
    var addCri = document.createElement('button');
    addCri.type = 'button'; addCri.className = 'btn secondary'; addCri.id = 'btn-add-cri';
    addCri.textContent = t('addCriterion');
    addCri.disabled = d.criteria.length >= 6;
    criBox.appendChild(addCri);

    var optBox = document.getElementById('options-box');
    optBox.innerHTML = '';
    var optTitle = document.createElement('h3');
    optTitle.textContent = t('optionsLabel');
    optBox.appendChild(optTitle);
    d.options.forEach(function (o) {
      var row = document.createElement('div');
      row.className = 'row';
      row.innerHTML =
        '<input type="text" id="opt-name-' + o.id + '" value="' + esc(o.name) + '" placeholder="' + esc(t('optionNamePh')) + '" maxlength="60">' +
        '<button type="button" class="btn danger small" data-remove-opt="' + o.id + '">' + esc(t('removeBtn')) + '</button>';
      optBox.appendChild(row);
    });
    var addOpt = document.createElement('button');
    addOpt.type = 'button'; addOpt.className = 'btn secondary'; addOpt.id = 'btn-add-opt';
    addOpt.textContent = t('addOption');
    addOpt.disabled = d.options.length >= 6;
    optBox.appendChild(addOpt);

    renderScoreGrid();
    renderProsCons();
    bindEditorEvents();
  }

  function renderScoreGrid() {
    var d = state.current;
    var box = document.getElementById('scores-box');
    box.innerHTML = '';
    var title = document.createElement('h3');
    title.textContent = t('scoresLabel');
    box.appendChild(title);
    var hint = document.createElement('p');
    hint.className = 'hint';
    hint.textContent = t('scoreHint');
    box.appendChild(hint);
    var wrap = document.createElement('div');
    wrap.className = 'grid-wrap';
    var table = document.createElement('table');
    table.className = 'score-grid';
    var thead = document.createElement('thead');
    var hr = document.createElement('tr');
    var th0 = document.createElement('th');
    th0.textContent = t('optionsLabel');
    hr.appendChild(th0);
    d.criteria.forEach(function (c) {
      var th = document.createElement('th');
      th.textContent = c.name + ' (' + t('weightLabel') + ' ' + fmtNum(c.weight) + ')';
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);
    var tbody = document.createElement('tbody');
    d.options.forEach(function (o) {
      var tr = document.createElement('tr');
      var td0 = document.createElement('td');
      td0.className = 'row-label';
      td0.textContent = o.name;
      tr.appendChild(td0);
      d.criteria.forEach(function (c) {
        var td = document.createElement('td');
        var input = document.createElement('input');
        input.type = 'number';
        input.min = '1'; input.max = '10'; input.step = '1';
        input.id = 'score-' + o.id + '-' + c.id;
        input.value = ((d.scores[o.id] || {})[c.id] != null) ? d.scores[o.id][c.id] : 5;
        input.setAttribute('aria-label', o.name + ' - ' + c.name);
        td.appendChild(input);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    box.appendChild(wrap);
  }

  function renderProsCons() {
    var d = state.current;
    var box = document.getElementById('proscons-box');
    box.innerHTML = '';
    var title = document.createElement('h3');
    title.textContent = t('prosConsLabel');
    box.appendChild(title);
    d.options.forEach(function (o) {
      var sec = document.createElement('div');
      sec.className = 'pc-option';
      var h = document.createElement('h4');
      h.textContent = o.name;
      sec.appendChild(h);
      ['pro', 'con'].forEach(function (kind) {
        var sub = document.createElement('div');
        sub.className = 'pc-list';
        var label = document.createElement('strong');
        label.textContent = kind === 'pro' ? t('prosTitle') : t('consTitle');
        sub.appendChild(label);
        var list = (d.prosCons[o.id] || []).filter(function (x) { return x.kind === kind; });
        list.forEach(function (item) {
          var row = document.createElement('div');
          row.className = 'row pc-row';
          row.innerHTML = '<span class="pc-text">' + esc(item.text) + '</span>' +
            '<button type="button" class="btn danger small" data-remove-pc="' + item.id + '">x</button>';
          sub.appendChild(row);
        });
        var addRow = document.createElement('div');
        addRow.className = 'row';
        addRow.innerHTML =
          '<input type="text" id="pc-input-' + o.id + '-' + kind + '" placeholder="' + esc(kind === 'pro' ? t('proPh') : t('conPh')) + '" maxlength="200">' +
          '<button type="button" class="btn secondary small" data-add-pc="' + o.id + ':' + kind + '">' + esc(kind === 'pro' ? t('proBtn') : t('conBtn')) + '</button>';
        sub.appendChild(addRow);
        sec.appendChild(sub);
      });
      box.appendChild(sec);
    });
  }

  function renderResults() {
    var d = state.current;
    var box = document.getElementById('results-box');
    box.innerHTML = '';
    var title = document.createElement('h3');
    title.textContent = t('resultsLabel');
    box.appendChild(title);
    var errs = L.mathErrors(d);
    if (errs.length) {
      var warn = document.createElement('div');
      warn.className = 'alert';
      warn.innerHTML = '<strong>' + esc(t('validationTitle')) + '</strong><ul>' +
        errs.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>';
      box.appendChild(warn);
      return;
    }
    var res = L.computeResults(d);
    var win = document.createElement('div');
    win.className = 'winner-card';
    win.innerHTML = '<div class="winner-label">' + esc(t('winnerLabel')) + '</div>' +
      '<div class="winner-name">' + esc(res.winner.name) + '</div>' +
      '<div class="winner-total">' + fmtNum(res.winner.total) + ' ' + esc(t('points')) + ' (' + esc(t('ofMax')) + ' ' + fmtNum(res.winner.maxPossible) + ', ' + fmtNum(res.winner.pct) + '%)</div>' +
      '<div class="winner-gap">' + esc(t('gapLabel')) + ': ' + fmtNum(res.gap) + ' ' + esc(t('points')) + '</div>';
    box.appendChild(win);

    var rankTitle = document.createElement('h4');
    rankTitle.textContent = t('rankingLabel');
    box.appendChild(rankTitle);
    var ol = document.createElement('ol');
    ol.className = 'ranking';
    res.ranking.forEach(function (r) {
      var li = document.createElement('li');
      var barPct = r.maxPossible > 0 ? Math.round((r.total / r.maxPossible) * 100) : 0;
      li.innerHTML = '<span class="rank-name">' + esc(r.name) + '</span>' +
        '<span class="bar"><span class="fill" style="width:' + barPct + '%"></span></span>' +
        '<span class="rank-total">' + fmtNum(r.total) + '</span>';
      ol.appendChild(li);
    });
    box.appendChild(ol);

    var sensTitle = document.createElement('h4');
    sensTitle.textContent = t('sensitivityLabel');
    box.appendChild(sensTitle);
    var sens = document.createElement('div');
    sens.className = 'sensitivity';
    if (res.sensitivity.length === 0) {
      sens.textContent = t('sensitivityNone');
    } else {
      var p = document.createElement('p');
      p.textContent = t('sensitivityIntro');
      sens.appendChild(p);
      var ul = document.createElement('ul');
      res.sensitivity.forEach(function (s) {
        var li = document.createElement('li');
        li.textContent = fill(t('sensitivityItem'), {
          criterion: s.criterion, from: fmtNum(s.fromWeight), to: fmtNum(s.toWeight), winner: s.newWinner
        });
        ul.appendChild(li);
      });
      sens.appendChild(ul);
    }
    box.appendChild(sens);

    var brTitle = document.createElement('h4');
    brTitle.textContent = t('breakdownLabel');
    box.appendChild(brTitle);
    var table = document.createElement('table');
    table.className = 'breakdown';
    var hr = document.createElement('tr');
    hr.innerHTML = '<th>' + esc(t('optionsLabel')) + '</th>' +
      d.criteria.map(function (c) { return '<th>' + esc(c.name) + '</th>'; }).join('') +
      '<th>' + esc(t('totalLabel')) + '</th>';
    table.appendChild(hr);
    res.totals.forEach(function (r) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + esc(r.name) + '</td>' +
        r.breakdown.map(function (b) { return '<td>' + fmtNum(b.contribution) + ' <small>(' + fmtNum(b.weight) + 'x' + fmtNum(b.score) + ')</small></td>'; }).join('') +
        '<td><strong>' + fmtNum(r.total) + '</strong></td>';
      table.appendChild(tr);
    });
    box.appendChild(table);
  }

  function renderSaved() {
    var panel = document.getElementById('saved-panel');
    panel.style.display = state.showSaved ? 'block' : 'none';
    if (!state.showSaved) return;
    var list = document.getElementById('saved-list');
    list.innerHTML = '';
    var title = document.getElementById('saved-title');
    title.textContent = t('savedTitle');
    if (state.saved.length === 0) {
      var empty = document.createElement('p');
      empty.className = 'hint';
      empty.textContent = t('savedEmpty');
      list.appendChild(empty);
      return;
    }
    state.saved.forEach(function (d) {
      var row = document.createElement('div');
      row.className = 'row saved-row';
      row.innerHTML = '<span class="saved-name">' + esc(d.title || '(untitled)') + '</span>' +
        '<span class="saved-meta">' + fmtNum(d.options.length) + ' ' + esc(t('optionsLabel')) + ' \u00b7 ' + fmtNum(d.criteria.length) + ' ' + esc(t('criteriaLabel')) + '</span>' +
        '<button type="button" class="btn secondary small" data-open-saved="' + d.id + '">' + esc(t('openBtn')) + '</button>' +
        '<button type="button" class="btn danger small" data-del-saved="' + d.id + '">' + esc(t('deleteBtn')) + '</button>';
      list.appendChild(row);
    });
  }

  function showErrors(errs) {
    var box = document.getElementById('form-errors');
    box.innerHTML = '';
    if (!errs || !errs.length) { box.style.display = 'none'; return; }
    box.style.display = 'block';
    box.innerHTML = '<strong>' + esc(t('validationTitle')) + '</strong><ul>' +
      errs.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>';
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function bindEditorEvents() {
    document.querySelectorAll('[data-remove-cri]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        syncFromForm();
        var id = btn.getAttribute('data-remove-cri');
        if (state.current.criteria.length <= 1) return;
        state.current.criteria = state.current.criteria.filter(function (c) { return c.id !== id; });
        state.current.options.forEach(function (o) { if (state.current.scores[o.id]) delete state.current.scores[o.id][id]; });
        render();
      });
    });
    document.querySelectorAll('[data-remove-opt]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        syncFromForm();
        var id = btn.getAttribute('data-remove-opt');
        if (state.current.options.length <= 2) return;
        state.current.options = state.current.options.filter(function (o) { return o.id !== id; });
        delete state.current.scores[id];
        delete state.current.prosCons[id];
        render();
      });
    });
    document.querySelectorAll('[data-remove-pc]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        syncFromForm();
        var id = btn.getAttribute('data-remove-pc');
        Object.keys(state.current.prosCons).forEach(function (optId) {
          state.current.prosCons[optId] = (state.current.prosCons[optId] || []).filter(function (x) { return x.id !== id; });
        });
        render();
      });
    });
    document.querySelectorAll('[data-add-pc]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var parts = btn.getAttribute('data-add-pc').split(':');
        var optId = parts[0], kind = parts[1];
        var input = document.getElementById('pc-input-' + optId + '-' + kind);
        var text = input ? input.value.trim() : '';
        if (!text) return;
        syncFromForm();
        if (!state.current.prosCons[optId]) state.current.prosCons[optId] = [];
        state.current.prosCons[optId].push({ id: L.uid('pc'), kind: kind, text: text.slice(0, 200) });
        render();
      });
    });
    var addCri = document.getElementById('btn-add-cri');
    if (addCri) addCri.addEventListener('click', function () {
      syncFromForm();
      var id = L.uid('cri');
      state.current.criteria.push({ id: id, name: '', weight: 3 });
      state.current.options.forEach(function (o) {
        if (!state.current.scores[o.id]) state.current.scores[o.id] = {};
        state.current.scores[o.id][id] = 5;
      });
      render();
    });
    var addOpt = document.getElementById('btn-add-opt');
    if (addOpt) addOpt.addEventListener('click', function () {
      syncFromForm();
      var id = L.uid('opt');
      state.current.options.push({ id: id, name: '' });
      state.current.scores[id] = {};
      state.current.criteria.forEach(function (c) { state.current.scores[id][c.id] = 5; });
      render();
    });
    // Live recompute on any input change.
    document.querySelectorAll('#editor input, #editor textarea').forEach(function (el) {
      el.addEventListener('input', function () { syncFromForm(); renderResults(); });
      el.addEventListener('change', function () { syncFromForm(); renderResults(); });
    });
  }

  function bindStaticEvents() {
    document.getElementById('btn-lang').addEventListener('click', function () {
      syncFromForm();
      state.lang = state.lang === 'en' ? 'bn' : 'en';
      persistLang();
      document.documentElement.lang = state.lang === 'bn' ? 'bn' : 'en';
      render();
    });
    document.getElementById('btn-new').addEventListener('click', function () {
      state.current = L.newDecision();
      state.showSaved = false;
      render();
    });
    document.getElementById('btn-saved').addEventListener('click', function () {
      state.showSaved = !state.showSaved;
      renderSaved();
    });
    document.getElementById('btn-save').addEventListener('click', function () {
      syncFromForm();
      var errs = L.validateDecision(state.current);
      showErrors(errs);
      if (errs.length) return;
      var idx = state.saved.findIndex(function (d) { return d.id === state.current.id; });
      var copy = JSON.parse(JSON.stringify(state.current));
      if (idx >= 0) state.saved[idx] = copy;
      else state.saved.push(copy);
      persist();
      state.showSaved = true;
      render();
      var ok = document.getElementById('form-ok');
      ok.textContent = t('savedOk');
      ok.style.display = 'block';
      setTimeout(function () { ok.style.display = 'none'; }, 2500);
    });
    document.getElementById('btn-export').addEventListener('click', function () {
      syncFromForm();
      var blob = new Blob([L.exportState(state.saved)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = t('exportName');
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });
    document.getElementById('btn-import').addEventListener('click', function () {
      document.getElementById('file-import').click();
    });
    document.getElementById('file-import').addEventListener('change', function (ev) {
      var file = ev.target.files && ev.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var res = L.importState(String(reader.result || ''));
        if (!res.ok) { alert(t('importFail') + res.error); return; }
        var merged = state.saved.slice();
        res.decisions.forEach(function (d) {
          var idx = merged.findIndex(function (x) { return x.id === d.id; });
          if (idx >= 0) merged[idx] = d; else merged.push(d);
        });
        state.saved = merged;
        persist();
        state.showSaved = true;
        render();
        alert(fill(t('importOk'), { n: fmtNum(res.decisions.length) }));
      };
      reader.onerror = function () { alert(t('fileReadFail')); };
      reader.readAsText(file);
      ev.target.value = '';
    });
    document.getElementById('btn-print').addEventListener('click', function () {
      syncFromForm();
      render();
      window.print();
    });
    document.getElementById('btn-erase').addEventListener('click', function () {
      var answer = prompt(t('eraseConfirm'), '');
      if (answer === null) { return; }
      if (answer.trim() !== 'DELETE') { alert(t('eraseCancelled')); return; }
      state.saved = [];
      persist();
      renderSaved();
      alert(t('eraseDone'));
    });
    document.addEventListener('click', function (ev) {
      var openBtn = ev.target.closest('[data-open-saved]');
      if (openBtn) {
        var d = state.saved.find(function (x) { return x.id === openBtn.getAttribute('data-open-saved'); });
        if (d) { state.current = JSON.parse(JSON.stringify(d)); state.showSaved = false; render(); }
        return;
      }
      var delBtn = ev.target.closest('[data-del-saved]');
      if (delBtn) {
        if (!confirm(t('deleteConfirm'))) return;
        state.saved = state.saved.filter(function (x) { return x.id !== delBtn.getAttribute('data-del-saved'); });
        persist();
        renderSaved();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    load();
    document.documentElement.lang = state.lang === 'bn' ? 'bn' : 'en';
    bindStaticEvents();
    render();
  });
})();
