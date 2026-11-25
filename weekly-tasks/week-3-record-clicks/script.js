// Week 3 — recording clicks as data.
// Week 2 counted. This one records: each click becomes an object with a
// number, a timestamp and an event name, saved in localStorage so a refresh
// does not erase the dataset.

const STORAGE_KEY = "week3-records";

const button = document.querySelector("#click-button");
const jsonButton = document.querySelector("#download-json");
const csvButton = document.querySelector("#download-csv");
const clearButton = document.querySelector("#clear");
const summary = document.querySelector("#summary");
const tbody = document.querySelector("#records-body");
const raw = document.querySelector("#raw");

// Restore saved records, or start from an empty array.
const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let count = records.length;

button.addEventListener("click", handleClick);
jsonButton.addEventListener("click", downloadJSON);
csvButton.addEventListener("click", downloadCSV);
clearButton.addEventListener("click", clearRecords);

function handleClick() {
  count = count + 1;

  const record = {
    count: count,
    time: new Date().toISOString(),
    event: "click"
  };

  records.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  render();
}

function render() {
  tbody.innerHTML = records.map((r) => `
    <tr><td>${r.count}</td><td>${r.count}</td><td>${r.time}</td><td>${r.event}</td></tr>
  `).join("");

  raw.textContent = JSON.stringify(records, null, 2);
  summary.textContent = records.length === 0
    ? "No records yet."
    : records.length + " record(s) stored in this browser. Exporting writes a file; nothing is sent anywhere.";
}

// A download is a local file, not a network request.
function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadJSON() {
  download("week3-records.json", JSON.stringify(records, null, 2), "application/json");
}

function downloadCSV() {
  const header = "count,time,event";
  const rows = records.map((r) => `${r.count},${r.time},${r.event}`);
  download("week3-records.csv", [header, ...rows].join("\n"), "text/csv");
}

function clearRecords() {
  records.length = 0;
  count = 0;
  localStorage.removeItem(STORAGE_KEY);
  render();
}

render();
