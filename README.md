# Decision Helper BD

Offline bilingual (EN / \u09ac\u09be\u0982\u09b2\u09be) weighted decision helper. You define options,
criteria with weights, and scores \u2014 the tool computes totals, the ranking,
and which single weight change could flip the winner. It computes; it does
not decide for you.

## What it does

- **Decision editor:** title + optional question, 2\u20136 options, 1\u20136 criteria
  with weight 1\u20135 (e.g. Cost, Time, Risk, Benefit).
- **Scores:** each option scored 1\u201310 per criterion. Weighted totals update
  live: `total = sum(weight x score)`.
- **Results:** ranking with bars, winner highlight, lead over #2, full
  score breakdown (`weight x score` per cell).
- **Sensitivity:** for each criterion, the tool tests weight +1 / -1
  (clamped to 1\u20135) and honestly reports any change that would flip the
  winner. If none flips, it says so.
- **Pros & cons:** free-text pro/con list per option.
- **Saved decisions:** localStorage list (open / delete), JSON export /
  strict import, typed-DELETE erase-all.
- **BN/EN toggle** persisted, with Bengali digits in Bengali mode.
- **Print summary** via clean print CSS (results only).
- **Zero network requests.** Ships empty \u2014 no demo decisions.

## Honesty note

Scores are your own judgments. The tool only computes from the numbers you
enter. It never invents a recommendation, and the sensitivity note is a
mechanical re-computation, not advice.

## Stack

Vanilla HTML / CSS / JavaScript. No build step, no dependencies, no
framework. All state lives in the browser (localStorage).

## Run locally

Open `index.html` in any modern browser, or serve the folder:

```sh
npx serve .
```

## Testing

```sh
node tests/unit.test.js        # pure-logic tests
node tests/smoke.mjs           # headless-Chrome UI smoke (desktop)
node tests/smoke.mjs --mobile # headless-Chrome UI smoke (390px)
```

## Limitations

- Scores are subjective by design; garbage in, garbage out.
- Decisions live in one browser's localStorage; export JSON to move them.
- No collaboration, no cloud sync, no accounts.

## Status

Complete MVP. See TEST_RESULTS.md for verified test counts.
