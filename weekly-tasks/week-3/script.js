// Week 3: record Like, Share and Comment clicks as structured data.
// We use a NEW storage key because the old Week 2 records did not identify
// which button was clicked. Assigning old clicks to a category would be misleading.
const STORAGE_KEY = "userActionDatasetV3";
const ACTIONS = ["like", "share", "comment"];
const REVIEW_STATUSES = ["approved", "flagged"];

// This is a RANDOM classroom label, not a real content-moderation decision.
function randomReviewStatus() {
  return Math.random() < 0.5 ? "approved" : "flagged";
}

function loadInteractions() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];

    // Keep all valid records. Earlier versions lack review_status: assign
    // their simulated label ONCE and save it so exports remain consistent.
    let upgraded = false;
    const valid = parsed.filter(item =>
      item && ACTIONS.includes(item.action) &&
      typeof item.time === "string" &&
      Number.isInteger(item.click_count) && item.click_count >= 1
    );
    const result = valid.map(item => {
      if (REVIEW_STATUSES.includes(item.review_status)) return item;
      upgraded = true;
      return { ...item, review_status: randomReviewStatus() };
    });
    if (upgraded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    }
    return result;
  } catch (error) {
    console.warn("Could not read saved interactions.");
    return [];
  }
}
const interactions = loadInteractions();
const counts = { like: 0, share: 0, comment: 0 };

// Rebuild totals from the actual records. The click_count in each new record
// is the running total for THAT action, not the total across all buttons.
for (const item of interactions) {
  counts[item.action] += 1;
}

function updateDisplay() {
  for (const action of ACTIONS) {
    document.getElementById(`${action}-count`).textContent = counts[action];
  }
  document.getElementById("total-count").textContent =
    `Total interactions: ${interactions.length}`;

  const body = document.getElementById("interactions-body");
  body.replaceChildren();

  if (interactions.length === 0) {
    const row = body.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 3;
    cell.textContent = "No clicks yet.";
    return;
  }

  // Only the eight latest rows are displayed, but exports include ALL rows.
  for (const item of interactions.slice(-8).reverse()) {
    const row = body.insertRow();
    row.insertCell().textContent = item.action;
    row.insertCell().textContent = item.click_count;
    row.insertCell().textContent = item.time;
  }
}

function recordAction(action) {
  counts[action] += 1;
  const record = {
    action: action,
    click_count: counts[action],
    time: new Date().toISOString(),
    review_status: randomReviewStatus()
  };

  interactions.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(interactions));
  // Log only the three visible fields as text (no expandable object/Prototype).
  console.log(`action: ${record.action}, click_count: ${record.click_count}, time: ${record.time}`);
  updateDisplay();
}

for (const action of ACTIONS) {
  document.getElementById(`${action}-button`)
    .addEventListener("click", () => recordAction(action));
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadJSON() {
  const json = JSON.stringify(interactions, null, 2);
  downloadFile(json, "user_interactions.json", "application/json;charset=utf-8");
}

function escapeCSV(value) {
  const text = String(value);
  if (/[",\r\n]/.test(text)) return '"' + text.replace(/"/g, '""') + '"';
  return text;
}

function downloadCSV() {
  const rows = ["action,click_count,time,review_status"];
  for (const item of interactions) {
    rows.push([item.action, item.click_count, item.time, item.review_status].map(escapeCSV).join(","));
  }
  downloadFile(rows.join("\r\n") + "\r\n", "user_interactions.csv", "text/csv;charset=utf-8");
}

document.getElementById("download-json-button")
  .addEventListener("click", downloadJSON);
document.getElementById("download-csv-button")
  .addEventListener("click", downloadCSV);

updateDisplay();
