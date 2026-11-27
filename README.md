https://260095411.github.io/long-fan-final-assessment/

# Long Fan — Critical Coding Practices — Final Assessment

**Prototype source repository:** https://github.com/260095411/long-fan-final-assessment

> This `final/` folder is the self-contained submission package inside my MA IE notebook repository
> (`2026-2027-long-fan`). The same `prototype/` and `evidence/` folders are mirrored in the dedicated
> repository above, which is the one GitHub Pages publishes. Submission files:
> `Long_Fan_Report.pdf` + `Long_Fan_Prototype.zip`.

---

## 1. Project overview & structure

**The Yes/No Contract** is an illustrative prototype about age assurance (age verification).
It follows one ordinary age gate — *"confirm your age to watch"* — and traces what the gate actually
exchanges. It does this for three different signals: a selfie, a photo ID and a credit card. Each runs a
different chain, with different fields, different parties and a different record left behind. A single
bit comes back in every case, and a person who is wrongly refused has no way to answer back.

Two arrangements of the same threshold, as the unit brief requires:

- **As deployed.** Three signals, each with its own chain, one decision, no visible record.
- **With a proof.** A reusable threshold claim, where the service stores only a valid/invalid proof.

The proof arrangement is *not* offered as a solution. It shows what changes and what does not: the first
capture still happens, the evaluator still exists, the binary answer still hides its own errors, and a
refused adult still has no appeal route.

### Folder structure

```
final/
├── README.md                     ← this file
├── SUBMISSION.md                 ← checklist for the two uploads
├── prototype/                    ← the prototype source (published to GitHub Pages)
│   ├── index.html                ← single page: gate, three signals, two views
│   ├── css/styles.css
│   └── js/
│       ├── app.js                ← renders the flow and runs the interaction
│       └── data/age-assurance-flow.js   ← dataset: methods, flow, views, evidence
├── evidence/                     ← what supports each claim
│   ├── README.md
│   ├── research-summary.md       ← research summary requested in tutorial
│   ├── data-flow-diagram.md      ← the three chains (selfie / ID / card), in text form
│   ├── testing-notes.md          ← 14 tests, 4 bugs found and fixed
│   ├── simulated-gate-attempts.csv
│   └── screenshots/              ← six rendered states
└── weekly-tasks/                 ← five tasks I produced in Weeks 3–7
    ├── README.md                 ← why these five
    ├── week-3/                   ← click recorder + Python parsing + observations
    ├── week-4/                   ← archival indexing exercise
    ├── week-5/                   ← data centre walk + Street View + Python analysis
    ├── week-6/                   ← Flask news search: sort, relevance, filters
    └── week-7/                   ← prototype analysis + journey diagram
```

### What the viewer will see

The gate section is the interactive part. On the left, the gate itself runs the check: each click moves
it from the offer, to capture (camera window, document scan, card form), to the bank's challenge, to the
answer. On the right, the matching hop lights up, so the interface and the infrastructure move together.
The “Reveal the backend” switch adds, to each step, the fields on the wire, the record left behind, the
uncertainty, and the line in the real product that the step is copied from. A strip above the gate names
the product the current chain comes from (Yoti Age Estimation, Yoti's document check, Steam's UK card
check) and links to its documentation. After the gate, a short block of **Cases I met** (Instagram's age
check, WeChat's face check, Steam's card check), then **Three checks, three exchanges** (one paragraph on what the answer hides, then the
three-column comparison of the signals), **Notes** (why these three methods, where the hops come from,
and what the second arrangement changes), **Still unresolved** (six questions the three services raise
and do not answer) and **Sources** (the services quoted and the published material). Every reference is
linked on the page itself.

---

## 2. Software and requirements

The prototype is static. **No backend, no database, no build step, no package manager.**

| Requirement | Version | Needed for |
|---|---|---|
| A modern browser | Chrome, Edge, Firefox or Safari (2023+) | Viewing the prototype |
| Python 3 | 3.10+ | `weekly-tasks/week-3` parsing scripts and `week-5` analysis (standard library only) |
| Flask (optional) | any recent | Only if you want to run `weekly-tasks/week-6` locally |
| VS Code | any recent | Only for editing |

No API keys. No network access is required once the page has loaded.

---

## 3. Installation / setup

### Option 1 — the published link (recommended)

Open https://260095411.github.io/long-fan-final-assessment/. Nothing to install.

### Option 2 — run locally

1. Open `prototype/index.html` directly in a browser (double-click works), or:
   ```
   cd final/prototype
   python -m http.server 8000
   ```
   then open `http://localhost:8000`.

Direct opening works because the dataset is wrapped as a script rather than fetched as JSON
(browsers block `fetch` on `file://`).

### Option 3 — edit in VS Code

`File → Open Folder → final`, open `prototype/index.html`, install **Live Server** and click *Go Live*.

---

## 4. How to interact with the prototype

The gate on the left is not a picture: it is the check, and it is clicked through.

1. **Choose an age signal** — facial age estimation, photo ID, or payment instrument. The gate, the
   screens and the chain below it all change with the choice.
2. **Press the gate's own button** (“Take a selfie”, “Upload a photo ID”, “Add a payment method”). The
   gate moves to its next screen — camera window, document scan, card form, bank challenge — and the
   matching hop lights up on the right. Three to four clicks take you from the start of the check to
   its answer.
3. **Press “Reveal the backend.”** The hidden half of each hop fills in: who receives what, what is
   written where, which part of the process is only a policy statement, and the line in the real
   product — Yoti's or Steam's documentation — that the hop is copied from.
4. **Press “Run the check.”** The same sequence plays itself, for a demo or a screenshot.
5. **Press “Refuse an under-18.”** A 17-year-old is refused at the end of the check; the card chain
   adds a declined authorisation. The screen is the same one a 24-year-old refused by mistake would
   see — that is the point of the button.
6. **Switch to “With a proof.”** The gate asks for a proof instead of a face, a document or a card,
   and the chain shortens. Compare the table in section 3.

A state can be linked directly:
`?method=face|id|card&view=default|reworked&screen=1…5&reveal=1&demo=run|reject`.

---

## 5. Data storage

- Stores nothing: no cookies, no `localStorage`, no analytics, no identifiers.
- All data is simulated and lives in `prototype/js/data/age-assurance-flow.js`.
- No photographs, documents or personal details are requested or processed.

---

## 6. Known issues and troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| Sections appear empty | Data script failed to load | Keep `js/data/age-assurance-flow.js` in place; check the console |
| “Run the check” does nothing | JavaScript disabled, or opened in an editor preview | Enable JavaScript; use a real browser |
| GitHub Pages 404 | Deployment still running, or Pages set to “Deploy from a branch” | Check the Actions tab; must finish green |
| Flask tasks won't start | No API key in the `week-6` exercises | The tasks are kept as submitted coursework, not as runnable demos |

---

## 7. AI disclosure

Full statement in the report PDF. In short: the prototype's HTML/CSS/JavaScript scaffolding, interface
copy, and the first draft of the report were produced with an AI assistant (Doubao). The research
question, source selection, the choice of the two arrangements and the argument are mine, revised in my
own words. The five weekly tasks in `weekly-tasks/` are my own coursework from Weeks 3–7 and were not
generated for this submission. Every factual claim in the prototype is traceable to a cited source or is
labelled uncertain in the interface.

---

## 8. Reference list

- European Commission (2026) *Age verification*. Brussels: European Commission.
- Information Commissioner's Office (2021) *Age appropriate design: a code of practice for online services*. Wilmslow: ICO.
- Information Commissioner's Office (n.d.) *What is valid consent?* Wilmslow: ICO.
- Knight-Georgetown Institute (2026) *Age Assurance Online: A Technical Assessment of Current Systems and their Limitations*. Washington, DC: KGI.
- Ofcom (2026) *Age assurance duties under the Online Safety Act*. London: Ofcom.
- Ofcom and Information Commissioner's Office (2026) *Age assurance: a joint statement*. London: Ofcom.
- Rescorla, E., Arnao, Z. and Cooper, A. (2026) *Age Assurance Online: A Technical Assessment of Current Systems and their Limitations*. Washington, DC: Knight-Georgetown Institute.
- Steam (2026) *Age verification on Steam (UK)*. Valve.
- Yoti (2026) *Age verification: how it works*. Yoti.
