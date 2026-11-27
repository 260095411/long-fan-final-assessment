# Evidence folder

Everything here supports a claim made in the prototype or the report. Nothing here is a live capture
of a real person's data.

| File | What it is | What it supports |
|---|---|---|
| `README.md` | This index | — |
| `research-summary.md` | The short research summary requested in the Week 9 tutorial: what is known, what is contested, what remains open | The report's framing, and the choice of one specific issue |
| `data-flow-diagram.md` | The three chains in text form — selfie, photo ID and card — with fields, records and uncertainty per hop | Section 1 of the prototype; the claim that the three methods are not interchangeable |
| `testing-notes.md` | What was tested, how, and what each test showed | The testing and limitations section |
| `screenshots/` | Six rendered states: the interface alone, each of the three chains revealed, the credential view, and a false refusal | Visual record of the interface at each state |
| `simulated-gate-attempts.csv` | The dataset used by the Week 3 Python task (copied here for traceability) | The refusal-rate argument |

## Screenshots

| File | State |
|---|---|
| `01-gate-interface-only.png` | The gate as it opens: one offer, a masked backend, and the first hop already lit |
| `02-selfie-chain-revealed.png` | After one click: the camera screen on the left, hop 2 on the right, backend revealed |
| `03-photo-id-chain-revealed.png` | Yoti document check, at the document-and-selfie screen, backend revealed |
| `04-card-chain-revealed.png` | Steam (UK) card check, at the issuing-bank challenge screen, backend revealed |
| `05-credential-view.png` | “With a proof”: the wallet screen showing a proof (over 18, scope, expiry) and the shortened chain |
| `06-under-18-refusal.png` | A 17-year-old refused at the end of the check; the screen is the same one an adult refused by mistake sees |

## What this folder deliberately does not contain

- No photographs of faces, no identity documents, no real names.
- No network captures from a live service. The chains are modelled on published documentation and
  labelled as a simulation wherever the evidence stops.
- No screenshots of a real age gate. Reproducing a commercial interface would raise the same
  consent problem the project is about.
