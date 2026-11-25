/* The Yes/No Contract — prototype logic.
   Reads a local dataset (js/data/age-assurance-flow.js) and renders
   the simulated age-assurance flow.
   No network calls, no storage, no identifiers. */

let DATA = null;
let state = {
  method: "face",      // which age signal is selected
  view: "default",     // "default" (View A) or "reworked" (View B)
  running: false,
  rejected: false,     // has a false rejection been simulated?
  stepIndex: -1
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ---------- 1. Load data ---------- */
function init() {
  DATA = window.AGE_FLOW;

  renderMethods();
  renderStaticSections();
  renderGate();
  renderFlow();
  bindControls();
  $("#stage-caption").innerHTML = "Press <strong>Run the check</strong> to step through the exchange.";
}

/* ---------- 2. Method chips ---------- */
function renderMethods() {
  const box = $("#method-chips");
  box.innerHTML = "";
  box.append(...DATA.methods.map((m) => {
    const b = document.createElement("button");
    b.className = "chip" + (m.id === state.method ? " is-active" : "");
    b.textContent = m.name;
    b.dataset.id = m.id;
    b.addEventListener("click", () => {
      state.method = m.id;
      $$(".chip").forEach((c) => c.classList.toggle("is-active", c.dataset.id === m.id));
      renderGate();
      resetFlow();
    });
    return b;
  }));
}

/* ---------- 3. Gate panel ---------- */
function currentMethod() {
  return DATA.methods.find((m) => m.id === state.method);
}

function renderGate() {
  const m = currentMethod();
  $("#gate-title").textContent = "Confirm your age to watch";
  $("#gate-copy").textContent = state.view === "default"
    ? `We only receive a yes or no answer. Method: ${m.name.toLowerCase()}.`
    : `We only receive a proof that you are over ${DATA.meta.threshold}. Method: reusable credential.`;
  $("#gate-actions").innerHTML = "";
  const fields = ["Signal", "Consent"].map((t) => {
    const s = document.createElement("span");
    s.className = "ghost-field";
    s.textContent = t;
    return s;
  });
  const btn = document.createElement("button");
  btn.className = "btn btn-primary";
  btn.textContent = "Verify";
  btn.disabled = true;
  $("#gate-actions").append(...fields, btn);
}

/* ---------- 4. Flow data per view ---------- */
function flowForView() {
  if (state.view === "default") return DATA.flow;

  // View B: a threshold credential. Same threshold, fewer fields at the gate.
  return [
    {
      step: 1, from: "Visitor", to: "Evaluator",
      action: "Obtains a credential once",
      fields: ["document or face (once)", "email", "consent to issue"],
      evidence: "The capture still happens, once, with one chosen evaluator.",
      uncertainty: "Choice of evaluator is real only if more than one is accepted."
    },
    {
      step: 2, from: "Evaluator", to: "Visitor",
      action: "Issues a reusable proof",
      fields: ["over-18 proof", "scope", "expiry"],
      evidence: "The proof carries no date of birth and no image.",
      uncertainty: "The credential can still be joined to the account that holds it."
    },
    {
      step: 3, from: "Visitor", to: "Service",
      action: "Presents the proof at the gate",
      fields: ["proof", "signature", "timestamp"],
      evidence: "Fewer fields travel at the gate than in View A.",
      uncertainty: "The service learns that this account holds a credential, which is itself a record."
    },
    {
      step: 4, from: "Service", to: "Visitor",
      action: "Grants or denies access",
      fields: ["the page, or a refusal screen"],
      evidence: "A refused adult looks exactly like a correct refusal.",
      uncertainty: "No appeal route is defined by the proof itself."
    }
  ];
}

function chainForView() {
  return state.view === "default"
    ? ["Visitor", "Service", "Evaluator", "Evaluator storage", "Service", "Visitor"]
    : ["Visitor", "Evaluator", "Visitor", "Service", "Visitor"];
}

/* ---------- 5. Render flow ---------- */
function renderFlow() {
  const steps = flowForView();

  // chain of nodes
  const chain = $("#flow-chain");
  chain.innerHTML = "";
  chainForView().forEach((label, i) => {
    const n = document.createElement("span");
    n.className = "node" + (i === 2 || i === 3 ? " is-third" : "");
    n.dataset.index = i;
    n.textContent = label;
    chain.append(n);
    if (i < chainForView().length - 1) {
      const a = document.createElement("span");
      a.className = "arrow";
      a.textContent = "→";
      chain.append(a);
    }
  });

  // steps
  const list = $("#flow-steps");
  list.innerHTML = "";
  steps.forEach((s, i) => {
    const el = document.createElement("div");
    el.className = "step";
    el.dataset.index = i;
    el.innerHTML = `
      <div class="step-head">
        <span class="step-index">${String(s.step).padStart(2, "0")}</span>
        <span class="step-route">${s.from} → ${s.to}</span>
      </div>
      <p class="step-action">${s.action}</p>
      <div class="fields"></div>
      <p class="step-note"><b>Evidence:</b> ${s.evidence}</p>
      <p class="step-note"><b>Uncertain:</b> ${s.uncertainty}</p>`;
    const f = el.querySelector(".fields");
    s.fields.forEach((field) => {
      const chip = document.createElement("span");
      chip.className = "field";
      chip.textContent = field;
      f.append(chip);
    });
    list.append(el);
  });

  $("#view-label").textContent = DATA.views[state.view].label;
  updateMeters(steps, 0);
}

function updateMeters(steps, revealed) {
  const shown = steps.slice(0, revealed);
  const allFields = new Set();
  shown.forEach((s) => s.fields.forEach((f) => allFields.add(f)));
  $("#meter-fields").textContent = allFields.size;
  $("#meter-parties").textContent = state.view === "default" ? (revealed > 0 ? 3 : 0) : (revealed > 0 ? 2 : 0);
  $("#meter-records").textContent = state.view === "default"
    ? (revealed >= 4 ? 3 : revealed >= 2 ? 1 : 0)
    : (revealed >= 2 ? 2 : revealed >= 1 ? 1 : 0);
  $("#meter-denied").textContent = state.rejected ? 1 : 0;
}

/* ---------- 6. Run the animation ---------- */
function resetFlow() {
  state.running = false;
  state.stepIndex = -1;
  state.rejected = false;
  $("#gate-result").hidden = true;
  $("#gate-content").classList.add("is-locked");
  $$(".step").forEach((s) => s.classList.remove("is-on"));
  $$(".node").forEach((n) => n.classList.remove("is-on"));
  updateMeters(flowForView(), 0);
  $("#stage-caption").innerHTML = "Press <strong>Run the check</strong> to step through the exchange.";
}

function runCheck() {
  if (state.running) return;
  state.running = true;
  state.rejected = false;
  const steps = flowForView();
  const stepEls = $$(".step");
  const nodeEls = $$(".node");
  const delayed = (i) => 420 * (i + 1);

  steps.forEach((s, i) => {
    setTimeout(() => {
      stepEls[i]?.classList.add("is-on");
      nodeEls.forEach((n, j) => n.classList.toggle("is-on", j === Math.min(i, nodeEls.length - 1)));
      updateMeters(steps, i + 1);
      if (i === steps.length - 1) {
        finishCheck();
      }
    }, delayed(i));
  });
}

function simulateRejection() {
  state.rejected = true;
  $("#meter-denied").textContent = 1;
  $("#stage-caption").innerHTML =
    "The person is 24. The estimate returned <em>under 18</em>. Access is denied, and nothing in the interface distinguishes this from a correct refusal.";
  $("#gate-result").hidden = false;
  $("#gate-result").className = "gate-result is-fail";
  $("#gate-result").innerHTML = `
    <strong>We can't confirm you're over 18</strong>
    This decision cannot be reviewed here. Try again with a different method, or with a document you may not have.`;
  $("#gate-content").classList.add("is-locked");
}

function finishCheck() {
  state.running = false;
  $("#gate-result").hidden = false;
  $("#gate-result").className = "gate-result is-pass";
  $("#gate-result").innerHTML = state.view === "default"
    ? `<strong>Verified</strong> The evaluator returned a pass. The service stored the result against your visit, and the content is now unlocked.`
    : `<strong>Proof accepted</strong> The service checked a signature and stored only a valid state. The original capture stayed with the evaluator.`;
  $("#gate-content").classList.remove("is-locked");
  $("#stage-caption").innerHTML = state.view === "default"
    ? "Six hops, three parties, and a record. The bit arrived; the image and the refusal are invisible."
    : "Four hops and a proof. What disappeared was the document at the gate; what remained is the first capture, the record, and the silence of a refused adult.";
}

/* ---------- 7. Static sections ---------- */
function renderStaticSections() {
  // visible / hidden lists from the current view's data
  const visible = DATA.views.default.visible_to_visitor;
  const hidden = DATA.views.default.hidden_from_visitor;
  $("#visible-list").innerHTML = visible.map((v) => `<li>${v}</li>`).join("");
  $("#hidden-list").innerHTML = hidden.map((v) => `<li>${v}</li>`).join("");

  // comparison
  const tbody = $("#comparison-table tbody");
  tbody.innerHTML = DATA.comparison.rows.map((r) => `
    <tr>
      <td><strong>${r.dimension}</strong></td>
      <td>${r.default}<span class="note">${r.note}</span></td>
      <td>${r.reworked}</td>
    </tr>`).join("");
  $("#reading-note").textContent = DATA.comparison.reading;

  // evidence
  const ev = $("#evidence-table tbody");
  ev.innerHTML = DATA.evidence.map((e) => `
    <tr>
      <td>${e.claim}</td>
      <td>${e.source}<a class="src-link" href="${e.url}" target="_blank" rel="noopener">open source ↗</a></td>
      <td>${e.status}</td>
    </tr>`).join("");

  // unresolved
  $("#unresolved-list").innerHTML = DATA.unresolved.map((u) => `
    <div class="qa">
      <p class="qa-q">${u.question}</p>
      <p class="qa-why">${u.why}</p>
      <span class="qa-status">${u.status}</span>
    </div>`).join("");

  // sources
  $("#source-list").innerHTML = DATA.sources.map((s) => `
    <li>${s.title}. <a href="${s.url}" target="_blank" rel="noopener">${s.url}</a>
      <span class="note">Used for: ${s.used_for}</span></li>`).join("");
}

/* ---------- 8. Controls ---------- */
function bindControls() {
  $("#run").addEventListener("click", () => { resetFlow(); runCheck(); });
  $("#reset").addEventListener("click", resetFlow);
  $("#wrong").addEventListener("click", () => {
    resetFlow();
    simulateRejection();
  });

  // view switch
  $$(".seg").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.view = btn.dataset.view;
      $$(".seg").forEach((b) => b.classList.toggle("is-active", b === btn));
      renderGate();
      resetFlow();
      renderFlow();
    });
  });
}

init();
