# Long Fan — Critical Coding Practices — Final Assessment

**Working prototype (GitHub Pages):** https://260095411.github.io/long-fan-final-assessment/

> If the link is temporarily unavailable, GitHub Pages may still be building; the deployment status is visible in the repository's Actions tab.

---

## 1. Project overview & structure

**The Yes/No Contract** is an illustrative prototype about age assurance (age verification).
It follows one ordinary age gate — *"confirm your age to watch"* — and traces what the gate actually
exchanges: a face or a document leaves the browser, a third-party evaluator derives an age estimate
and keeps a record, the service receives a single bit, and a person who is wrongly refused has no way
to answer back.

The prototype shows two views of the same threshold, as the unit brief requires:

- **View A — As deployed.** One signal, one decision, no visible record.
- **View B — Same threshold, different arrangement.** A reusable threshold credential, where the
  service stores only a valid/invalid proof.

View B is *not* offered as a solution. It is there to show what changes, and what does not: the first
capture still happens, the evaluator still exists, the binary answer still hides its own errors, and a
refused adult still has no appeal route.

### Folder structure

```
long-fan-final-assessment/
├── README.md                     ← this file
├── prototype/                    ← the prototype source (published to GitHub Pages)
│   ├── index.html                ← the single page; five sections
│   ├── css/
│   │   └── styles.css            ← all styling
│   └── js/
│       ├── app.js                ← renders the flow, runs the interaction
│       └── data/
│           └── age-assurance-flow.js   ← the dataset (methods, flow, views, evidence)
├── evidence/                     ← testing notes, screenshots, evidence table
│   ├── README.md                 ← what each file is and what it supports
│   ├── testing-notes.md          ← what was tested and what it showed
│   ├── research-summary.md       ← the short research summary requested in tutorial
│   ├── data-flow-diagram.md      ← the six-hop flow in text form
│   └── screenshots/              ← rendered states of the prototype
├── weekly-tasks/                 ← five selected weekly tasks
│   ├── README.md                 ← why these five
│   ├── week-2-click-counter/
│   ├── week-3-record-clicks/
│   ├── week-3-python-analysis/
│   ├── week-6-ranked-search/
│   └── week-7-gate-wireframe/
└── .github/workflows/pages.yml   ← publishes prototype/ to GitHub Pages
```

### What the viewer will see

Five sections, in order: **the gate** (an interactive simulation of the exchange), **the issue**
(the specific problem the prototype investigates, plus the two-view comparison), **evidence**
(each claim tied to a source and to its limit), **unresolved** (questions the prototype raises and
cannot answer), and **sources**.

---

## 2. Software and requirements

The prototype is static. There is **no backend, no database, no build step, no package manager**.

| Requirement | Version | Needed for |
|---|---|---|
| A modern browser | Chrome, Edge, Firefox or Safari (2023 or later) | Viewing the prototype |
| Python 3 + `pandas` | 3.10+ | Only the `weekly-tasks/week-3-python-analysis` task |
| VS Code | any recent version | Only if you want to edit the code locally |

No libraries or packages are used by the prototype itself. No API keys. No network access is required
once the page has loaded.

---

## 3. Installation / setup

### Option 1 — use the published link (recommended)

Open https://260095411.github.io/long-fan-final-assessment/ in a browser. Nothing to install.

### Option 2 — run it locally

1. Download or clone the repository:
   ```
   git clone https://github.com/260095411/long-fan-final-assessment.git
   ```
2. Open `prototype/index.html` directly in a browser (double-click works), **or** serve the folder:
   ```
   cd long-fan-final-assessment/prototype
   python -m http.server 8000
   ```
   then open `http://localhost:8000`.
   Direct opening works because the dataset is wrapped as a script rather than fetched as JSON
   (browsers block `fetch` on `file://` URLs).

### Option 3 — edit in VS Code

1. Open the folder: `File → Open Folder → long-fan-final-assessment`.
2. Open `prototype/index.html`.
3. Recommended: install the **Live Server** extension and click *Go Live*, so changes reload automatically.

---

## 4. How to interact with the prototype

1. **Choose an age signal** — facial age estimation, photo ID, or payment instrument. Each changes the
   copy on the gate and the fields listed in the flow.
2. **Press “Run the check.”** The six hops animate in order. Each hop lists the fields on the wire, what
   the evidence supports, and what remains uncertain. The meters count fields, parties, records and
   adults refused.
3. **Press “Simulate a false rejection.”** The person is 24; the estimate returns *under 18*. Access is
   denied. The refusal screen is identical to a correct refusal, which is the point of the simulation.
4. **Switch to “View B · Credential.”** The flow shortens to four hops. Compare the table in section 2:
   fewer fields at the gate, but the first capture and the silence of a refusal remain.
5. **Read section 3** to check which claim each hop rests on, and section 4 for what the prototype
   cannot establish.

---

## 5. Data storage

- The prototype **stores nothing**. No cookies, no `localStorage`, no analytics, no identifiers.
- All data is simulated and lives in `prototype/js/data/age-assurance-flow.js`. It is a static object
  read at page load; nothing is written back to it.
- No photographs, documents or personal details are requested or processed. The “selfie” and “document”
  steps are described in text only.

---

## 6. Known issues and troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| Page appears but sections are empty | The data script failed to load (file moved, or the folder was renamed) | Keep `js/data/age-assurance-flow.js` in place; check the browser console |
| Nothing happens on “Run the check” | JavaScript disabled, or the file was opened through an editor preview that blocks scripts | Enable JavaScript; open in a real browser |
| GitHub Pages 404 | Pages deployment still running, or Pages is set to “Deploy from a branch” instead of “GitHub Actions” | Check the Actions tab; the workflow must finish green |
| Fonts look different | The stylesheet uses system fonts only; no web fonts are embedded | Expected; the design degrades gracefully |

---

## 7. AI disclosure

A summary is included in the report PDF. In short: the prototype's code scaffolding, the drafting of
interface copy, and the code for the five weekly tasks were produced with an AI assistant
(Doubao). The research question, the selection of sources, the choice of the two arrangements and the
argument in the report were directed and revised by me. Sources were checked against the
Knight-Georgetown Institute report (2026), Ofcom's age assurance guidance and the ICO's guidance.
No AI tool generated any claim that is not traceable to a cited source or labelled as uncertain in
the prototype.

---

## 8. Reference list

Harvard style; full list also appears in the prototype's Sources section.

- Competition and Markets Authority (2020) *Online platforms and digital advertising market study*. London: CMA.
- Information Commissioner's Office (2021) *Age appropriate design: a code of practice for online services*. Wilmslow: ICO.
- Information Commissioner's Office (2026) *What is valid consent?* Wilmslow: ICO.
- Knight-Georgetown Institute (2026) *Age Assurance Online: A Technical Assessment of Current Systems and their Limitations*. Washington, DC: KGI.
- Ofcom (2026) *Age assurance duties under the Online Safety Act*. London: Ofcom.
- Ofcom and Information Commissioner's Office (2026) *Age assurance: a joint statement*. London: Ofcom.
- Zuboff, S. (2019) *The Age of Surveillance Capitalism*. New York: PublicAffairs.
