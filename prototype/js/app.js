/* The Yes/No Contract — prototype logic.

   Three signals, each with its own chain. The left panel is the gate itself: it is clickable,
   and every click moves both the gate screen and the hop shown on the right.
   Each hop has two halves: what the visitor sees, and what runs behind it (hidden until revealed).

   No network calls, no storage, no identifiers. */

let DATA = null;

const state = {
  method: "face",      // face | id | card
  view: "default",     // "default" (View A) or "reworked" (View B)
  revealed: false,
  running: false,
  rejected: false,
  screen: 0            // index into the screen list for the current method + view
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ---------- 1. Load ---------- */
function init() {
  DATA = window.AGE_FLOW;

  // Reproducible states: index.html?method=card&view=reworked&demo=run&reveal=1
  const params = new URLSearchParams(location.search);
  const m = params.get("method");
  if (m && DATA.methods.some((x) => x.id === m)) state.method = m;

  const view = params.get("view");
  if (view === "reworked" || view === "default") state.view = view;

  if (params.get("reveal") === "1") state.revealed = true;
  if (params.has("demo")) document.body.classList.add("no-anim");

  renderMethods();
  renderStaticSections();
  renderFlow();

  const scr = params.get("screen");
  if (scr) {
    const n = Math.max(0, Math.min(parseInt(scr, 10) - 1, screensFor(state.method, state.view).length - 1));
    if (!Number.isNaN(n)) state.screen = n;
  }
  renderScreen();
  bindControls();
  applyReveal();
  syncChips();
  $$(".seg").forEach((b) => b.classList.toggle("is-active", b.dataset.view === state.view));

  const demo = params.get("demo");
  if (demo === "run") setTimeout(() => playScreens(true), 200);
  else if (demo === "reject") setTimeout(simulateRejection, 200);

  // Keep deep links working in headless renders as well as in a browser.
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) {
      setTimeout(() => {
        const y = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: y, behavior: "auto" });
      }, 400);
    }
  }
}

/* ---------- 2. Data helpers ---------- */
function currentMethod() {
  return DATA.methods.find((x) => x.id === state.method);
}
function currentFlow() {
  return currentMethod().flow[state.view];
}
function currentChain() {
  return currentMethod().chain[state.view];
}
function providerName() {
  const m = currentMethod();
  const ref = state.view === "default" ? m.reference : (m.reference_b || m.reference);
  return ref ? ref.label : "the provider";
}

/* ---------- 3. Method chips ---------- */
function renderMethods() {
  const box = $("#method-chips");
  box.innerHTML = "";
  DATA.methods.forEach((m) => {
    const b = document.createElement("button");
    b.className = "chip" + (m.id === state.method ? " is-active" : "");
    b.textContent = m.chip;
    b.dataset.id = m.id;
    b.setAttribute("role", "tab");
    b.addEventListener("click", () => {
      if (state.method === m.id) return;
      state.method = m.id;
      syncChips();
      resetFlow();
      renderFlow();
      renderScreen();
    });
    box.append(b);
  });
}

function syncChips() {
  $$(".chip").forEach((c) => c.classList.toggle("is-active", c.dataset.id === state.method));
}

/* ---------- 4. The gate as a clickable flow ---------- */

/* Each screen is one thing the visitor does, and it lights up the hop it belongs to. */
function screensFor(methodId, view) {
  const S = {
    "face:default": [
      { kind: "start", step: 1, cta: "Take a selfie" },
      { kind: "cam", step: 2, title: "Hold still", copy: "The camera is running. Frames are being sent to the estimation provider.", cta: "Continue" },
      { kind: "proc", step: 3, title: "Estimating", copy: "The estimate is being turned into an over/under answer.", cta: "See the answer" },
      { kind: "result", step: 4 }
    ],
    "face:reworked": [
      { kind: "start", step: 1, cta: "Set up a reusable ID" },
      { kind: "setup", step: 1, title: "One-time setup", copy: "A selfie and an email address, once, with the issuer.", cta: "Create my ID" },
      { kind: "wallet", step: 2, title: "Your credential", copy: "Over 18 · this site only · expires in a year.", cta: "Share the proof" },
      { kind: "proc", step: 3, title: "Proving", copy: "The site checks the signature. It never sees the face.", cta: "See the answer" },
      { kind: "result", step: 4 }
    ],
    "id:default": [
      { kind: "start", step: 1, cta: "Upload a photo ID" },
      { kind: "doc", step: 2, title: "Photograph your document", copy: "Then a selfie, so the checker can match the face to the document.", cta: "Submit both" },
      { kind: "proc", step: 3, title: "Checking", copy: "The document is being checked for authenticity and matched to the selfie.", cta: "See the answer" },
      { kind: "result", step: 4 }
    ],
    "id:reworked": [
      { kind: "start", step: 1, cta: "Scan once, with an issuer" },
      { kind: "doc", step: 1, title: "Scan the document once", copy: "In the issuer's app. After this, the document is not needed again.", cta: "Issue the credential" },
      { kind: "wallet", step: 2, title: "Your credential", copy: "Over 18 · no birth date · expires in a year.", cta: "Share the proof" },
      { kind: "proc", step: 3, title: "Proving", copy: "The site checks the issuer's signature.", cta: "See the answer" },
      { kind: "result", step: 4 }
    ],
    "card:default": [
      { kind: "start", step: 1, cta: "Add a payment method" },
      { kind: "cardform", step: 1, title: "Add a payment method", copy: "Card number, expiry, CVV, name and billing address.", cta: "Continue" },
      { kind: "proc", step: 2, title: "Authorising", copy: "A £1 test authorisation. Steam does not collect it.", cta: "Continue" },
      { kind: "otp", step: 3, title: "Your bank asks", copy: "One-time code, or approval in the bank's own app.", cta: "Approve" },
      { kind: "result", step: 4 }
    ],
    "card:reworked": [
      { kind: "start", step: 1, cta: "Prove it with your bank" },
      { kind: "bankapp", step: 1, title: "Your bank's app", copy: "“Share only that you are over 18.”", cta: "Share" },
      { kind: "wallet", step: 2, title: "Attestation issued", copy: "Over 18. No balance, no transactions, no birth date.", cta: "Use it here" },
      { kind: "proc", step: 3, title: "Proving", copy: "The site checks the bank's signature.", cta: "See the answer" },
      { kind: "result", step: 4 }
    ]
  };
  return S[`${methodId}:${view}`] || S["face:default"];
}

function screenBlockHTML(sc, m) {
  if (sc.kind === "result") {
    const pass = !state.rejected;
    return `<p class="gate-eyebrow">Restricted · 18+</p>
    <div class="gate-result ${pass ? "is-pass" : "is-fail"}">
      <strong>${pass ? (state.view === "default" ? "Verified" : "Proof accepted") : "We can’t confirm you’re over 18"}</strong>
      ${pass ? "Content unlocked." : "This decision cannot be reviewed here."}
    </div>`;
  }

  const visuals = {
    cam: `<div class="cam-frame"><span class="cam-label">camera window · frames sent to ${providerName()}</span><span class="cam-scan"></span></div>`,
    doc: `<div class="doc-frame"><div class="slot"><span>document</span></div><div class="slot"><span>selfie</span></div></div>`,
    cardform: `<div class="card-skel"><span>card number</span><span>MM / YY</span><span>CVV</span><span class="wide">name · billing address</span></div>`,
    proc: `<div class="proc-dots"><i></i><i></i><i></i></div>`,
    otp: `<div class="otp-row"><b>·</b><b>·</b><b>·</b><b>·</b><b>·</b><b>·</b><span>code from your bank</span></div>`,
    wallet: `<div class="proof-card"><b>over 18</b><span>scope: reading-room.example</span><span>expires: 1 year</span></div>`,
    setup: `<div class="proof-card"><b>one selfie</b><span>one email</span><span>once</span></div>`,
    bankapp: `<div class="proof-card bank"><b>your bank</b><span>share only “over 18”</span><span>no balance, no transactions</span></div>`
  };

  const title = sc.title || "Confirm your age to watch";
  const copy = sc.copy || (state.view === "default" ? m.gate_copy_a : m.gate_copy_b);

  return `<p class="gate-eyebrow">Restricted · 18+</p>
    <h3>${title}</h3>
    <p class="gate-copy">${copy}</p>
    ${visuals[sc.kind] || ""}
    <button class="btn btn-primary gate-next" data-next>${sc.cta || "Continue"}</button>`;
}

function renderScreen() {
  const m = currentMethod();
  const list = screensFor(state.method, state.view);
  const sc = list[Math.min(state.screen, list.length - 1)];
  const host = $("#gate-screen");
  host.className = "gate-screen is-" + sc.kind;
  host.innerHTML = screenBlockHTML(sc, m);

  const isResult = sc.kind === "result";
  const unlocked = isResult && !state.rejected;
  $("#gate-content").classList.toggle("is-locked", !unlocked);
  const note = document.querySelector(".locked-note");
  if (note) note.style.display = unlocked ? "none" : "";

  markProgress(isResult ? sc.step : sc.step);
  caption(sc, list.length);
}

function markProgress(step) {
  $$(".step").forEach((el, i) => {
    el.classList.toggle("is-on", i < step);
    el.classList.toggle("is-current", i === step - 1);
  });
  $$(".node").forEach((n, j) => n.classList.toggle("is-on", j <= Math.min(step - 1, $$(".node").length - 1)));
}

function caption(sc, total) {
  const m = currentMethod();
  const steps = currentFlow();
  if (sc.kind === "result") {
    const parties = new Set(steps.flatMap((s) => [s.from, s.to])).size;
    const records = steps.filter((s) => s.record).length;
    $("#stage-caption").innerHTML = state.rejected
      ? `<strong>${m.chip}</strong> · 17-year-old, ${m.id === "card" ? "card declined" : "returned under 18"} · refused at the gate; an adult refused by mistake sees this same screen`
      : `<strong>${m.chip}</strong> · ${steps.length} hops · ${parties} parties · ${records} records`;
    return;
  }
  const hop = steps[Math.min(sc.step - 1, steps.length - 1)];
  $("#stage-caption").innerHTML =
    `Screen ${state.screen + 1} of ${total} · hop ${sc.step} of ${steps.length} · <strong>${hop.from} → ${hop.to}</strong>`;
}

function nextScreen() {
  const list = screensFor(state.method, state.view);
  if (state.screen >= list.length - 1) return;
  state.screen += 1;
  state.rejected = state.screen === list.length - 1 ? state.rejected : false;
  renderScreen();
  updateMeters(currentFlow(), currentFlow().length);
}

/* ---------- 5. Render the flow ---------- */
function renderReference() {
  const m = currentMethod();
  const ref = state.view === "default" ? m.reference : (m.reference_b || m.reference);
  if (!ref) return;
  $("#ref-product").textContent = ref.label;
  $("#ref-detail").textContent = ref.detail;
  $("#ref-link").href = ref.url;
}

function renderFlow() {
  renderReference();

  $("#view-label").textContent =
    (state.view === "default" ? "As deployed" : "With a proof") + " · " + currentMethod().chip;

  const chain = currentChain();
  const chainEl = $("#flow-chain");
  chainEl.innerHTML = "";
  chain.forEach((label, i) => {
    const n = document.createElement("span");
    n.className = "node" + (i === 2 ? " is-third" : "");
    n.dataset.index = i;
    n.textContent = label;
    chainEl.append(n);
    if (i < chain.length - 1) {
      const a = document.createElement("span");
      a.className = "arrow";
      a.textContent = "→";
      chainEl.append(a);
    }
  });
  const loop = document.createElement("span");
  loop.className = "arrow loop";
  loop.title = "and back to the visitor";
  loop.textContent = "↺";
  chainEl.append(loop);

  const list = $("#flow-steps");
  list.innerHTML = "";
  currentFlow().forEach((s, i) => {
    const el = document.createElement("article");
    el.className = "step";
    el.dataset.index = i;
    const real = (DATA.stepReal || {})[`${state.method}:${state.view}:${s.n}`] || "";
    el.innerHTML = `
      <div class="step-head">
        <span class="step-index">${String(s.n).padStart(2, "0")}</span>
        <span class="step-route">${s.from} → ${s.to}</span>
      </div>
      <div class="step-grid">
        <div class="see-col">
          <span class="col-label">You see</span>
          <p class="see-text">${s.see}</p>
        </div>
        <div class="right-col">
          <div class="behind">
            <span class="col-label">Behind</span>
            <p class="step-action">${s.action}</p>
            <div class="fields"></div>
            <p class="step-note record"><b>Record</b> ${s.record}</p>
            <p class="step-note"><b>Uncertain</b> ${s.uncertain}</p>
            ${real ? `<p class="step-real"><b>In the product</b> ${real}</p>` : ""}
          </div>
          <div class="mask" aria-hidden="true">hidden · press “Reveal the backend”</div>
        </div>
      </div>`;
    const f = el.querySelector(".fields");
    s.fields.forEach((field) => {
      const chip = document.createElement("span");
      chip.className = "field";
      chip.textContent = field;
      f.append(chip);
    });
    list.append(el);
  });

  updateMeters(currentFlow(), currentFlow().length);
  updateGap();
  if ($("#gate-screen")) renderScreen();
}

/* ---------- 6. Reveal ---------- */
function updateGap() {
  const steps = currentFlow();
  const parties = new Set(steps.flatMap((s) => [s.from, s.to])).size;
  const records = steps.filter((s) => s.record).length;
  $("#flow-gap").innerHTML = state.revealed
    ? `<strong>${steps.length} hops</strong> · ${parties} parties · ${records} records`
    : `<strong>${steps.length} hops</strong> · ${parties} parties · ${records} records behind the gate`;
}

function applyReveal() {
  $("#stage").classList.toggle("reveal", state.revealed);
  const btn = $("#reveal");
  btn.textContent = state.revealed ? "Hide the backend" : "Reveal the backend";
  btn.setAttribute("aria-pressed", String(state.revealed));
}

function setReveal(on) {
  state.revealed = on;
  applyReveal();
  updateGap();
}

/* ---------- 7. Meters ---------- */
function updateMeters(steps, revealed) {
  const shown = steps.slice(0, revealed);
  const allFields = new Set();
  shown.forEach((s) => s.fields.forEach((f) => allFields.add(f)));
  const parties = new Set(shown.flatMap((s) => [s.from, s.to])).size;
  const records = shown.filter((s) => s.record).length;
  $("#meter-fields").textContent = allFields.size;
  $("#meter-parties").textContent = parties;
  $("#meter-records").textContent = records;
  $("#meter-denied").textContent = state.rejected ? 1 : 0;
}

/* ---------- 8. Run / reset / false rejection ---------- */
function resetFlow() {
  state.running = false;
  state.rejected = false;
  state.screen = 0;
  $$(".step").forEach((s) => s.classList.remove("is-on"));
  $$(".node").forEach((n) => n.classList.remove("is-on"));
  if ($("#gate-screen")) renderScreen();
  updateMeters(currentFlow(), 0);
  $("#meter-denied").textContent = 0;
  $("#stage-caption").innerHTML =
    `Screen 1 of ${screensFor(state.method, state.view).length} · press the button in the gate to go on.`;
}

function playScreens(instant) {
  if (state.running) return;
  state.running = true;
  state.rejected = false;
  const list = screensFor(state.method, state.view);
  const gap = instant ? 60 : 700;
  for (let i = 1; i < list.length; i += 1) {
    setTimeout(() => {
      state.screen = i;
      state.rejected = false;
      renderScreen();
      updateMeters(currentFlow(), currentFlow().length);
      if (i === list.length - 1) state.running = false;
    }, gap * i);
  }
}

function simulateRejection() {
  const list = screensFor(state.method, state.view);
  state.rejected = true;
  state.screen = list.length - 1;
  state.running = false;
  renderScreen();
  $("#meter-denied").textContent = 1;
  updateMeters(currentFlow(), currentFlow().length);
}

/* ---------- 9. The comparison table ---------- */
function renderStaticSections() {
  const cases = DATA.cases || [];
  const host = $("#case-list");
  if (host) {
    host.innerHTML = cases.map((c) => `
      <div class="case">
        <strong>${c.service}</strong>
        <span>${c.met}</span>
        <span class="case-back">${c.back}</span>
      </div>`).join("");
  }

  $("#method-head").innerHTML = `<th>Dimension</th>` +
    DATA.comparison_methods.columns.map((c) => `<th>${c}</th>`).join("");
  $("#method-table").querySelector("tbody").innerHTML = DATA.comparison_methods.rows.map((r) => `
    <tr>
      <td><strong>${r.dimension}</strong></td>
      ${r.values.map((v) => `<td>${v}</td>`).join("")}
    </tr>`).join("");
  $("#method-reading").textContent = DATA.comparison_methods.reading;

  const qa = $("#unresolved-list");
  if (qa && DATA.unresolved) {
    qa.innerHTML = DATA.unresolved.map((u) => `
      <div class="qa">
        <p class="qa-q">${u.question}</p>
        <p class="qa-why">${u.detail}</p>
        <span class="qa-status">${u.status}</span>
      </div>`).join("");
  }

  const sg = $("#source-groups");
  if (sg && DATA.sourceGroups) {
    sg.innerHTML = DATA.sourceGroups.map((g) => `
      <div class="src-group">
        <h3>${g.group}</h3>
        <ol class="source-list">
          ${g.items.map((s) => `<li>${s.url ? `<a href="${s.url}" target="_blank" rel="noopener">${s.title}</a>` : s.title}
            <span class="note">— ${s.used_for}</span></li>`).join("")}
        </ol>
      </div>`).join("");
  }
}

/* ---------- 10. Controls ---------- */
function bindControls() {
  $("#run").addEventListener("click", () => { resetFlow(); playScreens(); });
  $("#reset").addEventListener("click", resetFlow);
  $("#wrong").addEventListener("click", simulateRejection);
  $("#reveal").addEventListener("click", () => setReveal(!state.revealed));

  // every gate screen advances on its own button
  $("#gate-screen").addEventListener("click", (e) => {
    if (e.target.closest("[data-next]")) nextScreen();
  });

  $$(".seg").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.view = btn.dataset.view;
      $$(".seg").forEach((b) => b.classList.toggle("is-active", b === btn));
      resetFlow();
      renderFlow();
    });
  });
}

init();
