# TEST_RESULTS — decision-helper-bd

## Unit tests (node)

Command: `node tests/unit.test.js`
Result: **12/12 passed**

- fixed case totals and winner (X=32, Y=33, winner Y, gap 1)
- fixed case sensitivity: both criteria can flip the winner (A 3->4 => X, B 2->1 => X)
- sensitivity skips out-of-range weights
- tie breaks by name ascending
- results render without title; save still requires it
- newDecision has valid defaults
- validation catches bad input
- criteria count limits enforced
- export/import round-trip
- import rejects garbage (bad JSON, wrong app/version, invalid decision, duplicate ids)
- clampInt behaves
- totalsFor with weight override

## Browser smoke tests (headless Chromium, file:// + raw CDP)

Command: `node tests/smoke.mjs` / `node tests/smoke.mjs --mobile`
Result: **17/17 desktop, 18/18 mobile (390px), 0 console/page errors**

Covers: title + honesty note, default tie -> Option A, fixed-case math via
live logic API, live score edit updates winner, add option/criterion,
pros/cons add + render, save -> saved list, export/import round-trip,
BN toggle (title + Bengali digits) and back to EN, typed-DELETE erase-all,
no horizontal overflow at 390px, zero page errors.

## Hand-verified math

Fixed case, 2 options x 2 criteria: A weight 3, B weight 2.
X: 3*8 + 2*4 = 32. Y: 3*5 + 2*9 = 33. Winner Y, gap 1.
Sensitivity: A 3->4 gives X=40, Y=38 (flips); B 2->1 gives X=28, Y=24
(flips). Both reported honestly by the tool.

## Repairs

1. Test-side: newDecision() defaults have an empty title; defaults test now
   sets a title before asserting full validation passes.
2. Test-side: smoke harness Chrome binary path — added
   /opt/meta-chromium/chrome as a candidate.
3. App (real UX fix): results were gated on full validation including the
   title, so a fresh decision showed only a validation error. Split
   validation into mathErrors() (options/criteria/scores) for live results
   and full validateDecision() (adds title/question) for saving. Results now
   compute live; saving still requires a title.
4. Test-side: smoke edit left a stray brace in unit.test.js; restored the
   missing check() opener.

## Hygiene

- Pure-ASCII sources: `grep -rP '[^\x00-\x7F]'` = 0 matches (Bengali
  strings stored as \uXXXX escapes in JS, decoded at runtime).
- No secrets anywhere. Zero network requests (offline app).
- All tests re-run green after the ASCII pass.
