# Testing notes

Tested on 25 November 2026. Browser: Microsoft Edge (Chromium) 158, Windows. The same build was then
verified on GitHub Pages.

## Functional tests

| # | Test | Expected | Result |
|---|---|---|---|
| 1 | Open `prototype/index.html` from disk | Page renders without a server | Pass — dataset is loaded as a script, so `fetch` is not needed |
| 2 | Load the published Pages URL | Same page, no console errors | Pass — HTTP 200; the deployment workflow completed green |
| 3 | Switch between the three age signals | Gate copy and flow fields change | Pass — the chip state and the gate paragraph update |
| 4 | Press “Run the check” (View A) | Six hops appear in order; meters rise | Pass — 6 steps, 3 parties, 3 records, 20 distinct fields |
| 5 | Press “Simulate a false rejection” | Refusal screen, adults-refused meter = 1 | Pass — the refusal is visually identical to a correct refusal |
| 6 | Switch to “View B · Credential” and run | Flow shortens to four hops; fewer fields | Pass — 4 steps, 2 parties, 2 records, 11 distinct fields |
| 7 | Reset | State returns to locked content, meters zeroed | Pass |
| 8 | Read section 3 against the dataset | Every claim has a source and a “what this establishes” line | Pass |
| 9 | Open `?demo=run` and `?demo=reject` | Reproducible states without clicking | Pass — used for the screenshots in this folder |
| 10 | Resize to 390 px width | Columns stack; no horizontal scroll | Pass |

## What each test demonstrated

- **Test 4 and 6 together** are the comparison. The number of fields at the gate falls from 20 to 11,
  which is the measurable part of the claim. What does not fall is the first capture, the evaluator,
  or the silence of a refusal.
- **Test 5** is the argument's load-bearing test. If a false refusal looked different from a correct
  one, the claim “the binary answer conceals the error” would be false. It does not look different,
  and the interface offers no route to contest it.
- **Test 8** is a paper test, not a code test. It checks that the prototype cannot make a claim the
  evidence folder does not support.

## Failures found and fixed during the build

1. **Dataset not loading from disk.** The first build read the dataset with `fetch`, which browsers block
   on `file://`. Fixed by wrapping the data as a script; the JSON is still the source of truth and is
   readable in `prototype/js/data/age-assurance-flow.js`.
2. **Contradictory copy after a pass.** The “content withheld” note stayed visible after verification.
   Fixed by hiding it when the gate returns a decision.
3. **`int` comparison error in the Week 3 Python task.** CSV values are strings; the comparison failed
   until cast. Fixed and re-run (20 rows, 11 refusals, 7 of them adults).

## Not tested, and why

- No real evaluator, provider contract or retention behaviour was tested. Doing so would require
  access this project does not have, and would involve real identity data.
- No user testing with adults who have failed a real age check. Their accounts would be the strongest
  evidence for the availability argument; interviews were out of scope and out of time.
- Error rates are not measured. The Week 3 dataset is simulated to show the *shape* of the problem
  (a refusal rate is not an error rate), not to estimate a real rate.
