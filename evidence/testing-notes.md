# Testing notes

Tested on 26 November 2026. Browser: Microsoft Edge (Chromium) 158, Windows. The same build is then
verified on GitHub Pages after the source is pushed.

## Functional tests

| # | Test | Expected | Result |
|---|---|---|---|
| 1 | Open `prototype/index.html` from disk | Page renders without a server | Pass — dataset is loaded as a script, so `fetch` is not needed |
| 2 | Load the page over `http.server` | Same page, no console errors | Pass — HTTP 200 |
| 3 | Switch between the three age signals | A different chain appears, not a different label on the same chain | Pass — selfie 4 hops / 3 parties, photo ID 4 / 3, card 4 / 4 |
| 4 | Click through the gate screen by screen | Each click moves the gate on, and lights the matching hop on the right | Pass — 4 screens (selfie, ID) or 5 (card), hop count unchanged |
| 5 | Press “Reveal the backend” | Every step shows its fields, its record and its uncertainty | Pass |
| 6 | Click through the selfie chain, View A | 4 screens, 4 hops; 12 distinct fields; 3 parties; 4 records | Pass |
| 7 | Click through the photo-ID chain, View A | 4 screens, 4 hops; 11 fields; 3 parties; 4 records; document retained | Pass |
| 8 | Click through the card chain, View A | 5 screens (form, £1 authorisation, bank challenge), 4 hops; 10 fields; 4 parties; 4 records; no birth date returned | Pass |
| 9 | Switch to “View B · Credential” on each signal | The gate asks for a proof (wallet, bank app), not a face, document or card | Pass — 5 screens, 4 hops, 8–9 fields, 3 parties |
| 10 | Press “Refuse an under-18” | Refusal screen, refused-at-the-gate meter = 1 | Pass — the caption notes that an adult refused by mistake sees this same screen |
| 11 | Reset | State returns to the first screen, hops cleared, content locked | Pass |
| 12 | Read every hop's “In the product” line against the named product | No hop quotes a product that does not document that step | Pass — Yoti (selfie and document), Steam (card), MDN (the request itself) |
| 13 | Open `?method=id&view=reworked&screen=3&reveal=1` | A reproducible mid-check state without clicking | Pass — used for `screenshots/05-credential-view.png` |
| 14 | Resize to 760 px and to 390 px | Two-column steps stack; no horizontal scroll | Pass |
| 15 | Read every step against its named product | Each of the 24 steps carries an “In the product” line quoting the documented behaviour | Pass — Yoti (selfie and document), Steam (card), MDN (the request itself) |

## What each test demonstrated

- **Tests 6–8** are the argument the tutorial asked for: the three signals produce three different
  exchanges. The chain that returns a date of birth is not the chain that leaves a card token, and
  neither is the chain that deletes the images it used.
- **Test 4** is the one the tutorial asked for: the gate is not illustrated, it is operated. Clicking
  "Take a selfie" opens the camera screen and lights hop 2; clicking again returns the answer and
  lights hop 4. The interface and the infrastructure advance together, which is what makes the gap
  between them legible rather than described.
- **Test 10** is the load-bearing test. If a false refusal looked different from a correct one, the
  claim “the binary answer conceals the error” would be false. It does not look different, and the
  interface offers no route to contest it.
- **Test 12** is a paper test, not a code test. It checks that no hop claims more than the product it
  names actually documents.

## Failures found and fixed during the build

1. **Dataset not loading from disk.** The first build read the dataset with `fetch`, which browsers
   block on `file://`. Fixed by wrapping the data as a script; the dataset is still readable in
   `prototype/js/data/age-assurance-flow.js`.
2. **Contradictory copy after a pass.** The “content withheld” note stayed visible after verification.
   Fixed by hiding it when the gate returns a decision.
3. **One flow for three methods.** In the first version, switching the signal only changed the gate
   copy; the hops underneath were identical. This was the tutorial's main criticism and is fixed by
   giving each signal its own chain, its own fields and its own records.
4. **`int` comparison error in the Week 3 Python task.** CSV values are strings; the comparison failed
   until cast. Fixed and re-run (20 rows, 11 refusals, 7 of them adults).

## Not tested, and why

- No real evaluator, processor, bank or provider contract was tested. Doing so would require access
  this project does not have, and would involve real identity data.
- No user testing with adults who have failed a real age check. Their accounts would be the strongest
  evidence for the availability argument; interviews were out of scope and out of time.
- Error rates are not measured. The Week 3 dataset is simulated to show the *shape* of the problem
  (a refusal rate is not an error rate), not to estimate a real rate.
- The card chain is modelled on one published implementation. It is not a claim that every service
  runs the same steps, only that the steps are documented and repeatable.
